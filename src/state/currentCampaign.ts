import { KankaApiCampaign } from '../types/kanka';

let currentCampaign: KankaApiCampaign | undefined;

export function setCurrentCampaign(campaign: KankaApiCampaign | undefined): void {
    currentCampaign = campaign;
}

export function getCurrentCampaign(): KankaApiCampaign | undefined {
    return currentCampaign;
}
