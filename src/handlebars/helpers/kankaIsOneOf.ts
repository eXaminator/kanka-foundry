export default function kankaIsOneOf(value: unknown, ...comparisons: unknown[]): boolean {
    comparisons.pop();
    return comparisons.some(cmp => cmp === value);
}
