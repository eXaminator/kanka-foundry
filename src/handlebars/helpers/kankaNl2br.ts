export default function kankaNl2br(value: string): string {
    return String(value).replace(/(\r\n|\n\r|\r|\n)/g, '<br />');
}
