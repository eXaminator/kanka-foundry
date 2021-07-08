/// <reference types="@league-of-foundry-developers/foundry-vtt-types" />

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.hbs' {
    const template: HandlebarsTemplateDelegate;
    export const path: string;
    export default template;
}
