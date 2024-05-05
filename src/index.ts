import './foundry/registerHooks';
import './index.scss';
import localization from './state/localization';

import.meta.glob('./lang/*.yml', { eager: true });

if (import.meta.hot) {
    import.meta.hot.accept(['./lang/en.yml', './lang/de.yml'], async ([en, de]) => {
        if ((en && localization.lang === 'en') || (de && localization.lang === 'de')) {
            await localization.initialize();

            for (const app of Object.values(window.ui.windows as Record<number, Application>)) {
                app.render();
            }
        }
    });

    import.meta.hot.on('kanka:update-hbs', async ({ file }) => {
        console.log('HMR: update-hbs', file);
        const kankaTemplates = Object.keys(window._templateCache).filter((key) => key.includes('kanka-foundry'));

        for (const key of kankaTemplates) {
            delete window._templateCache[key];
        }

        await loadTemplates(kankaTemplates);

        for (const app of Object.values(window.ui.windows as Record<number, Application>)) {
            app.render();
        }
    });
}
