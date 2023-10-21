import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import kankaToLowerCase from './kankaToLowerCase';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaToLowerCase()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaToLowerCase', kankaToLowerCase);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaToLowerCase');
    });

    it('returns the given string in lower case', () => {
        expect(compile('{{ kankaToLowerCase "FooBar" }}')).toBe('foobar');
    });

    it('returns undefined if input is undefined', () => {
        expect(compile('{{ kankaToLowerCase foo }}')).toBe('');
    });
});
