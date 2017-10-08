const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const glob = require('glob');

module.exports = {
    entry: {
        app: './src/js/start.js',
        test: glob.sync('./test/**/*.test.js'),
        testconfig: './test/test.js',
        run: './test/run.js'
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'src')
    },
    resolve: {
        modules: ['src/js', 'node_modules', 'test']
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'App',
            filename: 'index.html',
            excludeChunks: ['test'],
            template: 'src/html/template.ejs',
            inject: false,
            appMountId: 'content',
            mobile: true
        }),
        new HtmlWebpackPlugin({
            title: 'App Test',
            filename: 'test.html',
            chunks: ['testconfig', 'test', 'run'],
            template: 'src/html/template.ejs',
            appMountIds: ['content', 'mocha'],
            inject: false,
            mobile: true,
            scripts: ['common.js']
        }),
        new webpack.optimize.CommonsChunkPlugin({name: 'common', filename: 'common.js', minChunks: 3})
    ]
};
