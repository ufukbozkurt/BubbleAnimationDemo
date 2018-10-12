const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: ['whatwg-fetch','./main.js'],

    output: {
        path: __dirname + '/dist',
        filename: 'index.js',
    },

    devServer: {
        inline: true,
        port: 8090,
        historyApiFallback: true
    },

    
    /*plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ],*/

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',

                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },
    resolveLoader: {
        extensions: ['.js', '.jsx'],
        modules: [
            path.resolve(__dirname, "./"),
            'node_modules'
        ]
    },
    node: {
        fs: 'empty',
        child_process: 'empty'
    }
}
