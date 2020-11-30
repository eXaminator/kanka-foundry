import KankaEndpoint from './KankaEndpoint';

export default interface Entity {
    readonly endpoint: KankaEndpoint;
    readonly id: number;
    readonly isPrivate: boolean;
}
