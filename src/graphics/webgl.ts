import { vertexShader, fragmentShader } from './webgl-shaders';

// Compatibility path: analytic vertex morphing, without a compute simulation.
export function createWebGLRenderer(
  canvas: HTMLCanvasElement,
  particleCount: number,
  onContextLost?: (error: Error) => void,
) {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    powerPreference: 'low-power',
  });
  if (!gl) throw new Error('WebGL2 unavailable');
  const shaders: WebGLShader[] = [];
  const releaseContext = () => gl.getExtension('WEBGL_lose_context')?.loseContext();
  function compileShader(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error('Shader allocation failed');
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      const error = gl!.getShaderInfoLog(shader);
      throw new Error(error ?? 'Shader compilation failed');
    }
    return shader;
  }
  const program = (() => {
    let result: WebGLProgram | null = null;
    try {
      const vertex = compileShader(gl.VERTEX_SHADER, vertexShader);
      const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
      result = gl.createProgram();
      if (!result) throw new Error('Program allocation failed');
      gl.attachShader(result, vertex);
      gl.attachShader(result, fragment);
      gl.linkProgram(result);
      if (!gl.getProgramParameter(result, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(result) ?? 'Link failed');
      return result;
    } catch (error) {
      if (result) gl.deleteProgram(result);
      releaseContext();
      throw error;
    } finally {
      shaders.forEach((shader) => gl.deleteShader(shader));
    }
  })();
  const frameUniform = gl.getUniformLocation(program, 'frame');
  const viewportUniform = gl.getUniformLocation(program, 'view');
  const pointerUniform = gl.getUniformLocation(program, 'pointer');
  const scrollUniform = gl.getUniformLocation(program, 'scroll');
  const trailUniform = gl.getUniformLocation(program, 'trail[0]');
  let previousShape = 0;
  let targetShape = 0;
  let transitionStarted = 0;
  let initialized = false;
  let disposed = false;
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onContextLost?.(new Error('WebGL context lost'));
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);
  return {
    frame(
      time: number,
      _deltaSeconds: number,
      shapeId: number,
      pointerX: number,
      pointerY: number,
      pointerStrength: number,
      width: number,
      height: number,
      _viewMode: number,
      still: boolean,
      scrollProgress: number,
      trail: Float32Array,
    ) {
      if (gl.isContextLost()) throw new Error('WebGL context lost');
      if (!initialized) {
        previousShape = targetShape = shapeId;
        initialized = true;
      }
      if (shapeId !== targetShape) {
        previousShape = targetShape;
        targetShape = shapeId;
        transitionStarted = time;
      }
      const progress = still ? 1 : Math.min(1, (time - transitionStarted) / 0.8);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.047, 0.05, 0.06, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ZERO);
      gl.useProgram(program);
      gl.uniform4f(frameUniform, time, previousShape, targetShape, progress);
      gl.uniform4f(viewportUniform, width, height, 0, 0);
      gl.uniform4f(pointerUniform, pointerX, pointerY, pointerStrength, 0);
      gl.uniform1f(scrollUniform, scrollProgress);
      gl.uniform4fv(trailUniform, trail);
      gl.drawArrays(gl.POINTS, 0, particleCount);
      return true;
    },
    particle_count: () => particleCount,
    state_bytes: () => 0,
    destroy() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      gl.deleteProgram(program);
      releaseContext();
    },
  };
}
