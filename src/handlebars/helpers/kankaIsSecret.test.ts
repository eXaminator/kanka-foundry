/* eslint-disable @typescript-eslint/naming-convention */
import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { KankaVisibility } from '../../types/kanka';
import kankaIsSecret from './kankaIsSecret';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaIsSecret()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaIsSecret', kankaIsSecret as unknown as Handlebars.HelperDelegate);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaIsSecret');
    });

    it('returns false if no permission property is present', () => {
        const template = '{{#unless (kankaIsSecret object)}}success{{/unless}}';

        expect(compile(template, { object: { foo: 'bar' } })).toEqual('success');
    });

    [KankaVisibility.all, KankaVisibility.members].forEach((visibility) => {
        it(`returns false if visibility_id is ${visibility}`, () => {
            const template = '{{#unless (kankaIsSecret object)}}success{{/unless}}';

            expect(compile(template, { object: { visibility_id: visibility } })).toEqual('success');
        });
    });

    [KankaVisibility.admin, KankaVisibility.adminSelf, KankaVisibility.self].forEach((visibility) => {
        it(`returns true if visibility_id is ${visibility}`, () => {
            const template = '{{#if (kankaIsSecret object)}}success{{/if}}';

            expect(compile(template, { object: { visibility_id: visibility } })).toEqual('success');
        });
    });

    it('returns false if is_private is false', () => {
        const template = '{{#unless (kankaIsSecret object)}}success{{/unless}}';

        expect(compile(template, { object: { is_private: false } })).toEqual('success');
    });

    it('returns true if is_private is true', () => {
        const template = '{{#if (kankaIsSecret object)}}success{{/if}}';

        expect(compile(template, { object: { is_private: true } })).toEqual('success');
    });

    it('returns false if isPrivate is false', () => {
        const template = '{{#unless (kankaIsSecret object)}}success{{/unless}}';

        expect(compile(template, { object: { isPrivate: false } })).toEqual('success');
    });

    it('returns true if isPrivate is true', () => {
        const template = '{{#if (kankaIsSecret object)}}success{{/if}}';

        expect(compile(template, { object: { isPrivate: true } })).toEqual('success');
    });

    it('returns true if any argument is private in some way', () => {
        const object1 = { isPrivate: false };
        const object2 = { isPrivate: true };
        const template = '{{#if (kankaIsSecret object1 object2)}}success{{/if}}';

        expect(compile(template, { object1, object2 })).toEqual('success');
    });
});
