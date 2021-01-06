import createKankaLink from '../createKankaLink';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function getKankaLink(...args: any[]): string {
    const options = args.pop();
    const [type, id] = args;
    const { campaign, profile } = options.data.root;

    return createKankaLink(campaign.id, type, id, profile.locale || campaign.locale);
}
