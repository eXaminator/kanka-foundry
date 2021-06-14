import kanka from '../kanka';
import { ProgressFn } from '../types/progress';
import { path as template } from './KankaJournalApplication.hbs';
import './KankaJournalApplication.scss';

const BaseSheet = window.CONFIG.JournalEntry.sheetClass as typeof JournalSheet;

class KankaJournalApplication extends BaseSheet {
    #lastRenderOptions = undefined;

    static get defaultOptions(): FormApplication.Options {
        return {
            ...super.defaultOptions,
            closeOnSubmit: false,
            submitOnClose: false,
            submitOnChange: false,
            tabs: [{ navSelector: '.tabs', contentSelector: '.content', initial: 'details' }],
            scrollY: ['.tab'],
            editable: true,
        };
    }

    constructor(options?: FormApplication.Options) {
        super(options);
        this.ensureInitialisation();
    }

    ensureInitialisation(): void {
        if (kanka.isInitialized) {
            this.rerender();
        } else {
            setTimeout(() => this.ensureInitialisation(), 200);
        }
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

        html.on('click', '[data-action]', async (event) => {
            const { action } = event.currentTarget?.dataset ?? {};

            if (!action) return;

            if (action === 'refresh') {
                const type = this.object.getFlag(kanka.name, 'type');
                const campaign = this.object.getFlag(kanka.name, 'campaign');
                const snapshot = this.object.getFlag(kanka.name, 'snapshot');
                this.setLoadingState(event.currentTarget);
                // eslint-disable-next-line @typescript-eslint/naming-convention
                await kanka.journals.write(campaign, [{ child_id: snapshot.id, type }]);
                this.rerender();
            }

            if (action === 'show-image') {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.render(true, { sheetMode: 'image' });
            }
        });
    }

    public rerender(): void {
        if (!this.rendered) return;
        this.render(false, this.#lastRenderOptions);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected _updateObject(event: Event | JQuery.Event, formData: unknown): Promise<unknown> {
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected _render(force?: boolean, options?: any): Promise<void> {
        this.#lastRenderOptions = options;
        return super._render(force, options);
    }
}

window.CONFIG.JournalEntry.sheetClass = KankaJournalApplication;
