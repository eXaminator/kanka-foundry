import kanka from '../../kanka';

export default function kankaFileUrl(url: string): string {
    if (url.startsWith('http')) {
        return url;
    }

    let path = url;

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    const baseUrl = new URL(kanka.baseUrl);
    return `${baseUrl.origin}${path}`;
}
