import MockDate from 'mockdate';
import AccessToken from './AccessToken';

describe('AccessToken', () => {
    const expiration = 1516239222;
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkyMjJ9.rorjwxWeni_tuACgYONiK7OCJ7Lov54Cj1duKO3dmWE';

    afterEach(() => {
        MockDate.reset();
    });

    it('can handle proper JSON-Web-Token', () => {
        const token = new AccessToken(jwt);

        expect(token.toString()).toEqual(jwt);
    });

    describe('isExpired()', () => {
        it('returns true if current date is after expiration date', () => {
            MockDate.set(expiration * 1000 + 1);

            const token = new AccessToken(jwt);

            expect(token.isExpired()).toBeTruthy();
        });

        it('returns true if current date is exactly equal to expiration date', () => {
            MockDate.set(expiration * 1000);

            const token = new AccessToken(jwt);

            expect(token.isExpired()).toBeTruthy();
        });

        it('returns false if current date is before expiration date', () => {
            MockDate.set(expiration * 1000 - 1);

            const token = new AccessToken(jwt);

            expect(token.isExpired()).toBeFalsy();
        });
    });

    describe('isExpiredWithin()', () => {
        it('returns true if current date is after expiration date', () => {
            MockDate.set((expiration * 1000) + 1);

            const token = new AccessToken(jwt);

            expect(token.isExpiredWithin(1)).toBeTruthy();
        });

        it('returns true if current date is exactly equal to expiration date', () => {
            MockDate.set((expiration * 1000));

            const token = new AccessToken(jwt);

            expect(token.isExpiredWithin(1)).toBeTruthy();
        });

        it('returns true if current date is before expiration date but within timeframe', () => {
            MockDate.set((expiration * 1000) - 500);

            const token = new AccessToken(jwt);

            expect(token.isExpiredWithin(1)).toBeTruthy();
        });

        it('returns false if current date is before expiration date and timeframe', () => {
            MockDate.set((expiration * 1000));

            const token = new AccessToken(jwt);

            expect(token.isExpiredWithin(1)).toBeTruthy();
        });

        it('returns false if current date is before expiration date and timeframe', () => {
            MockDate.set((expiration * 1000) - 1001);

            const token = new AccessToken(jwt);

            expect(token.isExpiredWithin(1)).toBeFalsy();
        });
    });
});
