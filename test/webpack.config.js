const path = require('path');
const { WebpackAssertTreeShakingPlugin } = require('../dist');

/** @type {import('webpack').Configuration */
const config = {
    mode: 'production',
    entry: path.join(__dirname, 'index.js'),
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'index.js',
    },
    plugins: [
        new WebpackAssertTreeShakingPlugin([
            {
                modulePath: path.join(__dirname, 'shaken.js'),
                values: ['noShaken'],
            },
            {
                modulePath: path.join(__dirname, 'no-shaken.js'),
            },
        ]),
    ],
};

module.exports = config;
