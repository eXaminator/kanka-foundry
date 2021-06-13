function getIconClass(mimeType: string): `fa-${string}` {
    if (mimeType.startsWith('image')) return 'fa-file-image';
    if (mimeType.startsWith('video')) return 'fa-file-video';
    if (mimeType.startsWith('audio')) return 'fa-file-audio';
    if (mimeType.startsWith('application/pdf')) return 'fa-file-pdf';
    if (mimeType.startsWith('application/msexcel')) return 'fa-file-excel';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'fa-file-excel';

    return 'fa-file';
}

export default function kankaFileIcon(mimeType: string): Handlebars.SafeString {
    const cls = getIconClass(mimeType);

    return new Handlebars.SafeString(`<i class="fas ${cls}"></i>`);
}
