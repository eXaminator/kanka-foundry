import kanka from '../kanka';

export default async function ready(): Promise<void> {
    await kanka.onReady();
}
