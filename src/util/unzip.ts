export default function unzip<T>(array: T[], splitter: (item: T, index: number) => boolean): [T[], T[]] {
    return array.reduce<[T[], T[]]>(
        (entries, entry, index) => {
            if (splitter(entry, index)) {
                entries[0].push(entry);
            } else {
                entries[1].push(entry);
            }

            return entries;
        },
        [[], []],
    );
}