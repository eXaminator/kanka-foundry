export default function kankaOr(...values: unknown[]): boolean {
    values.pop(); // Remove options
    return values.some(value => Boolean(value));
}
