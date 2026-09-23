export const vertexShader = `#version 300 es
precision highp float;
// frame: time, previous shape, target shape, morph progress.
uniform vec4 frame;
// view.xy: viewport dimensions; pointer.xyz: position and strength.
uniform vec4 view;
uniform vec4 pointer;
uniform float scroll;
uniform vec4 trail[6];
out float alpha;
out float softness;
out vec3 tint;
out vec2 direction;
out float streak;
const float TAU = 6.283185307;

float sampleHash(uint n) {
  uint x = n * 747796405u + 2891336453u;
  x = ((x >> (x >> 28u) + 4u) ^ x) * 277803737u;
  x = (x >> 22u) ^ x;
  return float(x >> 8u) / 16777216.0;
}

vec3 surface(vec3 key, float formId) {
  float u = key.x,
    v = key.y,
    layer = key.z,
    a = u * TAU;
  // Folded field
  if (formId < 0.5) {
    float r = 0.85 + 0.36 * cos(a * 3.0 + v * 3.2) + 0.16 * sin(v * TAU * 1.5);
    float rib = (v - 0.5) * 1.3;
    return vec3(
      cos(a) * (r + rib * 0.28),
      sin(a) * (r + rib * 0.28) * 0.89,
      sin(a * 2.0 + v * 2.0) * 0.3 + rib * 0.7 + layer * 0.015
    );
  }
  // Layered surfaces
  if (formId < 1.5) {
    if (v < 0.075 && layer < 3.0) {
      float t = v / 0.075;
      float x = (floor(u * 5.0) / 4.0 - 0.5) * 2.55 + sin(t * 3.14159) * 0.14,
        z = -0.68 + sin(t * 3.14159) * 0.4;
      return vec3(x, (layer - 1.5 + t) * 0.49 + 0.17 * sin(x * 2.0 + z * 1.8) + 0.19 * x, z);
    }
    float x = (u - 0.5) * 2.55,
      z = (v - 0.5) * 1.65;
    return vec3(x, (layer - 1.5) * 0.49 + 0.17 * sin(x * 2.0 + z * 1.8) + 0.19 * x, z);
  }
  // Open shell
  if (formId < 2.5) {
    float angle = (u * 1.68 - 0.84) * 3.14159,
      r = 0.72 + 0.13 * cos(v * TAU * 1.5) + 0.02 * layer;
    return vec3(sin(angle) * r, (v - 0.5) * 2.5, cos(angle) * r + 0.12 * sin(v * 7.0));
  }
  if (formId > 3.5) {
    // Nested shells
    if (formId < 4.5) {
      float a = (u * 0.76 + 0.37) * TAU,
        b = acos(clamp(v * 2.0 - 1.0, -1.0, 1.0)),
        r = 0.65 + layer * 0.15;
      return vec3(
        cos(a) * sin(b) * r + layer * scroll * 0.07,
        cos(b) * r * 1.1,
        sin(a) * sin(b) * r * 0.85
      );
    }
    // Woven loop
    if (formId < 5.5) {
      float b = v * TAU;
      vec3 c = vec3(sin(a) + 2.0 * sin(2.0 * a), cos(a) - 2.0 * cos(2.0 * a), -sin(3.0 * a)) * 0.4;
      vec3 t = normalize(
        vec3(cos(a) + 4.0 * cos(2.0 * a), -sin(a) + 4.0 * sin(2.0 * a), -3.0 * cos(3.0 * a))
      );
      vec3 n = normalize(cross(t, vec3(0, 0, 1))),
        bv = cross(t, n);
      return c + (n * cos(b) + bv * sin(b)) * (0.12 + layer * 0.019);
    }
    // Spatial frames
    if (formId < 6.5) {
      float c = cos(a),
        d = sin(a),
        z = (layer - 1.5) * (0.48 + scroll * 0.14),
        r = 1.0 + z * 0.1 + (v - 0.5) * 0.075;
      vec2 edge = vec2(sign(c) * pow(abs(c), 0.22), sign(d) * pow(abs(d), 0.22));
      return vec3(edge.x * r, edge.y * r * 0.91, z);
    }
    // Crossing orbits
    if (formId < 7.5) {
      float r = 1.16 + (v - 0.5) * 0.1,
        c = cos(a) * r,
        d = sin(a) * r;
      if (layer < 0.5) return vec3(c, d * 0.86, 0.0);
      if (layer < 1.5) return vec3(c * 0.22, d * 0.88, c * 0.9);
      if (layer < 2.5) return vec3(c, d * 0.2, d * 0.9);
      return vec3(c * 0.78 - d * 0.28, c * 0.42 + d * 0.64, d * 0.65 - c * 0.3);
    }
    // Braided ribbons
    if (formId > 8.5) {
      float band = floor(layer * 0.5),
        theta = (v - 0.5) * TAU * 0.92 + band * 3.14159 + scroll * 0.22,
        r = 0.58 + (u - 0.5) * 0.42,
        thickness = (layer - band * 2.0 - 0.5) * 0.025;
      return vec3(cos(theta) * r, (v - 0.5) * 2.6, sin(theta) * r + thickness);
    }
    // Pleated fan
    float theta = (u - 0.5) * TAU * 0.82,
      r = 0.18 + v * 1.25;
    return vec3(
      cos(theta) * r - 0.2,
      sin(theta) * r * 0.9,
      sin(theta * 13.0) * r * 0.13 + (layer - 1.5) * 0.04
    );
  }
  // Repeated cells
  vec3 cell = vec3(floor(u * 5.0) - 2.0, floor(v * 5.0) - 2.0, layer - 1.5);
  vec2 q = fract(vec2(u, v) * 5.0);
  return cell * 0.45 + vec3(
    cos(q.x * TAU) * sin(q.y * 3.14159),
    sin(q.x * TAU) * sin(q.y * 3.14159),
    cos(q.y * 3.14159)
  ) * 0.125;
}

vec3 curl(vec3 q) {
  return vec3(-sin(q.y) - cos(q.z), -sin(q.z) - cos(q.x), -sin(q.x) - cos(q.y));
}

vec3 fieldMotion(vec3 q, vec3 key, float body, float drift) {
  float t = frame.x;
  vec3 flow = curl(q * 3.1 + vec3(t * 0.15, t * 0.11, -t * 0.13)),
    detail = curl(q * 7.4 + vec3(-t * 0.12, t * 0.17, t * 0.09));
  float phase = key.x * TAU + key.y * 9.0;
  vec3 orbit = vec3(sin(t * 0.37 + phase), cos(t * 0.31 + phase * 1.3), sin(t * 0.28 - phase));
  return q +
    body * (flow * 0.058 + detail * 0.018) +
    drift * (flow * 0.13 + detail * 0.035 + orbit * 0.22);
}

vec3 livingSurface(vec3 key, float formId, float drift) {
  float t = frame.x;
  if (formId > 2.5 && formId < 3.5) {
    vec3 cell = vec3(floor(key.x * 5.0) - 2.0, floor(key.y * 5.0) - 2.0, key.z - 1.5);
    vec2 local = fract(key.xy * 5.0);
    float a = local.x * TAU + t * 0.18,
      b = local.y * 3.14159,
      radius = 0.125 + sin(t * 0.42 + local.x * TAU) * 0.003;
    return fieldMotion(
      cell * 0.45 + vec3(cos(a) * sin(b), sin(a) * sin(b), cos(b)) * radius,
      key,
      0.0,
      drift
    );
  }
  vec3 movingKey = key;
  if (formId < 0.5) movingKey.x = fract(movingKey.x + t * (0.012 + drift * 0.018));
  else if (formId > 4.5 && formId < 5.5 || formId > 6.5 && formId < 7.5)
    movingKey.x = fract(movingKey.x + t * 0.009);
  else movingKey.xy += sin(vec2(t * 0.19 + movingKey.y * 9.0, t * 0.16 + movingKey.x * 8.0)) * 0.009;
  vec3 q = fieldMotion(surface(movingKey, formId), key, formId > 3.5 ? 0.16 : 1.0, drift);
  if (formId > 0.5 && formId < 1.5) q.y += (key.z - 1.5) * scroll * 0.22;
  return q;
}

vec3 wake(vec2 at) {
  float aspect = view.x / view.y;
  vec3 result = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    vec4 item = trail[i];
    vec2 velocity = item.zw * vec2(aspect, 1.0),
      delta = (at - item.xy) * vec2(aspect, 1.0);
    float speed = length(velocity),
      radius = 0.11 + min(speed, 2.0) * 0.028,
      influence = exp(-dot(delta, delta) / (radius * radius)) * 0.3;
    result += vec3(velocity * influence, speed * influence);
  }
  return vec3(result.xy / max(1.0, length(result.xy) / 1.2), min(result.z, 1.6));
}

void main() {
  uint id = uint(gl_VertexID);
  vec3 key = vec3(sampleHash(id * 2u + 11u), sampleHash(id * 2u + 79u), float(id % 4u));
  float drift = id % 11u == 0u ? 1.0 : 0.0;
  vec3 pos = mix(
    livingSurface(key, frame.y, drift),
    livingSurface(key, frame.z, drift),
    smoothstep(0.0, 1.0, frame.w)
  );
  float a = -0.38 + sin(frame.x * 0.17) * 0.13 + scroll * 0.52,
    b = 0.16 + sin(frame.x * 0.13) * 0.09 - scroll * 0.24;
  vec3 r = vec3(pos.x * cos(a) + pos.z * sin(a), pos.y, -pos.x * sin(a) + pos.z * cos(a));
  vec3 q = vec3(r.x, r.y * cos(b) - r.z * sin(b), r.y * sin(b) + r.z * cos(b));
  float aspect = view.x / view.y,
    center = aspect < 0.8 ? 0.08 : 0.3,
    scale = aspect < 0.8 ? 0.68 : 0.72;
  vec2 projected =
    q.xy * vec2(scale / aspect, scale) * (3.6 / (3.6 - q.z * 0.42)) +
    vec2(center, 0.02 + sin(frame.x * 0.21) * 0.018);
  vec3 flow = wake(projected);
  vec2 delta = (projected - pointer.xy) * vec2(aspect, 1.0);
  float focus = exp(-dot(delta, delta) * 58.0) * pointer.z * 0.28 + min(flow.z, 1.0) * 0.55;
  projected += flow.xy * 0.115 * (frame.z > 2.5 && frame.z < 3.5 ? drift : 1.0) / vec2(aspect, 1.0);
  softness =
    smoothstep(0.12, 1.12, abs(q.z - 0.1 - sin(frame.x * 0.12) * 0.12)) * (1.0 - min(focus, 0.85));
  float rand = sampleHash(id + 193u);
  direction = normalize(flow.xy + vec2(0.00001, 0.0));
  streak = 1.0 + min(flow.z, 1.0) * (id % 7u == 0u ? 1.5 : 0.25);
  gl_Position = vec4(projected, 0.5, 1.0);
  gl_PointSize =
    (0.52 + pow(rand, 3.0) * 1.65 + softness * (4.2 + pow(rand, 12.0) * 8.5)) *
    2.0 *
    min(view.y / 850.0, 1.7) *
    (1.0 + min(flow.z, 1.0) * 0.55) *
    streak;
  alpha =
    (0.22 + 0.55 * sampleHash(id + 713u)) *
    (0.9 + 0.1 * sin(frame.x * 0.4 + rand * TAU)) *
    (1.0 - softness * 0.86) *
    smoothstep(-0.95, -0.28, projected.x) *
    (1.0 + min(flow.z, 1.0) * 1.2 + focus * 0.12);
  alpha *= (frame.z > 5.5 && frame.z < 7.5 || frame.z > 8.5) && id % 11u != 0u ? 0.58 : 1.0;
  tint = mix(vec3(0.89, 0.91, 0.95), vec3(1.0, 0.95, 0.82), min(flow.z, 1.0) * 0.18);
}`;

export const fragmentShader = `#version 300 es
precision highp float;
in float alpha;
in float softness;
in vec3 tint;
in vec2 direction;
in float streak;
out vec4 color;

void main() {
  vec2 point = gl_PointCoord * 2.0 - 1.0;
  point.y = -point.y;
  vec2 uv = vec2(dot(point, direction), dot(point, vec2(-direction.y, direction.x)) * streak);
  float r = dot(uv, uv);
  if (r > 1.0) discard;
  color = vec4(tint, exp(-r * mix(3.6, 2.1, softness)) * alpha);
}`;
