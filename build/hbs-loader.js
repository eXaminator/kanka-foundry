module.exports = function (source) {
    if (this.resource.endsWith('.partial.hbs')) {
        return source;
    }

    const hash = Buffer.from(this.resource.split(this.rootContext)[1] ?? this.resource).toString('hex');
    const path = `modules/kanka-foundry/templates/${hash}.html`;
    return `${source}
    _templateCache['${path}'] = module.exports;
    module.exports.path = '${path}';
    if (module.hot) {
        module.hot.dispose(() => {
            setTimeout(() => {
                Object
                    .values(ui.windows)
                    .forEach(a => {
                        if (a.template === '${path}') a.render(false);
                    });
            }, 100);
        });
        module.hot.accept();
    }
    `;
};
