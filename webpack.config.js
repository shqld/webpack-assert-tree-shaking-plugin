const path = require('path');
const nodeExternals = require('webpack-node-externals');

/** @type {import('webpack').ConfigurationFactory */
const config = (env) => ({
    target: 'node',
    mode: env === 'dev' ? 'development' : 'production',
    entry: path.resolve('src/index.ts'),
    output: {
        path: path.resolve('dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ],
    },
    devtool: 'source-map',
    externals: [nodeExternals()],
});

module.exports = config;
