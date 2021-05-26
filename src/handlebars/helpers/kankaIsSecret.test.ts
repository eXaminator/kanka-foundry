/* eslint-disable @typescript-eslint/naming-convention */
import { KankaVisibility } from '../../types/kanka';
import kankaIsSecret from './kankaIsSecret';

describe('kankaIsSecret()', () => {
    let options: Handlebars.HelperOptions;

    beforeEach(() => {
        options = {
            hash: {},
            fn: () => '',
            inverse: () => '',
        };
    });

    it('returns false if no permission property is present', () => {
        expect(kankaIsSecret({ foo: 'bar' }, options)).toBe(false);
    });

    it('returns false if visibility is "all" or "members"', () => {
        expect(kankaIsSecret({ visibility: KankaVisibility.all }, options)).toBe(false);
        expect(kankaIsSecret({ visibility: KankaVisibility.members }, options)).toBe(false);
    });

    it('returns true if visibility is anything but "all" or "members"', () => {
        expect(kankaIsSecret({ visibility: KankaVisibility.admin }, options)).toBe(true);
        expect(kankaIsSecret({ visibility: KankaVisibility.adminSelf }, options)).toBe(true);
        expect(kankaIsSecret({ visibility: KankaVisibility.self }, options)).toBe(true);
    });

    it('returns false if is_private is false', () => {
        expect(kankaIsSecret({ is_private: false }, options)).toBe(false);
    });

    it('returns true if is_private is true', () => {
        expect(kankaIsSecret({ is_private: true }, options)).toBe(true);
    });

    it('returns false if isPrivate is false', () => {
        expect(kankaIsSecret({ isPrivate: false }, options)).toBe(false);
    });

    it('returns true if isPrivate is true', () => {
        expect(kankaIsSecret({ isPrivate: true }, options)).toBe(true);
    });

    it('returns true if any argument is private in some way', () => {
        expect(kankaIsSecret(
            { isPrivate: false },
            { isPrivate: true },
            options,
        )).toBe(true);
    });
});
