import PrimaryEntity from '../kanka/entities/PrimaryEntity';
import EntityType from '../types/EntityType';
import { KankaApiEntityId } from '../types/kanka';
import { findEntryByEntity, findEntryByEntityId, writeJournalEntry } from './journal';
import KankaBrowser from './KankaBrowser';

export default class KankaBrowserJournal extends KankaBrowser {
    get title(): string {
        return 'Kanka Journal Import';
    }

    protected async syncEntity(entity: PrimaryEntity): Promise<void> {
        await writeJournalEntry(entity, this.localization);
    }

    protected async linkEntity(entity: PrimaryEntity): Promise<void> {
        await writeJournalEntry(entity, this.localization);
    }

    protected async syncType(type: EntityType): Promise<void> {
        const entities = await this.getEntitiesByType(type);
        const linkedEntities = entities.filter(entity => !!findEntryByEntity(entity));

        await Promise.all(linkedEntities.map(entity => this.syncEntity(entity)));
    }

    protected async linkType(type: EntityType): Promise<void> {
        const entities = await this.getEntitiesByType(type);
        const unlinkedEntities = entities.filter(entity => !findEntryByEntity(entity));

        // eslint-disable-next-line no-restricted-syntax
        for (const entity of unlinkedEntities) {
            // eslint-disable-next-line no-await-in-loop
            await this.linkEntity(entity);
        }
    }

    protected async syncAll(): Promise<void> {
        await Promise.all(this.getImportableEntityTypes().map(t => this.syncType(t)));
    }

    protected async openEntry(entityId?: KankaApiEntityId): Promise<void> {
        const entry = findEntryByEntityId(Number(entityId));
        entry?.sheet.render(true);
    }
}
