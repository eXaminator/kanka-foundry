import { MetaDataType } from '../types/KankaSettings';

export default interface EntityMetaData {
    type: MetaDataType;
    section: string;
    label: string;
    value: unknown;
    isPrivate?: boolean;
}
