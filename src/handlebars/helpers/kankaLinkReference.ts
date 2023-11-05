/* eslint-disable @typescript-eslint/no-explicit-any */
import getMessage from '../../foundry/getMessage';
import { findEntryByEntityId } from '../../foundry/journalEntries';
import { getSetting } from '../../foundry/settings';
import Reference from '../../types/Reference';
import createJournalLink from '../../util/createJournalLink';

export default function kankaLinkReference(
    this: Record<string, unknown>,
    reference: Reference | undefined,
    options: Handlebars.HelperOptions,
): Handlebars.SafeString | string | undefined {
    const label = options?.fn?.(this)
        || reference?.name
        || getMessage('journal.shared.labels.unknownReference');

    if (!reference) return new Handlebars.SafeString(label);

    const journalEntry = findEntryByEntityId(reference.entityId);

    if (journalEntry?.visible) {
        return new Handlebars.SafeString(createJournalLink(journalEntry, label));
    }

    if (getSetting('disableExternalMentionLinks') || !reference.urls.view) return new Handlebars.SafeString(label);

    return new Handlebars.SafeString(`<a href="${reference.urls.view}" target="_blank">${label}</a>`);
}
