export default function kankaIsOneOf(value: unknown, ...comparisons: unknown[]): boolean {
    comparisons.pop();
    return comparisons.find(cmp => cmp === value) !== undefined;
}
