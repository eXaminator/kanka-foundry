export default function kankaNl2br(value: string): Handlebars.SafeString {
    return new Handlebars.SafeString(String(value).replace(/(\r\n|\n\r|\r|\n)/g, '<br />'));
}
