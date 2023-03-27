import kanka from '../kanka';
import migrateV1 from '../migrations/migrateV1';
import migrateV2 from '../migrations/migrateV2';
import migrateV3 from '../migrations/migrateV3';
import migrateV4 from '../migrations/migrateV4';

export default async function ready(): Promise<void> {
    migrateV1(kanka);
    await migrateV2(kanka);
    await migrateV3();
    await migrateV4();
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
