/* eslint-disable no-console */
import moduleConfig from './module.json';

export function info(...args: unknown[]): void {
    console.log(moduleConfig.name, ' | ', ...args);
}

export function error(...args: unknown[]): void {
    console.error(moduleConfig.name, ' | ', ...args);
}
