// Keep this layout in sync with FrameUniforms in lib.rs (160 bytes).
struct FrameUniforms {
  time: f32,
  delta_time: f32,
  shape: f32,
  particle_count: f32,
  pointer_position: vec2f,
  pointer_strength: f32,
  reset_particles: f32,
  viewport: vec2f,
  view_mode: f32,
  motion_strength: f32,
  scroll: f32,
  padding0: f32,
  padding1: f32,
  padding2: f32,
  trail: array<vec4f, 6>
}

struct Particle {
  position: vec4f,
  velocity: vec4f
}

@group(0) @binding(0) var<uniform> inputs: FrameUniforms;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(2) var<storage, read> render_particles: array<Particle>;
const TAU: f32 = 6.283185307;
fn hash(n: f32) -> f32 {
  return fract(sin(n * 127.1 + 311.7) * 43758.5453);
}

// A shared two-dimensional parameterization gives every sample a stable identity.
fn surface(uv: vec2f, layer: f32, shape: f32) -> vec3f {
  let u = uv.x;
  let v = uv.y;
  let a = u * TAU;
  // Folded field
  if shape < 0.5 {
    let r = 0.85 + 0.36 * cos(a * 3.0 + v * 3.2) + 0.16 * sin(v * TAU * 1.5);
    let ribbon = (v - 0.5) * 1.3;
    return vec3f(
      cos(a) * (r + ribbon * 0.28),
      sin(a) * (r + ribbon * 0.28) * 0.89,
      sin(a * 2.0 + v * 2.0) * 0.30 + ribbon * 0.70 + layer * 0.015
    );
  }
  // Layered surfaces
  if shape < 1.5 {
    if v < 0.075 && layer < 3.0 {
      let t = v / 0.075;
      let x = (floor(u * 5.0) / 4.0 - 0.5) * 2.55 + sin(t * 3.14159) * 0.14;
      let z = -0.68 + sin(t * 3.14159) * 0.40;
      let y = (layer - 1.5 + t) * 0.49 + 0.17 * sin(x * 2.0 + z * 1.8) + 0.19 * x;
      return vec3f(x, y, z);
    }
    let x = (u - 0.5) * 2.55;
    let z = (v - 0.5) * 1.65;
    let y = (layer - 1.5) * 0.49 + 0.17 * sin(x * 2.0 + z * 1.8) + 0.19 * x;
    return vec3f(x, y, z);
  }
  // Open shell
  if shape < 2.5 {
    let angle = (u * 1.68 - 0.84) * 3.14159;
    let r = 0.72 + 0.13 * cos(v * TAU * 1.5) + 0.02 * layer;
    return vec3f(sin(angle) * r, (v - 0.5) * 2.5, cos(angle) * r + 0.12 * sin(v * 7.0));
  }
  if shape > 3.5 {
    // Nested shells
    if shape < 4.5 {
      let a = (u * 0.76 + 0.37) * TAU;
      let b = acos(clamp(v * 2.0 - 1.0, -1.0, 1.0));
      let r = 0.65 + layer * 0.15;
      return vec3f(
        cos(a) * sin(b) * r + layer * inputs.scroll * 0.07,
        cos(b) * r * 1.10,
        sin(a) * sin(b) * r * 0.85
      );
    }
    // Woven loop
    if shape < 5.5 {
      let a = u * TAU;
      let b = v * TAU;
      let c = vec3f(sin(a) + 2.0 * sin(2.0 * a), cos(a) - 2.0 * cos(2.0 * a), -sin(3.0 * a)) * 0.40;
      let t = normalize(vec3f(
        cos(a) + 4.0 * cos(2.0 * a),
        -sin(a) + 4.0 * sin(2.0 * a),
        -3.0 * cos(3.0 * a)
      ));
      let n = normalize(cross(t, vec3f(0, 0, 1)));
      let bvec = cross(t, n);
      return c + (n * cos(b) + bvec * sin(b)) * (0.12 + layer * 0.019);
    }
    // Spatial frames
    if shape < 6.5 {
      let c = cos(a);
      let d = sin(a);
      let edge = vec2f(sign(c) * pow(abs(c), 0.22), sign(d) * pow(abs(d), 0.22));
      let z = (layer - 1.5) * (0.48 + inputs.scroll * 0.14);
      let r = 1.0 + z * 0.10 + (v - 0.5) * 0.075;
      return vec3f(edge.x * r, edge.y * r * 0.91, z);
    }
    // Crossing orbits
    if shape < 7.5 {
      let r = 1.16 + (v - 0.5) * 0.10;
      let c = cos(a) * r;
      let d = sin(a) * r;
      if layer < 0.5 {
        return vec3f(c, d * 0.86, 0.0);
      }
      if layer < 1.5 {
        return vec3f(c * 0.22, d * 0.88, c * 0.90);
      }
      if layer < 2.5 {
        return vec3f(c, d * 0.20, d * 0.90);
      }
      return vec3f(c * 0.78 - d * 0.28, c * 0.42 + d * 0.64, d * 0.65 - c * 0.30);
    }
    // Braided ribbons
    if shape > 8.5 {
      let band = floor(layer * 0.5);
      let theta = (v - 0.5) * TAU * 0.92 + band * 3.14159 + inputs.scroll * 0.22;
      let r = 0.58 + (u - 0.5) * 0.42;
      let thickness = (layer - band * 2.0 - 0.5) * 0.025;
      return vec3f(cos(theta) * r, (v - 0.5) * 2.60, sin(theta) * r + thickness);
    }
    // Pleated fan
    let theta = (u - 0.5) * TAU * 0.82;
    let r = 0.18 + v * 1.25;
    return vec3f(
      cos(theta) * r - 0.20,
      sin(theta) * r * 0.90,
      sin(theta * 13.0) * r * 0.13 + (layer - 1.5) * 0.04
    );
  }
  // Repeated cells
  let cell = vec3f(floor(u * 5.0) - 2.0, floor(v * 5.0) - 2.0, layer - 1.5);
  let q = vec2f(fract(u * 5.0), fract(v * 5.0));
  return cell * 0.45 + vec3f(
    cos(q.x * TAU) * sin(q.y * 3.14159),
    sin(q.x * TAU) * sin(q.y * 3.14159),
    cos(q.y * 3.14159)
  ) * 0.125;
}

fn sample_hash(n: u32) -> f32 {
  var x = n * 747796405u + 2891336453u;
  x = ((x >> ((x >> 28u) + 4u)) ^ x) * 277803737u;
  x = (x >> 22u) ^ x;
  return f32(x >> 8u) / 16777216.0;
}

fn identity(id: u32) -> vec3f {
  return vec3f(sample_hash(id * 2u + 11u), sample_hash(id * 2u + 79u), f32(id % 4u));
}

// Slow rigid motion and scroll keep the object legible while revealing its depth.
fn angles() -> vec2f {
  return vec2f(
    -0.38 + sin(inputs.time * 0.17) * 0.13 + inputs.scroll * 0.52,
    0.16 + sin(inputs.time * 0.13) * 0.09 - inputs.scroll * 0.24
  );
}

fn rotate(q: vec3f) -> vec3f {
  let ab = angles();
  let a = ab.x;
  let b = ab.y;
  let r = vec3f(q.x * cos(a) + q.z * sin(a), q.y, -q.x * sin(a) + q.z * cos(a));
  return vec3f(r.x, r.y * cos(b) - r.z * sin(b), r.y * sin(b) + r.z * cos(b));
}

// Analytic curl of A=(sin(y)+cos(z), sin(z)+cos(x), sin(x)+cos(y)).
// Divergence is zero: each component is independent of its own coordinate.
fn curl(q: vec3f) -> vec3f {
  return vec3f(-sin(q.y) - cos(q.z), -sin(q.z) - cos(q.x), -sin(q.x) - cos(q.y));
}

// The sparse drifting population is independent of the form's deformation gain.
// Keeping these gains separate preserves precise shapes without hiding their atmosphere.
fn field_motion(q: vec3f, key: vec3f, body: f32, drift: f32) -> vec3f {
  let t = inputs.time;
  let flow = curl(q * 3.1 + vec3f(t * 0.15, t * 0.11, -t * 0.13));
  let detail = curl(q * 7.4 + vec3f(-t * 0.12, t * 0.17, t * 0.09));
  let phase = key.x * TAU + key.y * 9.0;
  let orbit = vec3f(sin(t * 0.37 + phase), cos(t * 0.31 + phase * 1.3), sin(t * 0.28 - phase));
  return q + (
    body * (flow * 0.058 + detail * 0.018) +
    drift * (flow * 0.13 + detail * 0.035 + orbit * 0.22)
  ) * inputs.motion_strength;
}

fn living_surface(key: vec3f, drift: f32) -> vec3f {
  let t = inputs.time;
  // Cell membership is immutable: animate local coordinates, never floor(uv).
  if inputs.shape > 2.5 && inputs.shape < 3.5 {
    let cell = vec3f(floor(key.x * 5.0) - 2.0, floor(key.y * 5.0) - 2.0, key.z - 1.5);
    let local = fract(key.xy * 5.0);
    let a = local.x * TAU + t * 0.18;
    let b = local.y * 3.14159;
    let radius = 0.125 + sin(t * 0.42 + local.x * TAU) * 0.003 * inputs.motion_strength;
    let q = cell * 0.45 + vec3f(cos(a) * sin(b), sin(a) * sin(b), cos(b)) * radius;
    return field_motion(q, key, 0.0, drift);
  }
  var uv = key.xy;
  if inputs.shape < 0.5 {
    uv.x = fract(uv.x + t * (0.012 + drift * 0.018));
  } else if (inputs.shape > 4.5 && inputs.shape < 5.5) || (inputs.shape > 6.5 && inputs.shape < 7.5) {
    uv.x = fract(uv.x + t * 0.009);
  } else {
    uv += sin(vec2f(t * 0.19 + uv.y * 9.0, t * 0.16 + uv.x * 8.0)) * 0.009;
  }
  var q = surface(uv, key.z, inputs.shape);
  let organic = select(1.0, 0.16, inputs.shape > 3.5);
  q = field_motion(q, key, organic, drift);
  if inputs.shape > 0.5 && inputs.shape < 1.5 {
    q.y += (key.z - 1.5) * inputs.scroll * 0.22;
  }
  return q;
}

fn project(q: vec3f) -> vec2f {
  let aspect = inputs.viewport.x / inputs.viewport.y;
  let center = select(0.30, 0.08, aspect < 0.8);
  let scale = select(0.72, 0.68, aspect < 0.8);
  return q.xy * vec2f(scale / aspect, scale) * (3.6 / (3.6 - q.z * 0.42)) +
    vec2f(center, 0.02 + sin(inputs.time * 0.21) * 0.018);
}

fn unrotate(q: vec3f) -> vec3f {
  let ab = angles();
  let a = ab.x;
  let b = ab.y;
  let r = vec3f(q.x, q.y * cos(b) + q.z * sin(b), -q.y * sin(b) + q.z * cos(b));
  return vec3f(r.x * cos(a) - r.z * sin(a), r.y, r.x * sin(a) + r.z * cos(a));
}

// A finite history gives local motion a direction and a decay after the pointer stops.
fn wake(at: vec2f) -> vec3f {
  let aspect = inputs.viewport.x / inputs.viewport.y;
  var result = vec3f(0);
  for (var i = 0u; i < 6u; i++) {
    let sample = inputs.trail[i];
    let velocity = sample.zw * vec2f(aspect, 1);
    let delta = (at - sample.xy) * vec2f(aspect, 1);
    let speed = length(velocity);
    let radius = 0.11 + min(speed, 2.0) * 0.028;
    let influence = exp(-dot(delta, delta) / (radius * radius)) * 0.30;
    result += vec3f(velocity * influence, speed * influence);
  }
  return vec3f(result.xy / max(1.0, length(result.xy) / 1.2), min(result.z, 1.6)) * inputs.motion_strength;
}

@compute @workgroup_size(128)
fn simulate(@builtin(global_invocation_id) invocation: vec3u) {
  let id = invocation.x;
  if id >= u32(inputs.particle_count) {
    return;
  }
  let key = identity(id);
  let drift = select(0.0, 1.0, id % 11u == 0u);
  let target_position = living_surface(key, drift);
  let du = living_surface(key + vec3f(0.001, 0, 0), drift) - target_position;
  let dv = living_surface(key + vec3f(0, 0.001, 0), drift) - target_position;
  let normal = normalize(cross(du, dv) + vec3f(0.000001));
  let breath = sin(inputs.time * 0.28 + key.x * 13.0 + key.y * 8.0) *
    0.024 * inputs.motion_strength * select(1.0, 0.0, inputs.shape > 2.5 && inputs.shape < 3.5);
  let goal = target_position + normal * breath;
  if inputs.reset_particles > 0.5 {
    particles[id].position = vec4f(goal, 1);
    particles[id].velocity = vec4f(0);
    return;
  }
  var pos = particles[id].position.xyz;
  var vel = particles[id].velocity.xyz;
  let diff = goal - pos;
  let normal_error = normal * dot(diff, normal);
  let flow = wake(project(rotate(pos)));
  let force = unrotate(vec3f(flow.xy, 0));
  let tangent_force = force - normal * dot(force, normal) * 0.80;
  let movable = select(1.0, drift, inputs.shape > 2.5 && inputs.shape < 3.5);
  let accel = diff * 78.0 + normal_error * 10.0 - vel * 16.0 + tangent_force * 25.0 * movable;
  vel += accel * inputs.delta_time;
  pos += vel * inputs.delta_time;
  // Recover an invalid simulation sample before it can poison later frames.
  // The surfaces fit within two units; these bounds leave room for morphs.
  if !all(abs(pos) < vec3f(6.0)) || !all(abs(vel) < vec3f(64.0)) {
    pos = goal;
    vel = vec3f(0);
  }
  particles[id].position = vec4f(pos, 1);
  particles[id].velocity = vec4f(vel, 0);
}

struct Varying {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) alpha: f32,
  @location(2) color: vec3f,
  @location(3) softness: f32
}

@vertex
fn vertex(@builtin(vertex_index) vertex_id: u32, @builtin(instance_index) id: u32) -> Varying {
  let corners = array<vec2f, 6>(
    vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1),
    vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1)
  );
  let key = identity(id);
  var pos = render_particles[id].position.xyz;
  if inputs.view_mode > 0.5 && inputs.view_mode < 1.5 {
    pos = surface(key.xy, key.z, inputs.shape);
  }
  let q = rotate(pos);
  let aspect = inputs.viewport.x / inputs.viewport.y;
  let projected = project(q);
  let flow = wake(projected);
  let delta = (projected - inputs.pointer_position) * vec2f(aspect, 1);
  let focus = exp(-dot(delta, delta) * 58.0) * inputs.pointer_strength * 0.28 + min(flow.z, 1.0) * 0.55;
  let defocus = smoothstep(0.12, 1.12, abs(q.z - 0.10 - sin(inputs.time * 0.12) * 0.12)) *
    (1.0 - min(focus, 0.85));
  let rand = sample_hash(id + 193u);
  let rare = pow(rand, 12.0);
  let radius = (0.52 + pow(rand, 3.0) * 1.65 + defocus * (4.2 + rare * 8.5)) *
    min(inputs.viewport.y / 850.0, 1.7) * (1.0 + min(flow.z, 1.0) * 0.55);
  let bright = (0.22 + 0.55 * sample_hash(id + 713u)) * (0.90 + 0.10 * sin(inputs.time * 0.4 + rand * TAU));
  var out: Varying;
  let direction = normalize(flow.xy + vec2f(0.00001, 0));
  let streak = 1.0 + min(flow.z, 1.0) * select(0.25, 1.5, id % 7u == 0u);
  let corner = corners[vertex_id];
  let offset = (direction * corner.x * streak + vec2f(-direction.y, direction.x) * corner.y) * radius;
  out.position = vec4f(projected + offset * 2.0 / inputs.viewport, 0.5, 1);
  out.uv = corners[vertex_id];
  out.softness = defocus;
  out.alpha = bright * (1.0 - defocus * 0.86) * smoothstep(-0.95, -0.28, projected.x) *
    (1.0 + min(flow.z, 1.0) * 1.20 + focus * 0.12);
  // Dense contours need less exposure; drifting samples retain their brightness.
  out.alpha *= select(
    1.0, 0.58,
    ((inputs.shape > 5.5 && inputs.shape < 7.5) || inputs.shape > 8.5) && id % 11u != 0u
  );
  out.color = mix(vec3f(0.89, 0.91, 0.95), vec3f(1.0, 0.95, 0.82), min(flow.z, 1.0) * 0.18);
  if inputs.view_mode > 1.5 {
    let speed = length(render_particles[id].velocity.xyz);
    out.color = mix(vec3f(0.38, 0.48, 0.62), vec3f(1.0, 0.84, 0.64), clamp(speed * 0.9, 0, 1));
    out.alpha = max(out.alpha, 0.16);
  }
  return out;
}

@fragment
fn fragment(v: Varying) -> @location(0) vec4f {
  let r = dot(v.uv, v.uv);
  if r > 1.0 {
    discard;
  }
  let core = exp(-r * mix(3.6, 2.1, v.softness));
  return vec4f(v.color, core * v.alpha);
}
