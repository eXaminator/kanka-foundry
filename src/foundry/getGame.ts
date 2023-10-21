type ExtendedGame = Game & {
    journal: Journal;
    folders: Folder;
    i18n: Localization;
    settings: ClientSettings;
};

export default function getGame(): ExtendedGame {
    return game as ExtendedGame;
}
