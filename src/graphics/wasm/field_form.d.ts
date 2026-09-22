/* tslint:disable */
/* eslint-disable */

/**
 * GPU state is owned for the lifetime of the persistent canvas.
 */
export class FieldRenderer {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static create(canvas: HTMLCanvasElement, count: number): Promise<FieldRenderer>;
    destroy(): void;
    frame(time: number, dt: number, shape: number, px: number, py: number, active: number, width: number, height: number, mode: number, still: boolean, scroll: number, trail: Float32Array): boolean;
    particle_count(): number;
    state_bytes(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_fieldrenderer_free: (a: number, b: number) => void;
    readonly fieldrenderer_create: (a: number, b: number) => number;
    readonly fieldrenderer_destroy: (a: number) => void;
    readonly fieldrenderer_frame: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => void;
    readonly fieldrenderer_particle_count: (a: number) => number;
    readonly fieldrenderer_state_bytes: (a: number) => number;
    readonly __wasm_bindgen_func_elem_324: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_356: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_1706: (a: number, b: number, c: number) => void;
    readonly __wasm_bindgen_func_elem_1706_2: (a: number, b: number, c: number) => void;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number) => void;
    readonly __wbindgen_export4: (a: number, b: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
