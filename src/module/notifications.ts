import getMessage from './getMessage';

export function showInfo(...args: [...string[], Record<string, unknown>] | string[]): void {
    ui.notifications?.info(getMessage(...args));
}

export function showWarning(...args: [...string[], Record<string, unknown>] | string[]): void {
    ui.notifications?.warn(getMessage(...args));
}

export function showError(...args: [...string[], Record<string, unknown>] | string[]): void {
    ui.notifications?.error(getMessage(...args), { permanent: true });
}
