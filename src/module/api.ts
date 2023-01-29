import KankaApi from '../api/KankaApi';

// eslint-disable-next-line import/no-mutable-exports
let api = new KankaApi();

export default api;

if (import.meta.hot) {
    import.meta.hot.accept('../api/KankaApi', (newModule) => {
        if (!newModule) return;
        const newApi = new (newModule.default as ConstructorOf<KankaApi>)();
        api = newApi;
    });
}
