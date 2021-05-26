import kankaNl2br from './kankaNl2br';

describe('kankaNl2br()', () => {
    it('replaces all new lines by <br> tags', () => {
        expect(kankaNl2br('foo\nbar\r\nbaz').toString()).toEqual('foo<br />bar<br />baz');
    });
});
