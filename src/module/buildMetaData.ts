import EntityAttribute from '../kanka/entities/EntityAttribute';
import EntityMetaData from '../kanka/entities/EntityMetaData';
import InventoryItem from '../kanka/entities/InventoryItem';
import PrimaryEntity from '../kanka/entities/PrimaryEntity';
import QuestReference from '../kanka/entities/QuestReference';
import { KankaApiCharacterTrait, KankaVisibility } from '../types/kanka';
import {
    KankaSettings,
    MetaDataAttributeVisibility,
    MetaDataBasicVisibility,
    MetaDataCharacterTraitVisibility,
    MetaDataInventoryVisibility,
    MetaDataQuestReferenceVisibility,
    MetaDataType,
} from '../types/KankaSettings';
import { getSetting } from './accessSettings';

interface MetaDataValue {
    value: string;
    linkTo?: PrimaryEntity;
}

interface MetaData {
    label: string;
    values: MetaDataValue[];
}

interface MetaDataSection {
    label: string;
    data: MetaData[];
}

function translateMetaDataLabel(key: string, localization: Localization): string {
    if (!key) return key;

    const labelKey = `KANKA.MetaData.${key}`;
    const label = localization.localize(labelKey);

    return label === labelKey ? key : label;
}

function translateMetaDataValue(value: unknown, localization: Localization): string {
    if (value === true) {
        return localization.localize('KANKA.MetaData.boolean.true');
    }

    if (value === false) {
        return localization.localize('KANKA.MetaData.boolean.false');
    }

    return String(value).replace('\n', '<br/>');
}

function checkSetting<T>(
    data: EntityMetaData<T>,
    setting: KankaSettings,
    results: Record<string, boolean | ((data: T) => boolean)>,
): boolean {
    const settingValue = getSetting(setting) as string;
    const result = results[settingValue];

    if (result === undefined) {
        return true;
    }

    if (result === true || result === false) {
        return result;
    }

    if (data.originalData === undefined) {
        return true;
    }

    return result(data.originalData);
}

function byMetaDataConfiguration(data: EntityMetaData): boolean {
    if (data.type === MetaDataType.basic) {
        return checkSetting(
            data,
            KankaSettings.metaDataBasicVisibility,
            {
                [MetaDataBasicVisibility.all]: true,
                [MetaDataBasicVisibility.none]: false,
            },
        );
    }

    if (data.type === MetaDataType.attribute) {
        return checkSetting(
            data as EntityMetaData<EntityAttribute>,
            KankaSettings.metaDataAttributeVisibility,
            {
                [MetaDataAttributeVisibility.all]: true,
                [MetaDataAttributeVisibility.none]: false,
                [MetaDataAttributeVisibility.public]: original => original.isPublic(),
                [MetaDataAttributeVisibility.allStarred]: original => original.isStarred(),
                [MetaDataAttributeVisibility.publicStarred]: original => original.isPublic() && original.isStarred(),
            },
        );
    }

    if (data.type === MetaDataType.characterTrait) {
        return checkSetting(
            data as EntityMetaData<KankaApiCharacterTrait>,
            KankaSettings.metaDataCharacterTraitVisibility,
            {
                [MetaDataCharacterTraitVisibility.all]: true,
                [MetaDataCharacterTraitVisibility.personality]: original => original.section === 'personality',
                [MetaDataCharacterTraitVisibility.appearance]: original => original.section === 'appearance',
                [MetaDataCharacterTraitVisibility.none]: false,
            },
        );
    }

    if (data.type === MetaDataType.questReference) {
        return checkSetting(
            data as EntityMetaData<QuestReference>,
            KankaSettings.metaDataQuestReferenceVisibility,
            {
                [MetaDataQuestReferenceVisibility.all]: true,
                [MetaDataQuestReferenceVisibility.public]: original => !original.isPrivate,
                [MetaDataQuestReferenceVisibility.none]: false,
            },
        );
    }

    if (data.type === MetaDataType.inventory) {
        return checkSetting(
            data as EntityMetaData<InventoryItem>,
            KankaSettings.metaDataInventoryVisibility,
            {
                [MetaDataInventoryVisibility.all]: true,
                [MetaDataInventoryVisibility.public]: ({ visibility }) => visibility === KankaVisibility.all,
                [MetaDataInventoryVisibility.none]: false,
            },
        );
    }

    return true;
}

async function buildMetaDataForSection(
    entity: PrimaryEntity,
    section: string | undefined,
    localization: Localization,
): Promise<MetaData[]> {
    const metaData = await entity.getMetaDataBySection(section);
    const groupedByLabel = new Map<string, typeof metaData>();

    metaData
        .filter(byMetaDataConfiguration)
        .forEach((data) => {
            if (!groupedByLabel.has(data.label)) {
                groupedByLabel.set(data.label, []);
            }
            groupedByLabel.get(data.label)?.push(data);
        });

    return Array
        .from(groupedByLabel.entries())
        .map(([label, data]) => ({
            label: translateMetaDataLabel(label, localization),
            values: data.map(valueEntry => ({
                value: translateMetaDataValue(valueEntry.value, localization),
            })),
        }));
}

export default async function buildMetaData(
    entity: PrimaryEntity,
    localization: Localization,
): Promise<MetaDataSection[]> {
    const sections = await entity.metaDataSections();
    const metaData = await Promise.all(sections.map(section => buildMetaDataForSection(entity, section, localization)));

    return sections
        .map((section, index) => ({
            label: translateMetaDataLabel(section, localization),
            data: metaData[index],
        }))
        .filter(section => section.data.length > 0)
        .sort(a => (!a.label ? -1 : 0));
}
