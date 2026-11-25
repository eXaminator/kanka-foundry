import localization from '../state/localization';
import { HOT_RELOAD_EVENT, type HotReloadPayload } from './hotReloadEvent';

function rerenderApplications(): void {
    for (const app of Object.values(ui.windows as Record<number, Application>)) app.render();
    for (const app of foundry.applications.instances.values()) app.render();
}

/**
 * Templates and translations are served by the Vite dev server instead of the Foundry server. Foundry therefore never
 * notices that they changed, so the dev server pushes the changes to the client, which hands them to the same handler
 * Foundry uses for its own hot reload socket event (which re-registers templates/translations and re-renders apps).
 */
export default function registerHotReload(hot: NonNullable<ImportMeta['hot']>): void {
    hot.on(HOT_RELOAD_EVENT, async (payload: HotReloadPayload) => {
        const data: Hooks.HotReloadData = { packageType: 'module', packageId: 'kanka-foundry', ...payload };
        const listeners = game.socket?.listeners('hotReload') ?? [];

        if (listeners.length === 0) {
            console.warn('Kanka-Foundry | No Foundry hot reload handler found, reloading page', data.path);
            window.location.reload();
            return;
        }

        console.info('Kanka-Foundry | Hot reload', data.path);
        for (const listener of listeners) listener(data);

        // The module uses its own Localization instance next to game.i18n, which Foundry doesn't know about.
        if (data.extension === 'json' && data.path.endsWith(`/lang/${localization.lang}.json`)) {
            await localization.initialize();
            rerenderApplications();
        }
    });
}
