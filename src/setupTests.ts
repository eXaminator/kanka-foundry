// eslint-disable-next-line import/no-extraneous-dependencies
import * as Handlebars from 'handlebars';

global.getProperty = function getProperty(object, key) {
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

global.Handlebars = Handlebars;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.TextEditor = class TextEditor {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static enrichHTML(text): string {
        return text;
    }
};
