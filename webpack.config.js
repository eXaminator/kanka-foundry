const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join, resolve, extname, basename } = require('path');
const moduleConfig = require('./src/module.json');

const devMode = process.env.NODE_ENV !== 'production';

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
                    { loader: 'file-loader', options: { name: '[path][name].[ext]', context: 'src' } },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
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
                { from: './src/lang', to: './lang' },
                { from: './src/templates', to: './templates' },
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
        writeToDisk: filePath => /\/(templates|lang)\//.test(filePath),
    },
    optimization: {
        minimize: !devMode,
    },
    watchOptions: {
        ignored: /node_modules/,
    },
};
