declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.hbs' {
    const template: HandlebarsTemplateDelegate;
    export const path: string;
    export default template;
}

interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CONFIG: {
        JournalEntry: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sheetClass: any;
        };
    };
}
