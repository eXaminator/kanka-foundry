import './foundry/registerHooks';
import './index.scss';

import.meta.glob('./lang/*.yml', { eager: true });

if (import.meta.hot) {
    import.meta.hot.on('update-hbs', async ({ file }) => {
        // eslint-disable-next-line no-console
        console.log('HMR: update-hbs', file);
        const kankaTemplates = Object
            .keys(_templateCache)
            .filter(key => key.includes('kanka-foundry'));

        kankaTemplates.forEach((key) => { delete _templateCache[key]; });

        await loadTemplates(kankaTemplates);

        Object
            .values(ui.windows)
            .forEach(a => {
                if (kankaTemplates.includes(a.template)) a.render(false);
            });
    });
}
