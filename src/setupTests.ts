/* eslint-disable import/no-extraneous-dependencies */
import * as Handlebars from 'handlebars';
import { vi } from 'vitest';

globalThis.getProperty = function getProperty(object, key) {
    if (!key) return undefined;
    let target = object;
    // eslint-disable-next-line no-restricted-syntax
    for (const p of key.split('.')) {
        target = target || {};
        if (p in target) target = target[p];
        else return undefined;
    }
    return target;
};

globalThis.Handlebars = Handlebars;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.TextEditor = class TextEditor {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static enrichHTML(text): string {
        return text;
    }
};

vi.mock('./kanka.ts');
vi.mock('./scss.ts');
vi.mock('./templates.ts');
