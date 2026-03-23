import api from '../../api';
import getMessage from '../../foundry/getMessage';
import { showError } from '../../foundry/notifications';
import localization from '../../state/localization';
import { updateEntity } from '../../syncEntities';
import type { JournalEntrySheetExt, JournalSheetPageContext } from '../../types/journal-sheet-augments';
import { logError } from '../../util/logger';
import './KankaJournalApplication.scss';

import JournalEntrySheet = foundry.applications.sheets.journal.JournalEntrySheet;

const overviewTypes = new Set([
    'kanka-foundry.overview',
    'kanka-foundry.post',
    'kanka-foundry.character-profile',
]);

// Cast helper for accessing runtime properties not yet typed in fvtt-types stubs
function ext(instance: KankaJournalApplication): JournalEntrySheetExt {
    return instance as unknown as JournalEntrySheetExt;
}

// Get the parent prototype for calling super methods that aren't typed in the stubs
const parentProto = JournalEntrySheet.prototype as unknown as JournalEntrySheetExt;

export default class KankaJournalApplication extends JournalEntrySheet {
    static override DEFAULT_OPTIONS = {
        classes: ['kanka-journal'],
        sheetConfig: false,
        actions: {
            openInKanka: KankaJournalApplication.#openInKanka,
            refresh: KankaJournalApplication.#refresh,
            nextPage: KankaJournalApplication.prototype.nextPage,
            previousPage: KankaJournalApplication.prototype.previousPage,
        },
    };

    get isEditable(): false {
        return false;
    }

    _getHeaderControls(): foundry.applications.api.ApplicationV2.HeaderControlsEntry[] {
        const controls = parentProto._getHeaderControls.call(this);

        const accessToken = api.getToken();
        const allowSync = game.user?.isGM && api.isReady && accessToken && !accessToken.isExpired();

        controls.push({
            icon: 'fas fa-up-right-from-square',
            label: getMessage('journal.shared.action.openInKanka'),
            action: 'openInKanka',
        });

        if (allowSync) {
            controls.push({
                icon: 'fas fa-rotate',
                label: getMessage('journal.shared.action.refresh'),
                action: 'refresh',
            });
        }

        return controls;
    }

    static #openInKanka(this: KankaJournalApplication) {
        const snapshot = ext(this).document.getFlag('kanka-foundry', 'snapshot') as
            | { urls: { view: string } }
            | undefined;
        if (snapshot?.urls.view) {
            window.open(snapshot.urls.view, '_blank');
        } else {
            showError('error.missingUrl');
        }
    }

    static async #refresh(this: KankaJournalApplication, _event: PointerEvent, target: HTMLElement) {
        target.classList.add('knk:loading-indicator');
        try {
            const doc = ext(this).document;
            const type = doc.getFlag('kanka-foundry', 'type');
            const campaign = doc.getFlag('kanka-foundry', 'campaign');
            const snapshot = doc.getFlag('kanka-foundry', 'snapshot');

            if (!type || !campaign || !snapshot) throw new Error('Missing flags on journal entry');

            await updateEntity(doc);
        } catch (error) {
            showError('journal.error.sync');
            logError(error);
        } finally {
            ext(this).render({ force: true });
            target.classList.remove('knk:loading-indicator');
        }
    }

    // --- Overview area merging ---
    // When 'mergeOverviewPages' is enabled, the image, overview, post, and character-profile
    // pages are rendered together as a single combined view rather than as separate pages.

    #isPageInOverviewArea(pageId: string): boolean {
        if (!game.settings?.get('kanka-foundry', 'mergeOverviewPages')) return false;

        const page = ext(this).entry.pages.get(pageId);
        if (!page) return false;

        if (overviewTypes.has(page.type)) return true;

        // An image page is part of the overview area only if it is the very first page in the entry
        if (page.type === 'image') {
            const firstPageId = Object.keys(ext(this)._pages)[0];
            return pageId === firstPageId;
        }

        return false;
    }

    #getOverviewPageIds(): string[] {
        return Object.keys(ext(this)._pages).filter((id) => this.#isPageInOverviewArea(id));
    }

    /** Index of the first non-overview page, or -1 if all pages are in the overview area. */
    #firstNonOverviewIndex(): number {
        const pageIds = Object.keys(ext(this)._pages);
        return pageIds.findIndex((id) => !this.#isPageInOverviewArea(id));
    }

    nextPage(): void {
        const e = ext(this);
        if (e.isMultiple) {
            parentProto.nextPage.call(this);
            return;
        }

        if (this.#isPageInOverviewArea(e.pageId)) {
            // From overview area: jump to first non-overview page
            const idx = this.#firstNonOverviewIndex();
            if (idx >= 0) e.render({ pageIndex: idx });
        } else {
            parentProto.nextPage.call(this);
        }
    }

    previousPage(): void {
        const e = ext(this);
        if (e.isMultiple) {
            parentProto.previousPage.call(this);
            return;
        }

        const firstNonOverview = this.#firstNonOverviewIndex();
        if (this.#isPageInOverviewArea(e.pageId)) {
            // Already in overview area (the first block) — nothing before it
            return;
        }
        if (e.pageIndex === firstNonOverview) {
            // First non-overview page: go back to overview area
            const overviewIds = this.#getOverviewPageIds();
            if (overviewIds.length > 0) {
                e.render({ pageId: overviewIds[0] });
            } else {
                parentProto.previousPage.call(this);
            }
        } else {
            parentProto.previousPage.call(this);
        }
    }

    _updateButtonState(): void {
        parentProto._updateButtonState.call(this);

        const e = ext(this);
        if (e.isMultiple || !e.rendered) return;

        const element = (this as unknown as { element: HTMLElement }).element;
        const previous = element?.querySelector<HTMLButtonElement>('[data-action="previousPage"]');
        const next = element?.querySelector<HTMLButtonElement>('[data-action="nextPage"]');
        if (!next || !previous) return;

        if (this.#isPageInOverviewArea(e.pageId)) {
            // In overview area: disable previous, next goes to first non-overview page
            previous.disabled = true;
            const firstNonOverview = this.#firstNonOverviewIndex();
            next.disabled = firstNonOverview < 0; // disabled if no non-overview pages exist
        }
    }

    goToPage(pageId: string, options?: { anchor?: string }): void {
        const e = ext(this);
        const inOverview = this.#isPageInOverviewArea(pageId);
        const currentInOverview = this.#isPageInOverviewArea(e.pageId);

        // Navigating within the overview area: just scroll, don't re-render
        if (inOverview && currentInOverview) {
            const page = (this as unknown as { element: HTMLElement }).element?.querySelector(
                `.journal-entry-page[data-page-id="${pageId}"]`,
            );
            if (options?.anchor) {
                const sheet = e.getPageSheet(pageId) as unknown as { toc?: Record<string, { element?: HTMLElement }> };
                const heading = sheet?.toc?.[options.anchor]?.element;
                if (heading) {
                    heading.scrollIntoView();
                    return;
                }
            }
            page?.scrollIntoView();
            return;
        }

        // Delegate to parent for all other navigation
        parentProto.goToPage.call(this, pageId, options);
    }

    _preparePageData(): Record<string, JournalSheetPageContext> {
        const pages = parentProto._preparePageData.call(this);

        const entry = ext(this).entry;
        for (const [id, page] of Object.entries(pages)) {
            const actualPage = entry.pages.get(id);
            if (!actualPage) continue;

            // Localize page names
            if (page.name.startsWith('KANKA.')) {
                page.name = localization.localize(page.name);
            }

            // Force non-editable
            page.editable = false;

            // Add Kanka-specific TOC classes
            const system = actualPage.system as { totalCount?: number; publicCount?: number; type?: string };
            const count = actualPage.isOwner ? system.totalCount : system.publicCount;
            if (count != null) {
                const countClass = count > 99 ? 'kanka-count kanka-count-limit' : `kanka-count kanka-count-${count}`;
                page.tocClass = `${page.tocClass} ${countClass}`;
            }
            if (system.type) {
                page.tocClass = `${page.tocClass} kanka-type-${system.type}`;
            }
        }

        return pages;
    }

    // biome-ignore lint/suspicious/noExplicitAny: fvtt-types stubs are incomplete
    _configureRenderParts(options: any): Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> {
        const parts = parentProto._configureRenderParts.call(this, options);

        const e = ext(this);
        if (!e.isMultiple && this.#isPageInOverviewArea(e.pageId)) {
            // Remove the parent's single-page entry so we can re-add all
            // overview pages in _pages order (preserving correct DOM order
            // for the CSS sibling selector .image + .overview)
            delete parts[e.pageId];
            for (const id of this.#getOverviewPageIds()) {
                parts[id] = { template: 'templates/journal/page.hbs' };
            }
        }

        return parts;
    }

    // biome-ignore lint/suspicious/noExplicitAny: fvtt-types stubs are incomplete
    async _preparePagesContext(context: any, options: any): Promise<void> {
        const e = ext(this);
        // In SINGLE mode with overview merging, show all overview pages
        if (!e.isMultiple && this.#isPageInOverviewArea(e.pageId)) {
            const overviewIds = this.#getOverviewPageIds();
            context.pages = overviewIds.map((id) => e._pages[id]);
        } else {
            await parentProto._preparePagesContext.call(this, context, options);
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: fvtt-types stubs are incomplete
    async _onRender(context: any, options: any): Promise<void> {
        await (parentProto as unknown as { _onRender(c: unknown, o: unknown): Promise<void> })._onRender.call(
            this,
            context,
            options,
        );

        // Foundry's _renderPageViews (called by parent _onRender) sets element.hidden
        // based on the TOC search filter. When in overview mode, all overview pages must
        // remain visible regardless of the search filter state.
        const e = ext(this);
        if (!e.isMultiple && this.#isPageInOverviewArea(e.pageId)) {
            const element = (this as unknown as { element: HTMLElement }).element;
            for (const id of this.#getOverviewPageIds()) {
                const el = element?.querySelector<HTMLElement>(`.journal-entry-page[data-page-id="${id}"]`);
                if (el) el.hidden = false;
            }
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: fvtt-types stubs are incomplete
    _replaceHTML(result: any, content: any, options: any): void {
        // Call parent _replaceHTML (handles standard part replacement + page appending)
        (parentProto as unknown as { _replaceHTML(r: unknown, c: unknown, o: unknown): void })._replaceHTML.call(
            this,
            result,
            content,
            options,
        );

        // Clean up stale page elements in the container.
        // When switching between overview and non-overview pages, the parent's
        // _replaceHTML may leave old page elements from the previous render mode.
        const element = (this as unknown as { element: HTMLElement }).element;
        const container = element?.querySelector('.journal-entry-pages');
        if (!container) return;

        const e = ext(this);
        const inOverview = !e.isMultiple && this.#isPageInOverviewArea(e.pageId);
        const allowedIds = inOverview ? new Set(this.#getOverviewPageIds()) : new Set([e.pageId]);

        for (const el of Array.from(container.querySelectorAll('.journal-entry-page'))) {
            const pageId = (el as HTMLElement).dataset.pageId;
            if (pageId && !allowedIds.has(pageId)) {
                el.remove();
            }
        }
    }
}
