const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { resolve, extname, basename } = require('path');
const moduleConfig = require('./src/module.json');
const yaml = require('js-yaml');
const flat = require('flat');

const devMode = process.env.NODE_ENV === 'development';

const esModuleEntryPoints = moduleConfig.esmodules
    .reduce((map, file) => {
        const base = basename(file, extname(file));
        return { ...map, [base]: `./src/${base}` };
    }, {});

module.exports = {
    entry: esModuleEntryPoints,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['babel-loader'],
                exclude: [/node_modules/],
            },
            {
                test: /\.scss$/i,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
                exclude: [/node_modules/],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    { loader: 'file-loader', options: { name: '[path][name].[ext]', context: 'src', esModule: false } },
                ],
            },
            {
                test: /\.(hbs)$/,
                use: [
                    { loader: resolve(__dirname, './build/hbs-loader.js') },
                    {
                        loader: 'handlebars-loader',
                        options: {
                            runtime: 'handlebars/runtime',
                            // eslint-disable-next-line no-useless-escape
                            inlineRequires: '/assets/',
                            helperDirs: [
                                resolve(__dirname, './src/handlebars/helpers'),
                            ],
                            extensions: ['.partial.hbs'],
                            knownHelpers: [
                                'checked',
                                'editor',
                                'filePicker',
                                'localize',
                                'numberFormat',
                                'radioBoxes',
                                'select',
                            ],
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            'handlebars/runtime': resolve(__dirname, './src/handlebars/runtime.ts'),
        },
    },
    output: {
        filename: '[name].js',
        path: resolve(__dirname, 'dist'),
        publicPath: `/modules/${moduleConfig.name}/`,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                './src/module.json',
                ...moduleConfig.scripts.map(script => `./src/${String(script)}`),
                {
                    from: './src/lang/**/*.yml',
                    to: './lang/[name].json',
                    transform(content, filename) {
                        return Buffer.from(
                            JSON.stringify(flat(yaml.load(
                                content.toString('utf8'),
                                { schema: yaml.JSON_SCHEMA, filename },
                            ))),
                            'utf8',
                        );
                    },
                },
            ],
        }),
        new MiniCssExtractPlugin(),
    ],
    devtool: 'cheap-module-source-map',
    devServer: {
        inline: true,
        port: 3000,
        publicPath: `/modules/${moduleConfig.name}/`,
        overlay: {
            warnings: false,
            errors: true,
        },
        proxy: {
            '/': {
                target: 'http://localhost',
                ws: false,
            },
            '/socket.io': {
                target: 'http://localhost',
                ws: true,
            },
        },
        liveReload: false,
        writeToDisk: filePath => /\/(lang)\//.test(filePath),
    },
    optimization: {
        minimize: !devMode,
    },
    watchOptions: {
        ignored: /node_modules/,
    },
};
