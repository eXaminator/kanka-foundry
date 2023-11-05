export default function kankaReplace(value: string, search: string, replace: string): string {
    const serachRegEx = new RegExp(search, 'g');

    return value.replace(serachRegEx, replace);
}
