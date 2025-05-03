import './foundry/registerHooks';
import './styles.css';
import localization from './state/localization';

import.meta.glob('./lang/*.yml', { eager: true });

if (import.meta.hot) {
    import.meta.hot.accept(['./lang/en.yml', './lang/de.yml'], async ([en, de]) => {
        if ((en && localization.lang === 'en') || (de && localization.lang === 'de')) {
            await localization.initialize();

            for (const app of Object.values(ui.windows as Record<number, Application>)) {
                app.render();
            }
        }
    });
}
