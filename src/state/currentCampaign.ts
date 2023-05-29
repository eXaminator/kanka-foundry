import api from '../api';
import { KankaApiCampaign } from '../types/kanka';

let currentCampaign: KankaApiCampaign | undefined;

export function setCurrentCampaign(campaign: KankaApiCampaign | undefined): void {
    currentCampaign = campaign;
}

export function getCurrentCampaign(): KankaApiCampaign | undefined {
    return currentCampaign;
}

export async function setCurrentCampaignById(id: number | null): Promise<void> {
    if (!api.isReady) {
        return;
    }

    if (id) {
        setCurrentCampaign(await api.getCampaign(id));
    } else {
        setCurrentCampaign(undefined);
    }
}
