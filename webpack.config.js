const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const glob = require('glob');

module.exports = {
    entry: {
        app: './src/js/start.js',
        test: glob.sync('./test/**/*.test.js'),
        testconfig: './test/test.js',
        testrun: './test/run.js',
        sprite: './src/demo/sprite.js'
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
            },
            // {
            //     test: /\.js$/,
            //     exclude: /node_modules/,
            //     use: ['babel-loader']
            // }
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
            chunks: [
                'app', 'common', 'vendor'
            ],
            template: 'src/html/template.ejs',
            inject: false,
            appMountId: 'content',
            mobile: true,
            scripts: ['common.js']
        }),
        new HtmlWebpackPlugin({
            title: 'App Test',
            filename: 'test.html',
            chunks: [
                'testconfig', 'test', 'testrun', 'common', 'vendor'
            ],
            template: 'src/html/template.ejs',
            appMountIds: [
                'content', 'mocha'
            ],
            inject: false,
            mobile: true
        }),
        new HtmlWebpackPlugin({
            title: 'Sprite Demo',
            filename: 'sprite.html',
            chunks: [
                'sprite', 'common', 'vendor'
            ],
            template: 'src/html/template.ejs',
            appMountIds: ['content'],
            inject: false,
            mobile: true
        }),
        new webpack.optimize.CommonsChunkPlugin({name: 'common', minChunks: 2}),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: ({resource}) => resource && resource.includes('node_modules') && resource.match(/\.js$/)
        }),
        //new BundleAnalyzerPlugin({analyzerMode: 'static'})
    ]
};
