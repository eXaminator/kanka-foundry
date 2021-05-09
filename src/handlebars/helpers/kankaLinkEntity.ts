import createKankaLink from '../../util/createKankaLink';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function kankaLinkEntity(this: Record<string, unknown>, ...args: any[]): Handlebars.SafeString {
    const options = args.pop();
    const [type, id] = args;

    const link = createKankaLink(
        options?.fn?.(this),
        options.data?.root?.kankaCampaignId,
        type,
        id,
        undefined,
        options.hash?.class,
    );
    return new Handlebars.SafeString(link);
}
