import kanka from '../kanka';
import registerHandlebarsHelpers from '../module/registerHandlebarsHelper';

export default async function init(): Promise<void> {
    registerHandlebarsHelpers();
    await kanka.initialize();
}

if (import.meta.hot) {
    import.meta.hot.dispose(async () => {
        await kanka.dispose();
    });

    import.meta.hot.accept((newModule) => {
        if ((game as Game).ready) {
            newModule?.default();

            Object
                .values(ui.windows)
                .forEach(app => app.render(false));
        }
    });
}
