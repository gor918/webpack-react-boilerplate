const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const here = (dir) => (dir ? path.resolve(__dirname, dir) : __dirname);

const dirs = {
    src: './src',
    dist: './dist',
};

module.exports = (env, args = {}) => {
    const { mode = 'development' } = args;
    const isProduction = mode === 'production';

    return {
        mode,
        context: here(),
        target: 'web',
        entry: {
            app: `${dirs.src}/index`,
        },
        output: {
            path: here(dirs.dist),
            filename: isProduction ? 'js/[name]-[chunkhash].js' : 'js/[name].js',
            chunkFilename: isProduction ? 'js/[name]-[chunkhash].js' : 'js/[name].js',
            sourceMapFilename: '[file].map',
            publicPath: '/',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            modules: [here('./node_modules'), here(dirs.src)],
        },
        devtool: !isProduction && 'inline-cheap-module-source-map',
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/i,
                    use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
                },
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    },
                    exclude: /node_modules/,
                },
                {
                    test: /\.(ts)x?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            babelrc: true,
                            comments: true,
                            cacheDirectory: here(`./node_modules/.cache/${mode}/js`),
                        },
                    },
                },
                {
                    test: /\.svg$/,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: `${dirs.src}/static/index.html`,
                cache: true,
                minify: isProduction && {
                    minifyCSS: true,
                    minifyJS: true,
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true,
                },
                chunksSortMode: 'none',
            }),
            new CopyPlugin({
                patterns: [{ from: 'src/manifest.json', to: 'manifest.json' }, { from: `${dirs.src}/assets` }],
            }),
        ],
        optimization: {
            minimize: isProduction,
            moduleIds: 'deterministic',
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                maxSize: 100000,
                minSize: 20000,
            },
        },
        performance: {
            hints: isProduction && 'warning',
            maxEntrypointSize: Infinity,
            maxAssetSize: 10 ** 6,
        },
        devServer: {
            historyApiFallback: true,
            contentBase: here(dirs.dist),
            watchContentBase: true,
            hot: true,
            port: 3000,
            compress: true,
            overlay: {
                warnings: true,
                errors: true,
            },
        },
    };
};
