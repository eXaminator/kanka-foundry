import jwtDecode from 'jwt-decode';

const warnTimeRange = 7 * 24 * 60 * 60; // One week

export default function validateAccessToken(token?: string): void {
    if (!token) {
        return;
    }

    try {
        const data = jwtDecode<{ exp: number }>(token);
        const remainingTime = data.exp - (Date.now() / 1000);
        if (remainingTime < 0) {
            ui.notifications.error(game.i18n.localize('KANKA.ErrorTokenExpired'));
        } else if (remainingTime < warnTimeRange) {
            ui.notifications.warn(game.i18n.localize('KANKA.WarningTokenExpiration'));
        }
    } catch (e) {
        ui.notifications.error(game.i18n.localize('KANKA.ErrorInvalidAccessToken'));
    }
}
