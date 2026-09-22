// Compatibility path: analytic vertex morphing, without a compute simulation.
export function createFallback(
  canvas: HTMLCanvasElement,
  count: number,
  onContextLost?: (error: Error) => void,
) {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    powerPreference: 'low-power',
  });
  if (!gl) throw new Error('WebGL2 unavailable');
  const vs = `#version 300 es
precision highp float;
uniform vec4 frame;uniform vec4 view;uniform vec4 pointer;uniform float scroll;uniform vec4 trail[6];
out float alpha;out float softness;out vec3 tint;out vec2 direction;out float streak;
const float TAU=6.283185307;
float sampleHash(uint n){uint x=n*747796405u+2891336453u;x=((x>>((x>>28u)+4u))^x)*277803737u;x=(x>>22u)^x;return float(x>>8u)/16777216.;}
vec3 shape(vec3 k,float s){float u=k.x,v=k.y,l=k.z,a=u*TAU;
if(s<.5){float r=.85+.36*cos(a*3.+v*3.2)+.16*sin(v*TAU*1.5);float rib=(v-.5)*1.3;return vec3(cos(a)*(r+rib*.28),sin(a)*(r+rib*.28)*.89,sin(a*2.+v*2.)*.3+rib*.7+l*.015);}
if(s<1.5){if(v<.075&&l<3.){float t=v/.075;float x=(floor(u*5.)/4.-.5)*2.55+sin(t*3.14159)*.14,z=-.68+sin(t*3.14159)*.40;return vec3(x,(l-1.5+t)*.49+.17*sin(x*2.+z*1.8)+.19*x,z);}float x=(u-.5)*2.55,z=(v-.5)*1.65;return vec3(x,(l-1.5)*.49+.17*sin(x*2.+z*1.8)+.19*x,z);}
if(s<2.5){float angle=(u*1.68-.84)*3.14159,r=.72+.13*cos(v*TAU*1.5)+.02*l;return vec3(sin(angle)*r,(v-.5)*2.5,cos(angle)*r+.12*sin(v*7.));}
if(s>3.5){
 if(s<4.5){float a=(u*.76+.37)*TAU,b=acos(clamp(v*2.-1.,-1.,1.)),r=.65+l*.15;return vec3(cos(a)*sin(b)*r+l*scroll*.07,cos(b)*r*1.10,sin(a)*sin(b)*r*.85);}
 if(s<5.5){float b=v*TAU;vec3 c=vec3(sin(a)+2.*sin(2.*a),cos(a)-2.*cos(2.*a),-sin(3.*a))*.40;vec3 t=normalize(vec3(cos(a)+4.*cos(2.*a),-sin(a)+4.*sin(2.*a),-3.*cos(3.*a)));vec3 n=normalize(cross(t,vec3(0,0,1))),bv=cross(t,n);return c+(n*cos(b)+bv*sin(b))*(.12+l*.019);}
 if(s<6.5){float c=cos(a),d=sin(a),z=(l-1.5)*(.48+scroll*.14),r=1.+z*.10+(v-.5)*.075;vec2 edge=vec2(sign(c)*pow(abs(c),.22),sign(d)*pow(abs(d),.22));return vec3(edge.x*r,edge.y*r*.91,z);}
 if(s<7.5){float r=1.16+(v-.5)*.10,c=cos(a)*r,d=sin(a)*r;if(l<.5)return vec3(c,d*.86,0.);if(l<1.5)return vec3(c*.22,d*.88,c*.90);if(l<2.5)return vec3(c,d*.20,d*.90);return vec3(c*.78-d*.28,c*.42+d*.64,d*.65-c*.30);}
 if(s>8.5){float band=floor(l*.5),theta=(v-.5)*TAU*.92+band*3.14159+scroll*.22,r=.58+(u-.5)*.42,thickness=(l-band*2.-.5)*.025;return vec3(cos(theta)*r,(v-.5)*2.60,sin(theta)*r+thickness);}
 float theta=(u-.5)*TAU*.82,r=.18+v*1.25;return vec3(cos(theta)*r-.20,sin(theta)*r*.90,sin(theta*13.)*r*.13+(l-1.5)*.04);
}
vec3 cell=vec3(floor(u*5.)-2.,floor(v*5.)-2.,l-1.5);vec2 q=fract(vec2(u,v)*5.);return cell*.45+vec3(cos(q.x*TAU)*sin(q.y*3.14159),sin(q.x*TAU)*sin(q.y*3.14159),cos(q.y*3.14159))*.125;}
vec3 curl(vec3 q){return vec3(-sin(q.y)-cos(q.z),-sin(q.z)-cos(q.x),-sin(q.x)-cos(q.y));}
vec3 fieldMotion(vec3 q,vec3 k,float body,float drift){float t=frame.x;vec3 flow=curl(q*3.1+vec3(t*.15,t*.11,-t*.13)),detail=curl(q*7.4+vec3(-t*.12,t*.17,t*.09));float phase=k.x*TAU+k.y*9.;vec3 orbit=vec3(sin(t*.37+phase),cos(t*.31+phase*1.3),sin(t*.28-phase));return q+body*(flow*.058+detail*.018)+drift*(flow*.13+detail*.035+orbit*.22);}
vec3 living(vec3 k,float s,float drift){
 float t=frame.x;
 if(s>2.5&&s<3.5){vec3 cell=vec3(floor(k.x*5.)-2.,floor(k.y*5.)-2.,k.z-1.5);vec2 local=fract(k.xy*5.);float a=local.x*TAU+t*.18,b=local.y*3.14159,radius=.125+sin(t*.42+local.x*TAU)*.003;return fieldMotion(cell*.45+vec3(cos(a)*sin(b),sin(a)*sin(b),cos(b))*radius,k,0.,drift);}
 vec3 key=k;if(s<.5)key.x=fract(key.x+t*(.012+drift*.018));else if(s>4.5&&s<5.5||s>6.5&&s<7.5)key.x=fract(key.x+t*.009);else key.xy+=sin(vec2(t*.19+key.y*9.,t*.16+key.x*8.))*.009;
 vec3 q=fieldMotion(shape(key,s),k,s>3.5?.16:1.,drift);
 if(s>.5&&s<1.5)q.y+=(k.z-1.5)*scroll*.22;return q;
}
vec3 wake(vec2 at){
 float aspect=view.x/view.y;vec3 result=vec3(0.);
 for(int i=0;i<6;i++){vec4 item=trail[i];vec2 velocity=item.zw*vec2(aspect,1.),delta=(at-item.xy)*vec2(aspect,1.);float speed=length(velocity),radius=.11+min(speed,2.)*.028,influence=exp(-dot(delta,delta)/(radius*radius))*.30;result+=vec3(velocity*influence,speed*influence);}
 return vec3(result.xy/max(1.,length(result.xy)/1.2),min(result.z,1.6));
}
void main(){
 uint id=uint(gl_VertexID);vec3 k=vec3(sampleHash(id*2u+11u),sampleHash(id*2u+79u),float(id%4u));
 float drift=id%11u==0u?1.:0.;
 vec3 pos=mix(living(k,frame.y,drift),living(k,frame.z,drift),smoothstep(0.,1.,frame.w));
 float a=-.38+sin(frame.x*.17)*.13+scroll*.52,b=.16+sin(frame.x*.13)*.09-scroll*.24;
 vec3 r=vec3(pos.x*cos(a)+pos.z*sin(a),pos.y,-pos.x*sin(a)+pos.z*cos(a));vec3 q=vec3(r.x,r.y*cos(b)-r.z*sin(b),r.y*sin(b)+r.z*cos(b));
 float aspect=view.x/view.y,center=aspect<.8?.08:.30,scale=aspect<.8?.68:.72;
 vec2 projected=q.xy*vec2(scale/aspect,scale)*(3.6/(3.6-q.z*.42))+vec2(center,.02+sin(frame.x*.21)*.018);
 vec3 flow=wake(projected);vec2 delta=(projected-pointer.xy)*vec2(aspect,1.);
 float focus=exp(-dot(delta,delta)*58.)*pointer.z*.28+min(flow.z,1.)*.55;
 projected+=flow.xy*.115*(frame.z>2.5&&frame.z<3.5?drift:1.)/vec2(aspect,1.);
 softness=smoothstep(.12,1.12,abs(q.z-.10-sin(frame.x*.12)*.12))*(1.-min(focus,.85));float rand=sampleHash(id+193u);
 direction=normalize(flow.xy+vec2(.00001,0.));streak=1.+min(flow.z,1.)*(id%7u==0u?1.5:.25);
 gl_Position=vec4(projected,.5,1.);gl_PointSize=(.52+pow(rand,3.)*1.65+softness*(4.2+pow(rand,12.)*8.5))*2.*min(view.y/850.,1.7)*(1.+min(flow.z,1.)*.55)*streak;
 alpha=(.22+.55*sampleHash(id+713u))*(.90+.10*sin(frame.x*.4+rand*TAU))*(1.-softness*.86)*smoothstep(-.95,-.28,projected.x)*(1.+min(flow.z,1.)*1.20+focus*.12);
 alpha*=((frame.z>5.5&&frame.z<7.5||frame.z>8.5)&&id%11u!=0u)?.58:1.;
 tint=mix(vec3(.89,.91,.95),vec3(1.,.95,.82),min(flow.z,1.)*.18);
}`;
  const fs = `#version 300 es
precision highp float;in float alpha;in float softness;in vec3 tint;in vec2 direction;in float streak;out vec4 color;void main(){vec2 point=gl_PointCoord*2.-1.;point.y=-point.y;vec2 uv=vec2(dot(point,direction),dot(point,vec2(-direction.y,direction.x))*streak);float r=dot(uv,uv);if(r>1.)discard;color=vec4(tint,exp(-r*mix(3.6,2.1,softness))*alpha);}`;
  const shaders: WebGLShader[] = [];
  const releaseContext = () => gl.getExtension('WEBGL_lose_context')?.loseContext();
  function compile(type: number, source: string) {
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
      const vertex = compile(gl.VERTEX_SHADER, vs);
      const fragment = compile(gl.FRAGMENT_SHADER, fs);
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
  const f = gl.getUniformLocation(program, 'frame'),
    v = gl.getUniformLocation(program, 'view'),
    ptr = gl.getUniformLocation(program, 'pointer'),
    scr = gl.getUniformLocation(program, 'scroll'),
    tr = gl.getUniformLocation(program, 'trail[0]');
  let previous = 0,
    target = 0,
    start = 0,
    initialized = false;
  let disposed = false;
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onContextLost?.(new Error('WebGL context lost'));
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);
  return {
    frame(
      time: number,
      _dt: number,
      shape: number,
      x: number,
      y: number,
      active: number,
      width: number,
      height: number,
      _mode: number,
      still: boolean,
      scroll: number,
      trail: Float32Array,
    ) {
      if (gl.isContextLost()) throw new Error('WebGL context lost');
      if (!initialized) {
        previous = target = shape;
        initialized = true;
      }
      if (shape !== target) {
        previous = target;
        target = shape;
        start = time;
      }
      const progress = still ? 1 : Math.min(1, (time - start) / 0.8);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.047, 0.05, 0.06, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ZERO);
      gl.useProgram(program);
      gl.uniform4f(f, time, previous, target, progress);
      gl.uniform4f(v, width, height, 0, 0);
      gl.uniform4f(ptr, x, y, active, 0);
      gl.uniform1f(scr, scroll);
      gl.uniform4fv(tr, trail);
      gl.drawArrays(gl.POINTS, 0, count);
      return true;
    },
    particle_count: () => count,
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
