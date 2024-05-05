import api from '../../api';
import getGame from '../../foundry/getGame';
import getMessage from '../../foundry/getMessage';
import { getEntryFlag } from '../../foundry/journalEntries';
import { showError } from '../../foundry/notifications';
import { getSetting } from '../../foundry/settings';
import localization from '../../state/localization';
import { updateEntity } from '../../syncEntities';
import { logError } from '../../util/logger';
import './KankaJournalApplication.scss';

type JournalSheetData = ReturnType<JournalSheet['getData']>;
type SheetOptions = JournalSheetOptions & Record<string, unknown>;

interface Data extends JournalSheetData {
    pages: JournalEntryPage[];
    toc: JournalEntryPage[];
}

export default class KankaJournalApplication extends JournalSheet {
    #forceMode: number | undefined;

    static get defaultOptions(): SheetOptions {
        return {
            ...super.defaultOptions,
            editable: false,
            classes: [...(super.defaultOptions.classes ?? []), 'kanka-journal'],
        };
    }

    get isEditable(): false {
        return false;
    }

    private isPageInOverviewArea(index: number): boolean {
        if (!getSetting('mergeOverviewPages')) return false;

        const page = this._pages[index];
        if (!page) return false;

        if (page.type === 'image' && index === 0) return true;
        if (['kanka-foundry.overview', 'kanka-foundry.post', 'kanka-foundry.character-profile'].includes(page.type))
            return true;

        return false;
    }

    public _getPageData(): JournalEntryPage[] {
        const pages = super._getPageData() as (JournalEntryPage & { name: string })[];

        // @ts-expect-error
        return pages.map((page) => ({
            ...page,
            name: page.name.startsWith('KANKA.') ? localization.localize(page.name) : page.name,
            editable: false,
        }));
    }

    public getData(options?: Partial<SheetOptions>): Data | JournalSheetData {
        const data = super.getData(options);

        let { pages } = data;

        if (this.mode === JournalSheet.VIEW_MODES.SINGLE) {
            if (this.isPageInOverviewArea(this.pageIndex)) {
                pages = data.toc.filter((page, index) => this.isPageInOverviewArea(index));
            } else {
                pages = [data.toc[this.pageIndex]];
            }
        }

        return {
            ...data,
            pages,
            toc: data.toc.map((page) => {
                const actualPage = this.object.pages.get(page._id);
                const count = actualPage.isOwner ? page.system.totalCount : page.system.publicCount;
                const tocCls = [page.tocClass];
                if (count > 99) tocCls.push('kanka-count kanka-count-limit');
                else if (count !== undefined && count !== null) tocCls.push(`kanka-count kanka-count-${count}`);
                tocCls.push(`kanka-type-${page.system.type}`);

                return { ...page, tocClass: tocCls.join(' ') };
            }),
        };
    }

    public _getHeaderButtons(): unknown[] {
        const accessToken = api.getToken();
        const allowSync = getGame().user?.isGM && api.isReady && accessToken && !accessToken.isExpired();
        const buttons = super._getHeaderButtons();

        buttons.unshift({
            label: getMessage('journal.shared.action.openInKanka'),
            icon: 'fas fa-up-right-from-square',
            class: 'kanka-open',
            onclick: () => {
                const snapshot = getEntryFlag(this.object, 'snapshot');
                if (snapshot?.urls.view) {
                    window.open(snapshot.urls.view, '_blank');
                } else {
                    showError('error.missingUrl');
                }
            },
        });

        if (allowSync) {
            buttons.unshift({
                label: getMessage('journal.shared.action.refresh'),
                icon: 'fas fa-rotate',
                class: 'kanka-sync',
                onclick: async (event) => {
                    event.target.classList.add('-loading');
                    try {
                        const type = getEntryFlag(this.object, 'type');
                        const campaign = getEntryFlag(this.object, 'campaign');
                        const snapshot = getEntryFlag(this.object, 'snapshot');

                        if (!type || !campaign || !snapshot) throw new Error('Missing flags on journal entry');

                        await updateEntity(this.object);
                    } catch (error) {
                        showError('journal.error.sync');
                        logError(error);
                    } finally {
                        this.render();
                        event.target.classList.remove('-loading');
                    }
                },
            });
        }

        return buttons;
    }

    _onPageScroll(entries, observer) {
        if (this.isPageInOverviewArea(this.pageIndex)) {
            this.#forceMode = JournalSheet.VIEW_MODES.MULTIPLE;
            super._onPageScroll(entries, observer);
            this.#forceMode = undefined;
        } else {
            super._onPageScroll(entries, observer);
        }
    }

    async goToPage(pageId, anchor) {
        const currentPageId = this._pages[this.pageIndex]?._id;
        if (currentPageId === pageId) return super.goToPage(pageId, anchor);

        const targetIndex = this._pages.findIndex((page) => page._id === pageId);

        if (this.isPageInOverviewArea(targetIndex)) {
            await this._render(true, { pageId, anchor });

            this.#forceMode = JournalSheet.VIEW_MODES.MULTIPLE;
            super.goToPage(pageId, anchor);
            this.#forceMode = undefined;
        } else {
            super.goToPage(pageId, anchor);
        }

        return null;
    }

    get mode(): number {
        return this.#forceMode ?? super.mode;
    }
}
