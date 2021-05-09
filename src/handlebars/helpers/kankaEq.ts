export default function kankaEq(value1: unknown, value2: unknown, options: Handlebars.HelperOptions): boolean {
    if (options.hash.not) {
        return value1 !== value2;
    }

    return value1 === value2;
}
