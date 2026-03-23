/**
 * Type definitions for Foundry v13 V2 journal sheet runtime API.
 * The fvtt-types stubs are incomplete — these provide types for runtime methods
 * discovered from inspecting the actual Foundry v13 source.
 *
 * Used via type assertions in our sheet implementations until fvtt-types completes the stubs.
 */

export interface JournalSheetPageContext {
    id: string;
    editable: boolean;
    hidden: boolean;
    tocClass: string;
    viewClass: string;
    name: string;
    number: number;
    icon: string;
    ownershipClass: string;
    category?: string;
    sort: number;
    uncategorized?: boolean;
}

/**
 * Extended JournalEntrySheet with runtime methods not yet typed in fvtt-types.
 */
export interface JournalEntrySheetExt {
    _pages: Record<string, JournalSheetPageContext>;
    readonly pageId: string;
    readonly pageIndex: number;
    readonly isMultiple: boolean;
    readonly entry: JournalEntry.Implementation;
    readonly mode: number;
    readonly document: JournalEntry.Implementation;
    readonly isEditable: boolean;
    goToPage(pageId: string, options?: { anchor?: string }): void;
    nextPage(): void;
    previousPage(): void;
    getPageSheet(
        page: JournalEntryPage.Implementation | string,
    ): foundry.applications.sheets.journal.JournalEntryPageSheet;
    isPageVisible(page: JournalEntryPage.Implementation): boolean;
    _preparePageData(): Record<string, JournalSheetPageContext>;
    _preparePagesContext(context: Record<string, unknown>, options: Record<string, unknown>): Promise<void>;
    _getHeaderControls(): foundry.applications.api.ApplicationV2.HeaderControlsEntry[];
    _configureRenderParts(
        options: Record<string, unknown>,
    ): Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart>;
    readonly rendered: boolean;
    render(options?: Record<string, unknown>): unknown;
    _onRender(context: Record<string, unknown>, options: Record<string, unknown>): Promise<void>;
    _replaceHTML(result: unknown, content: unknown, options: unknown): void;
    _updateButtonState(): void;
}

/**
 * Extended JournalEntryPageSheet with runtime methods not yet typed in fvtt-types.
 */
export interface JournalEntryPageSheetExt {
    readonly document: JournalEntryPage.Implementation;
    readonly page: JournalEntryPage.Implementation;
    readonly isView: boolean;
    readonly isEditable: boolean;
    isV2: boolean;
    _prepareContext(options: Record<string, unknown>): Promise<Record<string, unknown>>;
    _configureRenderParts(
        options: Record<string, unknown>,
    ): Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart>;
    _prepareContentContext(context: Record<string, unknown>, options: unknown): Promise<void>;
}
