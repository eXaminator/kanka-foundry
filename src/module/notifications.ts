import getMessage from './getMessage';

// Wait for everything to be ready before showing a notification
function notifyWhenAvailable(type: 'info' | 'warn' | 'error', options: Notifications.Options, ...args: Parameters<typeof getMessage>): void {
    if (!ui?.notifications) {
        setTimeout(() => notifyWhenAvailable(type, options, ...args), 250);
        return;
    }

    try {
        ui.notifications?.[type](getMessage(...args), options);
    } catch {
        setTimeout(() => notifyWhenAvailable(type, options, ...args), 250);
    }
}

export function showInfo(...args: Parameters<typeof getMessage>): void {
    notifyWhenAvailable('info', {}, ...args);
}

export function showWarning(...args: Parameters<typeof getMessage>): void {
    notifyWhenAvailable('warn', {}, ...args);
}

export function showError(...args: Parameters<typeof getMessage>): void {
    notifyWhenAvailable('error', { permanent: true }, ...args);
}
