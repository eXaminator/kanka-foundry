/* eslint-disable @typescript-eslint/no-explicit-any */
import kanka from '../../kanka';
import { getSetting } from '../../module/settings';
import Reference from '../../types/Reference';
import createJournalLink from '../../util/createJournalLink';
import createKankaLink from '../../util/createKankaLink';

export default function kankaLinkReference(
    this: Record<string, unknown>,
    reference: Reference | undefined,
    options: Handlebars.HelperOptions,
): Handlebars.SafeString | string | undefined {
    const label = options?.fn?.(this)
        || reference?.name
        || kanka.getMessage('journal.shared.labels.unknownReference');

    if (!reference) return new Handlebars.SafeString(label);

    const journalEntry = kanka.journals.findByEntityId(reference.entityId);

    if (journalEntry?.visible) {
        return new Handlebars.SafeString(createJournalLink(journalEntry, label));
    }

    if (getSetting('disableExternalMentionLinks')) return new Handlebars.SafeString(label);

    const link = createKankaLink(
        label,
        options.data?.root?.kankaCampaignId,
        reference.type,
        reference.id,
        reference.entityId,
        options?.hash?.class ?? 'kanka-reference-link',
    );

    return new Handlebars.SafeString(link);
}
