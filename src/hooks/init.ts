import kanka from '../kanka';

export default async function init(): Promise<void> {
    await kanka.initialize();
}

if (module.hot) {
    module.hot.dispose(async () => {
        await kanka.dispose();
    });
}
