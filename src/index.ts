import './foundry/registerHooks';
import './index.scss';
import localization from './state/localization';

import.meta.glob('./lang/*.yml', { eager: true });

if (import.meta.hot) {
    import.meta.hot.accept(['./lang/en.yml', './lang/de.yml'], async ([en, de]) => {
        if ((en && localization.lang === 'en') || (de && localization.lang === 'de')) {
            await localization.initialize();

            Object
                .values(window.ui.windows as Record<number, Application>)
                .forEach(app => app.render());
        }
    });

    import.meta.hot.on('kanka:update-hbs', async ({ file }) => {
        // eslint-disable-next-line no-console
        console.log('HMR: update-hbs', file);
        const kankaTemplates = Object
            .keys(window._templateCache)
            .filter(key => key.includes('kanka-foundry'));

        kankaTemplates.forEach((key) => { delete window._templateCache[key]; });

        await loadTemplates(kankaTemplates);

        Object
            .values(window.ui.windows as Record<number, Application>)
            .forEach(a => a.render(false));
    });
}
