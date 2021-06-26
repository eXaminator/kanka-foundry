function compare(value1: unknown, value2: unknown): boolean {
    if (typeof value2 === 'string') {
        const [, isRegex, value] = value2.match(/(regex:)?(.*)/) ?? [];

        if (isRegex) {
            const regex = new RegExp(value);
            return regex.test(String(value1));
        }
    }

    return value1 === value2;
}

export default function kankaEq(value1: unknown, value2: unknown, options: Handlebars.HelperOptions): boolean {
    if (options.hash.not) {
        return !compare(value1, value2);
    }

    return compare(value1, value2);
}
