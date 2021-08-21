export default function preDocumentSheetRegistrarInit(settings: {
    Actor: boolean;
    Folder: boolean;
    Item: boolean;
    JournalEntry: boolean;
    Macro: boolean;
    Playlist: boolean;
    RollTable: boolean;
    Scene: boolean;
    User: boolean;
}): void {
    // eslint-disable-next-line no-param-reassign
    settings.JournalEntry = true;
}
