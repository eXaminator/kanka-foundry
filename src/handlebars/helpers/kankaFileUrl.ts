import api from '../../api';

export default function kankaFileUrl(url: string): string {
    if (url.startsWith('http')) {
        return url;
    }

    let path = url;

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    const baseUrl = new URL(api.baseUrl);
    return `${baseUrl.origin}${path}`;
}
