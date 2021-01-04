import type KankaNode from './KankaNode';

export default interface KankaNodeClass<T = KankaNode> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new(...args: any[]): T
}
