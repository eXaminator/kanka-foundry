/* eslint-disable @typescript-eslint/naming-convention */
import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { KankaVisibility } from '../../types/kanka';
import kankaIsAccessible from './kankaIsAccessible';

function compile(template: string, context = {}): string {
    return Handlebars.compile(template)(context);
}

describe('kankaIsAccessible()', () => {
    beforeAll(() => {
        Handlebars.registerHelper('kankaIsAccessible', kankaIsAccessible as unknown as Handlebars.HelperDelegate);
    });

    afterAll(() => {
        Handlebars.unregisterHelper('kankaIsAccessible');
    });

    it('returns true if no permission property is present', () => {
        const template = '{{#if (kankaIsAccessible object)}}success{{/if}}';

        expect(compile(template, { object: { foo: 'bar' } })).toEqual('success');
    });

    [KankaVisibility.all, KankaVisibility.members].forEach((visibility) => {
        it(`returns true if visibility_id is ${visibility}`, () => {
            const template = '{{#if (kankaIsAccessible object)}}success{{/if}}';

            expect(compile(template, { object: { visibility_id: visibility } })).toEqual('success');
        });
    });

    [KankaVisibility.admin, KankaVisibility.adminSelf, KankaVisibility.self].forEach((visibility) => {
        it(`returns false if visibility_id is ${visibility}`, () => {
            const template = '{{#unless (kankaIsAccessible object)}}success{{/unless}}';

            expect(compile(template, { object: { visibility_id: visibility } })).toEqual('success');
        });

        it(`returns true if visibility_id is "${visibility}" but user is owner`, () => {
            const template = '{{#if (kankaIsAccessible object)}}success{{/if}}';

            expect(compile(template, { object: { visibility_id: visibility }, owner: true })).toEqual('success');
        });
    });

    it('returns true if is_private is false', () => {
        const template = '{{#if (kankaIsAccessible object)}}success{{/if}}';

        expect(compile(template, { object: { is_private: false } })).toEqual('success');
    });

    it('returns false if is_private is true', () => {
        const template = '{{#unless (kankaIsAccessible object)}}success{{/unless}}';

        expect(compile(template, { object: { is_private: true } })).toEqual('success');
    });

    it('returns true if is_private is true but user is owner', () => {
        const template = '{{#if (kankaIsAccessible object)}}success{{/if}}';

        expect(compile(template, { object: { is_private: true }, owner: true })).toEqual('success');
    });

    it('returns true if isPrivate is false', () => {
        const template = '{{#if (kankaIsAccessible object)}}success{{/if}}';

        expect(compile(template, { object: { isPrivate: false } })).toEqual('success');
    });

    it('returns false if isPrivate is true', () => {
        const template = '{{#unless (kankaIsAccessible object)}}success{{/unless}}';

        expect(compile(template, { object: { isPrivate: true } })).toEqual('success');
    });

    it('returns true if isPrivate is true but user is owner', () => {
        const template = '{{#if (kankaIsAccessible object)}}success{{/if}}';

        expect(compile(template, { object: { isPrivate: true }, owner: true })).toEqual('success');
    });
});
