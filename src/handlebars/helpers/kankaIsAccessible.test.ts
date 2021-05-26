/* eslint-disable @typescript-eslint/naming-convention */
import { KankaVisibility } from '../../types/kanka';
import kankaIsAccessible from './kankaIsAccessible';

describe('kankaIsAccessible()', () => {
    let options: Handlebars.HelperOptions;

    beforeEach(() => {
        options = {
            hash: {},
            fn: () => '',
            inverse: () => '',
        };
    });

    it('returns true if no permission property is present', () => {
        expect(kankaIsAccessible({ foo: 'bar' }, options)).toBe(true);
    });

    it('returns true if visibility is "all" or "members"', () => {
        expect(kankaIsAccessible({ visibility: KankaVisibility.all }, options)).toBe(true);
        expect(kankaIsAccessible({ visibility: KankaVisibility.members }, options)).toBe(true);
    });

    it('returns true if visibility is anything but "all" or "members" but user is owner', () => {
        expect(kankaIsAccessible(
            { visibility: KankaVisibility.admin },
            { ...options, data: { root: { owner: true } } },
        )).toBe(true);
        expect(kankaIsAccessible(
            { visibility: KankaVisibility.adminSelf },
            { ...options, data: { root: { owner: true } } },
        )).toBe(true);
        expect(kankaIsAccessible(
            { visibility: KankaVisibility.self },
            { ...options, data: { root: { owner: true } } },
        )).toBe(true);
    });

    it('returns false if visibility is anything but "all" or "members"', () => {
        expect(kankaIsAccessible({ visibility: KankaVisibility.admin }, options)).toBe(false);
        expect(kankaIsAccessible({ visibility: KankaVisibility.adminSelf }, options)).toBe(false);
        expect(kankaIsAccessible({ visibility: KankaVisibility.self }, options)).toBe(false);
    });

    it('returns true if is_private is false', () => {
        expect(kankaIsAccessible({ is_private: false }, options)).toBe(true);
    });

    it('returns true if is_private is true but user is owner', () => {
        expect(kankaIsAccessible({ is_private: true }, { ...options, data: { root: { owner: true } } })).toBe(true);
    });

    it('returns false if is_private is true', () => {
        expect(kankaIsAccessible({ is_private: true }, options)).toBe(false);
    });

    it('returns true if isPrivate is false', () => {
        expect(kankaIsAccessible({ isPrivate: false }, options)).toBe(true);
    });

    it('returns true if isPrivate is true but user is owner', () => {
        expect(kankaIsAccessible({ isPrivate: false }, { ...options, data: { root: { owner: true } } })).toBe(true);
    });

    it('returns false if isPrivate is true', () => {
        expect(kankaIsAccessible({ isPrivate: true }, options)).toBe(false);
    });
});
