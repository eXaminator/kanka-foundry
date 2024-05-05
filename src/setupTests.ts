import * as Handlebars from 'handlebars';
import { vi } from 'vitest';

globalThis.getProperty = function getProperty(object, key) {
    if (!key) return undefined;
    let target = object;
    for (const p of key.split('.')) {
        target = target || {};
        if (p in target) target = target[p];
        else return undefined;
    }
    return target;
};

globalThis.Handlebars = Handlebars;

// @ts-ignore
// biome-ignore lint/complexity/noStaticOnlyClass: This is just for testing and can't really be done differently
globalThis.TextEditor = class TextEditor {
    static enrichHTML(text): string {
        return text;
    }
};

vi.mock('./kanka.ts');
vi.mock('./scss.ts');
vi.mock('./templates.ts');
