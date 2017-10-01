const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './src/js/app.js',
        test: './test/entry.js'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'src')
    },
    resolve: {
        modules: ['src/js', 'node_modules', 'test']
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
            chunks: ['test'],
            template: 'src/html/template.ejs',
            inject: false,
            mobile: true
        })
    ]
};
