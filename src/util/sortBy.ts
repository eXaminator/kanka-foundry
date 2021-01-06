export default function sortBy<T>(name: keyof T): (a: T, b: T) => number {
    return (a: T, b: T) => String(a[name]).localeCompare(String(b[name]));
}
