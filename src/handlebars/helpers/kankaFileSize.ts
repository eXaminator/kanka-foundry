const types = ['B', 'KB', 'MB', 'GB'];
const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export default function kankaFileSize(size: unknown): string {
    if (typeof size !== 'number') return '0 B';

    let steps = 0;
    let resultSize = size;

    while (resultSize > 999 && steps < types.length - 1) {
        resultSize /= 1024;
        steps += 1;
    }

    return `${formatter.format(resultSize)} ${types[steps]}`;
}
