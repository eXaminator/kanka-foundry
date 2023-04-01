import type KankaFoundry from '../KankaFoundry';
import { KankaApiChildEntity, KankaApiEntityType, KankaApiId } from '../types/kanka';
import { ProgressFn } from '../types/progress';
import Reference from '../types/Reference';
import template from './KankaJournalApplication.hbs';
import './KankaJournalApplication.scss';
import logo from '../assets/kanka.png';
import { getSetting } from '../module/settings';
import syncEntities from '../module/syncEntities';
import { getEntryFlag } from '../module/journalEntries';

interface Data extends JournalSheet.Data {
    kankaIsGm: boolean;
    kankaEntity: KankaApiChildEntity;
    kankaEntityType: KankaApiEntityType;
    kankaReferences: Reference;
    kankaCampaignId: KankaApiId;
    kankaLogo: string;
    settings: {
        imageInText: boolean;
    };
    localization: Localization;
}

type RenderOptions = Application.RenderOptions<JournalSheetOptions>;

export default function registerSheet(kanka: KankaFoundry): void {
    class KankaJournalApplication extends JournalSheet {
        #lastRenderOptions?: RenderOptions = undefined;

        static get defaultOptions(): JournalSheetOptions {
            return {
                ...super.defaultOptions,
                closeOnSubmit: false,
                submitOnClose: false,
                submitOnChange: false,
                tabs: [{ navSelector: '.tabs', contentSelector: '.tab-container', initial: 'details' }],
                scrollY: ['.tab'],
                classes: ['kanka', 'kanka-journal'],
            };
        }

        constructor(object: JournalEntry, options?: JournalSheetOptions) {
            super(object, options);
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
            options?: Partial<JournalSheetOptions>,
        ): Promise<JournalSheet.Data | Data> | JournalSheet.Data | Data {
            if (!this.isKankaEntry) return super.getData(options);

            return {
                ...super.getData(options),
                kankaIsGm: kanka.game.user?.isGM ?? false,
                kankaEntity: this.object.getFlag(kanka.name, 'snapshot') as KankaApiChildEntity,
                kankaEntityType: this.object.getFlag(kanka.name, 'type') as KankaApiEntityType,
                kankaReferences: this.object.getFlag(kanka.name, 'references') as Reference,
                kankaCampaignId: this.object.getFlag(kanka.name, 'campaign') as KankaApiId,
                kankaLogo: logo,
                settings: {
                    imageInText: getSetting('imageInText'),
                },
                localization: kanka.localization,
            };
        }

        get template(): string {
            if (!this.isKankaEntry) return super.template;

            // Only replace the default text template, not the image template
            if (super.template === 'templates/journal/sheet.html') return template;

            return super.template;
        }

        async activateListeners(html: JQuery): Promise<void> {
            super.activateListeners(html);
            if (!this.isKankaEntry) return;

            html.on('click', '[data-action]', async (event) => {
                const { action } = event.currentTarget?.dataset ?? {};

                if (!action) return;

                if (action === 'refresh') {
                    const type = getEntryFlag(this.object, 'type');
                    const campaign = getEntryFlag(this.object, 'campaign');
                    const snapshot = getEntryFlag(this.object, 'snapshot');
                    this.setLoadingState(event.currentTarget);

                    if (!type || !campaign || !snapshot) throw new Error('Missing flags on journal entry');

                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    await syncEntities(campaign, [{ child_id: snapshot.id, type }], []);
                    this.rerender();
                }
            });
        }

        public rerender(): void {
            if (!this.rendered) return;
            this.render(false, this.#lastRenderOptions);
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
            return 'text';
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        protected async _onSwapMode(event: Event, mode: JournalSheet.SheetMode): Promise<void> {
            await super._onSwapMode(event, mode);

            if (mode === 'text') {
                this.setPosition({ width: KankaJournalApplication.defaultOptions.width as number });
            }
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        protected _render(force?: boolean, options?: RenderOptions): Promise<void> {
            this.#lastRenderOptions = options;
            return super._render(force, options);
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Journal.registerSheet(kanka.name, KankaJournalApplication, {
        makeDefault: false,
        label: 'Kanka-Foundry Journal sheet',
    });
}
