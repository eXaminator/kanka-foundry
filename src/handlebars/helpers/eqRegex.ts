export default function eqRegex(value: string, regexString: string): boolean {
    const regex = new RegExp(regexString);
    return regex.test(String(value));
}
