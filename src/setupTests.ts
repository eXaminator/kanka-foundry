// eslint-disable-next-line import/no-extraneous-dependencies
import * as Handlebars from 'handlebars';

window.getProperty = function getProperty(object, key) {
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

window.Handlebars = Handlebars;
