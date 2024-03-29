import { JwtPayload, jwtDecode } from 'jwt-decode';

export default class AccessToken {
    #token: string;
    #payload: JwtPayload;

    public constructor(token: string) {
        this.#payload = jwtDecode<JwtPayload>(token);
        this.#token = token;
    }

    private get remainingTime(): number {
        const { exp = 0 } = this.#payload;
        return Math.max(exp - (Date.now() / 1000), 0);
    }

    public isExpired(): boolean {
        return this.remainingTime === 0;
    }

    public isExpiredWithin(timeframe: number): boolean {
        return this.remainingTime <= timeframe;
    }

    public toString(): string {
        return this.#token;
    }
}
