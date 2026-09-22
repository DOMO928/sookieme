const COUNT = 6;
type Sample = { x: number; y: number; vx: number; vy: number; time: number };
/** A short, bounded history in normalized viewport coordinates. No DOM dependency. */
export class PointerHistory {
  private previous: Sample | undefined;
  private samples: Sample[] = [];
  private output = new Float32Array(COUNT * 4);
  reset() {
    this.previous = undefined;
    this.samples = [];
    this.output.fill(0);
  }
  move(x: number, y: number, time: number, aspect: number) {
    const old = this.previous;
    this.previous = { x, y, vx: 0, vy: 0, time };
    if (!old || time - old.time > 180 || time <= old.time) return;
    const dt = Math.max(0.008, (time - old.time) / 1000);
    let vx = (x - old.x) / dt,
      vy = (y - old.y) / dt;
    const speed = Math.hypot(vx * aspect, vy),
      limit = Math.min(1, 3.2 / Math.max(speed, 0.001));
    vx *= limit;
    vy *= limit;
    if (speed < 0.015) return;
    const next = { x, y, vx, vy, time };
    if (this.samples[0] && time - this.samples[0].time < 32) {
      // Keep the old timestamp until this trail slot is complete.
      next.time = this.samples[0].time;
      this.samples[0] = next;
    } else this.samples.unshift(next);
    this.samples.length = Math.min(COUNT, this.samples.length);
  }
  frame(time: number) {
    this.output.fill(0);
    this.samples = this.samples.filter((sample) => time - sample.time < 1600);
    this.samples.forEach((sample, i) => {
      const fade = Math.exp(-Math.max(0, time - sample.time) / 210);
      this.output.set([sample.x, sample.y, sample.vx * fade, sample.vy * fade], i * 4);
    });
    return this.output;
  }
}
