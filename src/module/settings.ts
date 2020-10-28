const NAMESPACE = 'kanka-foundry';

const accessTokenConfig = {
    name: 'Kanka Personal Access Token',
    hint: 'You can retrieve an access token from https://kanka.io/en/settings/api',
    scope: 'world',
    config: true,
    type: String,
    default: '',
};

const campaignConfig = {
    name: 'Campaign',
    hint: 'Select the campaign from which to import articles',
    scope: 'world',
    config: true,
    type: String,
    default: '',
    choices: {
        '': 'Please choose',
    },
};

function createOption(value: string, label: string): HTMLOptionElement {
    const option = document.createElement('option');
    option.value = value;
    option.text = label;

    return option;
}

export function clearSettings(): void {
    Array
        .from<string>(game.settings.settings.keys())
        .filter((key: string) => key.startsWith(NAMESPACE))
        .forEach(key => game.settings.settings.delete(key));
}

export function registerSettings(): void {
    game.settings.register(NAMESPACE, 'access_token', accessTokenConfig);
    game.settings.register(NAMESPACE, 'campaign', campaignConfig);

    const tokenInput = game.settings.sheet.form.querySelector('[name="kanka-foundry.access_token"]');
    const campaignSelect = game.settings.sheet.form.querySelector('[name="kanka-foundry.campaign"]') as HTMLSelectElement;

    tokenInput?.addEventListener('change', () => {
        campaignSelect?.add(createOption('asd', 'Foobar'));
    });

    tokenInput?.addEventListener('input', () => {
        campaignSelect?.add(createOption('asd', 'Foobar'));
    });
}
