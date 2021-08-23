import kanka from '../kanka';

export default async function ready(): Promise<void> {
    if (kanka.game.modules.get('_document-sheet-registrar')?.active) {
        return;
    }

    // Keep in mind that this dialog needs to be shown on "ready"
    const dialog = new Dialog({
        title: kanka.getMessage('general.missingDocumentSheetRegistrar.title'),
        content: kanka.getMessage('general.missingDocumentSheetRegistrar.text'),
        buttons: {
            ok: {
                label: kanka.getMessage('general.missingDocumentSheetRegistrar.button'),
                async callback() {
                    await dialog.close();
                },
            },
        },
        default: 'ok',
    });

    dialog.render(true);
}
