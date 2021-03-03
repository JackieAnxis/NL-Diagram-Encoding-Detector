const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = (env, argv) => {
    let watch = false
    if ('watch' in env) {
        if (env['watch'] === 'true') {
            watch = true
        }
    }
    return {
        entry: './src/index.js',
        mode: 'development',
        devtool: 'inline-source-map',
        output: {
            filename: env['mode'] === 'production' ? 'NoLin2Text.min.js' : 'NoLin2Text.js',
            library: 'NoLin2Text',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'build')
        },
        node: {
            fs: 'empty'
        },
        externals: {
            // loadsh: 'lodash',
            // assert: 'assert',
        },
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: 'disabled',
                generateStatsFile: true,
                statsOptions: {
                    source: false
                }
            })
        ],
        watch: watch,
        optimization: {
            minimize: env['mode'] === 'production'
        },
        watchOptions: {
            ignored: /node_modules/,
            aggregateTimeout: 300,
            poll: 1000
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    },
                    exclude: '/node_modules/'
                }
            ]
        }
    }
}
