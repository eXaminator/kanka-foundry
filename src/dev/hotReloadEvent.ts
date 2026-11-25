/**
 * Shared between the Vite plugins in `build/` and the dev client in `src/dev/hotReload.ts`. Keep this file free of
 * runtime dependencies, it is loaded by both Node and the browser.
 */
export const HOT_RELOAD_EVENT = 'kanka-foundry:hot-reload';

/** Mirrors the file related part of Foundry's `Hooks.HotReloadData` */
export interface HotReloadPayload {
    /** Path as Foundry knows it, e.g. `modules/kanka-foundry/templates/apps/foo.hbs` */
    path: string;
    extension: 'hbs' | 'json';
    content: string;
}
