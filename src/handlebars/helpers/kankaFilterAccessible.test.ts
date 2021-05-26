/* eslint-disable @typescript-eslint/naming-convention */
import { KankaVisibility } from '../../types/kanka';
import kankaFilterAccessible from './kankaFilterAccessible';

describe('kankaFilterAccessible()', () => {
    let options: Handlebars.HelperOptions;

    beforeEach(() => {
        options = {
            hash: {},
            fn: () => '',
            inverse: () => '',
        };
    });

    it('filters out all private entries', () => {
        const array = [
            { foo: 'bar' },
            { visibility: KankaVisibility.all },
            { visibility: KankaVisibility.admin },
            { visibility: KankaVisibility.adminSelf },
            { visibility: KankaVisibility.members },
            { visibility: KankaVisibility.self },
            { is_private: false },
            { is_private: true },
            { isPrivate: false },
            { isPrivate: true },
        ];

        const result = kankaFilterAccessible(array, options);

        expect(result).toHaveLength(5);
        expect(result).toEqual([
            { foo: 'bar' },
            { visibility: KankaVisibility.all },
            { visibility: KankaVisibility.members },
            { is_private: false },
            { isPrivate: false },
        ]);
    });

    it('returns unfiltered array if ignore option is given', () => {
        const array = [
            { foo: 'bar' },
            { visibility: KankaVisibility.all },
            { visibility: KankaVisibility.admin },
            { visibility: KankaVisibility.adminSelf },
            { visibility: KankaVisibility.members },
            { visibility: KankaVisibility.self },
            { is_private: false },
            { is_private: true },
            { isPrivate: false },
            { isPrivate: true },
        ];

        const result = kankaFilterAccessible(array, { ...options, hash: { ignore: true } });

        expect(result).toEqual(array);
    });

    it('returns unfiltered array if owner is set in root data', () => {
        const array = [
            { foo: 'bar' },
            { visibility: KankaVisibility.all },
            { visibility: KankaVisibility.admin },
            { visibility: KankaVisibility.adminSelf },
            { visibility: KankaVisibility.members },
            { visibility: KankaVisibility.self },
            { is_private: false },
            { is_private: true },
            { isPrivate: false },
            { isPrivate: true },
        ];

        const result = kankaFilterAccessible(array, { ...options, data: { root: { owner: true } } });

        expect(result).toEqual(array);
    });
});
