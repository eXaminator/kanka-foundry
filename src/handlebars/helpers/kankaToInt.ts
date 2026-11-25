export default function kankaToInt(value: string | number | boolean | null | undefined): number {
    if (typeof value === 'boolean') return Number(value);
    if (typeof value === 'number') return Math.trunc(value);
    return Number.parseInt(value ?? '', 10);
}
