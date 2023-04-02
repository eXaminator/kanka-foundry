/* eslint-disable no-console */
import moduleConfig from '../../public/module.json';

export function logInfo(...args: unknown[]): void {
    console.log(moduleConfig.name, ' | ', ...args);
}

export function logError(...args: unknown[]): void {
    console.error(moduleConfig.name, ' | ', ...args);
}
