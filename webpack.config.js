const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const glob = require('glob');

const demos = [
    {title: 'Sprite Demo', name: 'sprite'},
    {title: 'TilemapTextureBuilder Demo', name: 'tilemap_texture'},
    {title: 'Tilemap Demo', name: 'tilemap'},
    {title: 'Particle Demo', name: 'particle'},
    {title: 'Lines Demo', name: 'lines'},
    {title: 'Physics Demo', name: 'physics'},
    {title: 'Pixel Editor', name: 'pixel'},
    {tile: 'Game', name: 'game'}
];

function demoConfig(demo) {
    return new HtmlWebpackPlugin({
        title: demo.title,
        filename: demo.name + '.html',
        chunks: [
            demo.name, 'common', 'vendor'
        ],
        template: 'src/html/template.ejs',
        appMountIds: ['content'],
        inject: false,
        mobile: true
    });
}

module.exports = {
    entry: {
        common: './src/js/common.js',
        app: './src/js/start.js',
        test: glob.sync('./test/**/*.test.js'),
        testconfig: './test/test.js',
        testrun: './test/run.js',
        sprite: './src/demo/sprite.js',
        tilemap_texture: './src/demo/tilemap_texture.js',
        tilemap: './src/demo/tilemap.js',
        particle: './src/demo/particle.js',
        lines: './src/demo/lines.js',
        physics: './src/demo/physics.js',
        pixel: './src/demo/pixel.js',
        game: './src/demo/game.js'
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'src')
    },
    resolve: {
        modules: ['src/js', 'node_modules', 'test'],
        alias: {
            'twgl-js': 'twgl.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/, /src\/js\/vendor/],
                use: ['babel-loader']
            },
            {
                test: /shaders\//,
                use: ['raw-loader']
            }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.ProvidePlugin({
           decomp: 'poly-decomp'
        }),
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
        new webpack.optimize.CommonsChunkPlugin({name: 'common', minChunks: 2}),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: ({resource}) => resource && resource.includes('node_modules') && resource.match(/\.js$/)
        }),
        ...demos.map(demoConfig)
        //new BundleAnalyzerPlugin({analyzerMode: 'static'})
    ]
};
