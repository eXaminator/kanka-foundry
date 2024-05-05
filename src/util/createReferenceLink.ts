import getMessage from '../foundry/getMessage';
import { findEntryByEntityId } from '../foundry/journalEntries';
import { getSetting } from '../foundry/settings';
import type Reference from '../types/Reference';

export default async function createReferenceLink(reference: Reference): Promise<string> {
    const label = reference.name || getMessage('journal.shared.labels.unknownReference');
    const journalEntry = findEntryByEntityId(reference.entityId);

    if (journalEntry?.visible) {
        return TextEditor.enrichHTML(journalEntry.link);
    }

    if (getSetting('disableExternalMentionLinks') || !reference?.urls?.view) return label;

    return `<a href="${reference.urls.view}" target="_blank">${label}</a>`;
}
