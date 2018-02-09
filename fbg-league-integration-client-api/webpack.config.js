var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: ['babel-polyfill', './index.js'],
    output: {
        path: path.join(__dirname, '/bundle'),
        filename: 'fbglica.min.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ],
        noParse: /node_modules\/json-schema\/lib\/validate\.js/
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            }
        })
    ],
    node: {
        console: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    },
    devtool: null,
    progress: true
};
