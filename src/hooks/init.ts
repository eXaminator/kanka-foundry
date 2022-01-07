import kanka from '../kanka';

export default async function init(): Promise<void> {
    await kanka.initialize();
}

if (import.meta.hot) {
    import.meta.hot.dispose(async () => {
        await kanka.dispose();
    });
}
