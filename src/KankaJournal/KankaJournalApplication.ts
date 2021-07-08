import kanka from '../kanka';
import { KankaApiChildEntity, KankaApiEntityType, KankaApiId } from '../types/kanka';
import { ProgressFn } from '../types/progress';
import Reference from '../types/Reference';
import { path as template } from './KankaJournalApplication.hbs';
import './KankaJournalApplication.scss';

interface Data extends JournalSheet.Data {
    kankaIsGm: boolean;
    kankaEntity: KankaApiChildEntity;
    kankaEntityType: KankaApiEntityType;
    kankaReferences: Reference;
    kankaCampaignId: KankaApiId;
    settings: {
        imageInText: boolean;
    };
    localization: Localization;
}

const BaseSheet = CONFIG.JournalEntry.sheetClass as typeof JournalSheet;

class KankaJournalApplication extends BaseSheet {
    #lastRenderOptions?: JournalSheet.RenderOptions = undefined;

    static get defaultOptions(): JournalSheet.Options {
        return {
            ...super.defaultOptions,
        };
    }

    constructor(object: JournalEntry, options?: JournalSheet.Options) {
        super(object, object.getFlag(kanka.name, 'snapshot') ? {
            ...options,
            closeOnSubmit: false,
            submitOnClose: false,
            submitOnChange: false,
            tabs: [{ navSelector: '.tabs', contentSelector: '.tab-container', initial: 'details' }],
            scrollY: ['.kanka-tab'],
        } : options);
        this.ensureInitialisation();
    }

    ensureInitialisation(): void {
        if (!this.isKankaEntry) return;

        if (kanka.isInitialized) {
            this.rerender();
        } else {
            setTimeout(() => this.ensureInitialisation(), 200);
        }
    }

    get isKankaEntry(): boolean {
        return Boolean(this.object.getFlag(kanka.name, 'snapshot'));
    }

    public getData(
        options?: Application.RenderOptions,
    ): Promise<DocumentSheet.Data<JournalEntry> | Data> | DocumentSheet.Data<JournalEntry> | Data {
        if (!this.isKankaEntry) return super.getData(options);

        return {
            ...super.getData(),
            kankaIsGm: kanka.game.user?.isGM ?? false,
            kankaEntity: this.object.getFlag(kanka.name, 'snapshot') as KankaApiChildEntity,
            kankaEntityType: this.object.getFlag(kanka.name, 'type') as KankaApiEntityType,
            kankaReferences: this.object.getFlag(kanka.name, 'references') as Reference,
            kankaCampaignId: this.object.getFlag(kanka.name, 'campaign') as KankaApiId,
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

        html.on('click', '[data-action]', async (event) => {
            const { action } = event.currentTarget?.dataset ?? {};

            if (!action) return;

            if (action === 'refresh') {
                const type = this.object.getFlag(kanka.name, 'type') as KankaApiEntityType;
                const campaign = this.object.getFlag(kanka.name, 'campaign') as KankaApiId;
                const snapshot = this.object.getFlag(kanka.name, 'snapshot') as KankaApiChildEntity;
                this.setLoadingState(event.currentTarget);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                await kanka.journals.write(campaign, [{ child_id: snapshot.id, type }]);
                this.rerender();
            }

            if (action === 'show-image') {
                this.render(true, { sheetMode: 'image' } as JournalSheet.RenderOptions);
            }
        });
    }

    public rerender(): void {
        if (!this.rendered) return;
        this.render(false, this.#lastRenderOptions);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<JournalEntry> {
        if (!this.isKankaEntry) return super._updateObject(event, formData);

        return super._updateObject(event, formData);
    }

    protected setLoadingState(button: HTMLButtonElement, determined = false): ProgressFn {
        const $button = $(button);
        $button.addClass('-loading');
        $(this.element).find('[data-action]').prop('disabled', true);

        if (determined) $button.addClass('-determined');
        else $button.addClass('-undetermined');

        return (current, max) => {
            $button.addClass('-determined');
            button.style.setProperty('--progress', `${Math.round((current / max) * 100)}%`);
        };
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected _inferDefaultMode(): JournalSheet.SheetMode | null {
        if (this.isKankaEntry) return 'text';

        return super._inferDefaultMode();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected async _onSwapMode(event: Event, mode: JournalSheet.SheetMode): Promise<void> {
        await super._onSwapMode(event, mode);

        if (this.isKankaEntry && mode === 'text') {
            this.setPosition({ width: KankaJournalApplication.defaultOptions.width as number });
        }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected _render(force?: boolean, options?: JournalSheet.RenderOptions): Promise<void> {
        this.#lastRenderOptions = options;
        return super._render(force, options);
    }
}

CONFIG.JournalEntry.sheetClass = KankaJournalApplication;
