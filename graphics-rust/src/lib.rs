use bytemuck::Zeroable;
use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};
use wasm_bindgen::prelude::*;
use wgpu::util::DeviceExt;

#[repr(C)]
#[derive(Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
struct FrameUniforms {
    time: f32,
    delta_time: f32,
    shape: f32,
    particle_count: f32,
    pointer_position: [f32; 2],
    pointer_strength: f32,
    reset_particles: f32,
    viewport: [f32; 2],
    view_mode: f32,
    motion_strength: f32,
    scroll: f32,
    padding: [f32; 3],
    trail: [[f32; 4]; 6],
}

// WGSL uniform layout: four 16-byte groups followed by six pointer samples.
// Fail the build if a CPU-side edit moves a field across a GPU alignment boundary.
const _: () = {
    assert!(std::mem::size_of::<FrameUniforms>() == 160);
    assert!(std::mem::offset_of!(FrameUniforms, pointer_position) == 16);
    assert!(std::mem::offset_of!(FrameUniforms, viewport) == 32);
    assert!(std::mem::offset_of!(FrameUniforms, scroll) == 48);
    assert!(std::mem::offset_of!(FrameUniforms, trail) == 64);
};

/// GPU state is owned for the lifetime of the persistent canvas.
#[wasm_bindgen]
pub struct FieldRenderer {
    surface: wgpu::Surface<'static>,
    device: wgpu::Device,
    queue: wgpu::Queue,
    config: wgpu::SurfaceConfiguration,
    uniform_buffer: wgpu::Buffer,
    states: wgpu::Buffer,
    compute: wgpu::ComputePipeline,
    render: wgpu::RenderPipeline,
    compute_bind: wgpu::BindGroup,
    render_bind: wgpu::BindGroup,
    count: u32,
    initialized: bool,
    failed: Arc<AtomicBool>,
}
#[wasm_bindgen]
impl FieldRenderer {
    pub async fn create(
        canvas: web_sys::HtmlCanvasElement,
        count: u32,
    ) -> Result<FieldRenderer, JsValue> {
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: wgpu::Backends::BROWSER_WEBGPU,
            ..wgpu::InstanceDescriptor::new_without_display_handle()
        });
        let width = canvas.width().max(1);
        let height = canvas.height().max(1);
        let surface = instance
            .create_surface(wgpu::SurfaceTarget::Canvas(canvas))
            .map_err(js_error)?;
        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::LowPower,
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .map_err(js_error)?;
        let (device, queue) = adapter
            .request_device(&wgpu::DeviceDescriptor {
                label: Some("Field / Form"),
                ..Default::default()
            })
            .await
            .map_err(js_error)?;
        let failed = Arc::new(AtomicBool::new(false));
        let error_flag = failed.clone();
        device.on_uncaptured_error(Arc::new(move |error: wgpu::Error| {
            error_flag.store(true, Ordering::Relaxed);
            web_sys::console::error_1(&JsValue::from_str(&format!("GPU validation: {error}")));
        }));
        let lost_flag = failed.clone();
        device.set_device_lost_callback(move |reason, message| {
            if reason != wgpu::DeviceLostReason::Destroyed {
                lost_flag.store(true, Ordering::Relaxed);
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "GPU device lost: {message}"
                )));
            }
        });
        let error_scope = device.push_error_scope(wgpu::ErrorFilter::Validation);
        let mut config = surface
            .get_default_config(&adapter, width, height)
            .ok_or_else(|| JsValue::from_str("No compatible canvas format"))?;
        // Use the browser's linear canvas format: the shader authors display values.
        config.format = surface
            .get_capabilities(&adapter)
            .formats
            .iter()
            .copied()
            .find(|f| !f.is_srgb())
            .unwrap_or(config.format);
        config.alpha_mode = wgpu::CompositeAlphaMode::Opaque;
        surface.configure(&device, &config);
        let count = count.clamp(4096, 65536);
        let states = device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Position + velocity / GPU only"),
            size: count as u64 * 32,
            usage: wgpu::BufferUsages::STORAGE,
            mapped_at_creation: false,
        });
        let uniform_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Frame inputs / 160 bytes"),
            contents: bytemuck::bytes_of(&FrameUniforms::zeroed()),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });
        let module = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("Surface-aware GPU morph"),
            source: wgpu::ShaderSource::Wgsl(include_str!("field.wgsl").into()),
        });
        let compute = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
            label: Some("Integrate positions and velocities"),
            layout: None,
            module: &module,
            entry_point: Some("simulate"),
            compilation_options: Default::default(),
            cache: None,
        });
        let render = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Depth-aware point sprites"),
            layout: None,
            vertex: wgpu::VertexState {
                module: &module,
                entry_point: Some("vertex"),
                compilation_options: Default::default(),
                buffers: &[],
            },
            fragment: Some(wgpu::FragmentState {
                module: &module,
                entry_point: Some("fragment"),
                compilation_options: Default::default(),
                targets: &[Some(wgpu::ColorTargetState {
                    format: config.format,
                    blend: Some(wgpu::BlendState {
                        color: wgpu::BlendComponent {
                            src_factor: wgpu::BlendFactor::SrcAlpha,
                            dst_factor: wgpu::BlendFactor::One,
                            operation: wgpu::BlendOperation::Add,
                        },
                        alpha: wgpu::BlendComponent::REPLACE,
                    }),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
            }),
            primitive: Default::default(),
            depth_stencil: None,
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        let compute_bind = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("Compute state"),
            layout: &compute.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: uniform_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: states.as_entire_binding(),
                },
            ],
        });
        let render_bind = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("Render state"),
            layout: &render.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: uniform_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 2,
                    resource: states.as_entire_binding(),
                },
            ],
        });
        if let Some(error) = error_scope.pop().await {
            return Err(js_error(error));
        }
        Ok(Self {
            surface,
            device,
            queue,
            config,
            uniform_buffer,
            states,
            compute,
            render,
            compute_bind,
            render_bind,
            count,
            initialized: false,
            failed,
        })
    }
    pub fn frame(
        &mut self,
        time: f32,
        delta_seconds: f32,
        shape: f32,
        pointer_x: f32,
        pointer_y: f32,
        pointer_strength: f32,
        width: u32,
        height: u32,
        mode: f32,
        still: bool,
        scroll: f32,
        trail: &[f32],
    ) -> Result<bool, JsValue> {
        if self.failed.load(Ordering::Relaxed) {
            return Err(JsValue::from_str("GPU device needs recovery"));
        }
        if width == 0 || height == 0 {
            return Ok(false);
        }
        if self.config.width != width || self.config.height != height {
            self.config.width = width;
            self.config.height = height;
            self.surface.configure(&self.device, &self.config);
        }
        let initial = if !self.initialized || still { 1.0 } else { 0.0 };
        let mut trail_data = [[0.; 4]; 6];
        for (dst, src) in trail_data.iter_mut().zip(trail.chunks_exact(4)) {
            dst.copy_from_slice(src);
        }
        let frame_uniforms = FrameUniforms {
            time,
            delta_time: delta_seconds.clamp(0., 0.033),
            shape,
            particle_count: self.count as f32,
            pointer_position: [pointer_x, pointer_y],
            pointer_strength,
            reset_particles: initial,
            viewport: [width as f32, height as f32],
            view_mode: mode,
            motion_strength: if still { 0. } else { 1. },
            scroll,
            padding: [0.; 3],
            trail: trail_data,
        };
        self.queue
            .write_buffer(&self.uniform_buffer, 0, bytemuck::bytes_of(&frame_uniforms));
        let output = match self.surface.get_current_texture() {
            wgpu::CurrentSurfaceTexture::Success(o)
            | wgpu::CurrentSurfaceTexture::Suboptimal(o) => o,
            wgpu::CurrentSurfaceTexture::Outdated => {
                self.surface.configure(&self.device, &self.config);
                return Ok(false);
            }
            wgpu::CurrentSurfaceTexture::Timeout | wgpu::CurrentSurfaceTexture::Occluded => {
                return Ok(false);
            }
            other => {
                return Err(JsValue::from_str(&format!(
                    "Surface recovery required: {other:?}"
                )));
            }
        };
        let view = output.texture.create_view(&Default::default());
        let mut encoder = self.device.create_command_encoder(&Default::default());
        {
            let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
                label: Some("Morph simulation"),
                timestamp_writes: None,
            });
            pass.set_pipeline(&self.compute);
            pass.set_bind_group(0, &self.compute_bind, &[]);
            pass.dispatch_workgroups(self.count.div_ceil(128), 1, 1);
        }
        {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Particle field"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    depth_slice: None,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color {
                            r: 0.047,
                            g: 0.050,
                            b: 0.060,
                            a: 1.,
                        }),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });
            pass.set_pipeline(&self.render);
            pass.set_bind_group(0, &self.render_bind, &[]);
            pass.draw(0..6, 0..self.count);
        }
        self.queue.submit([encoder.finish()]);
        output.present();
        self.initialized = true;
        Ok(true)
    }
    pub fn particle_count(&self) -> u32 {
        self.count
    }
    pub fn state_bytes(&self) -> u32 {
        self.count * 32
    }
    pub fn destroy(&mut self) {
        self.states.destroy();
        self.uniform_buffer.destroy();
        self.device.destroy();
    }
}
fn js_error(e: impl std::fmt::Display) -> JsValue {
    JsValue::from_str(&e.to_string())
}
