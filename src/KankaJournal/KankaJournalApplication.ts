import kanka from '../kanka';
import { path as template } from './KankaJournalApplication.hbs';
import './KankaJournalApplication.scss';

const BaseSheet = window.CONFIG.JournalEntry.sheetClass as typeof JournalSheet;

class KankaJournalApplication extends BaseSheet {
    static get defaultOptions(): Application.Options {
        return {
            ...super.defaultOptions,
            closeOnSubmit: false,
            submitOnClose: false,
            submitOnChange: false,
            tabs: [{ navSelector: '.tabs', contentSelector: '.content', initial: 'details' }],
            scrollY: ['.tab'],
        };
    }

    get isKankaEntry(): boolean {
        return Boolean(this.object.getFlag(kanka.name, 'snapshot'));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getData(): BaseEntitySheet.Data & Record<string, any> {
        if (!this.isKankaEntry) return super.getData();

        return {
            ...super.getData(),
            kankaIsGm: game.user.isGM,
            kankaEntity: this.object.getFlag(kanka.name, 'snapshot'),
            kankaEntityType: this.object.getFlag(kanka.name, 'type'),
            kankaReferences: this.object.getFlag(kanka.name, 'references'),
            kankaCampaignId: this.object.getFlag(kanka.name, 'campaign'),
            settings: {
                imageInText: kanka.settings.imageInText,
            },
            localization: kanka.localization,
        };
    }

    get template(): string {
        const parentTemplate = super.template;

        if (!this.isKankaEntry) return parentTemplate;
        if (parentTemplate !== 'templates/journal/sheet.html') return parentTemplate;

        return template;
    }

    async activateListeners(html: JQuery): Promise<void> {
        super.activateListeners(html);
        if (!this.isKankaEntry) return;

        html.on('click', 'button[data-action]', async (event) => {
            const { action } = event.currentTarget?.dataset ?? {};

            if (!action) return;

            if (action === 'refresh') {
                const type = this.object.getFlag(kanka.name, 'type');
                const campaign = this.object.getFlag(kanka.name, 'campaign');
                const snapshot = this.object.getFlag(kanka.name, 'snapshot');
                this.setLoadingState(event.currentTarget);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                await kanka.journals.write(campaign, [{ child_id: snapshot.id, type }]);
                this.render();
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected _updateObject(event: Event | JQuery.Event, formData: unknown): Promise<unknown> {
        if (!this.isKankaEntry) return super._updateObject(event, formData);

        return super._updateObject(event, formData);
    }

    protected setLoadingState(button: HTMLButtonElement): void {
        $(button).addClass('-loading');
        $(this.element).find('[data-action]').prop('disabled', true);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected _inferDefaultMode(): 'image' | 'text' | null {
        if (this.isKankaEntry) return 'text';

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return super._inferDefaultMode();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected async _onSwapMode(event: unknown, mode: string): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await super._onSwapMode(event, mode);

        if (mode === 'text') {
            this.setPosition({ width: KankaJournalApplication.defaultOptions.width as number });
        }
    }
}

window.CONFIG.JournalEntry.sheetClass = KankaJournalApplication;
