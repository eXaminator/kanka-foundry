/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/naming-convention,max-classes-per-file,@typescript-eslint/no-explicit-any */

declare module '*.hbs' {
    const path: string;
    export default path;
}

type ConstructorOf<C> = { new(...args: any[]): C };

declare class Folder {
    static [key: string]: any;
    [key: string]: any;
}

declare class JournalEntry {
    static [key: string]: any;
    [key: string]: any;
}

interface Journal {
    [key: string]: any;
}

interface Folders {
    [key: string]: any;
}

interface User {
    [key: string]: any;
}

interface Window {
    _templateCache: Record<string, () => string>,
    getProperty<T = unknown, K = keyof T>(object: T, key: K | string): K extends keyof T ? T[K] : unknown,
}
