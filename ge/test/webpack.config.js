const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
    entry: "./src/index.ts",
    mode: "development",
    output: { path: path.resolve(__dirname, "dist"), filename: "bundle.js", clean: true},
    devtool: "source-map",
    plugins: [
        new HtmlWebpackPlugin({
            title: 'ACSL-GE GDK Test'
        }),
        new MiniCssExtractPlugin()
    ],
    resolve: { extensions: [ ".ts", ".tsx", ".js" ] },
    module: {
        rules: [
            { test: /\.jpg$/, use: 'file-loader?name=[name].[ext]'},
            { test: /\.ts$/, loader: "babel-loader", exclude: /(node_modules|bower_components)/ },
            { test: /\.tsx?$/, loader: "ts-loader", exclude: /(node_modules|bower_components)/ },
            { test: /\.js$/, loader: "source-map-loader", exclude: /(node_modules|bower_components)/ },
            { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"]}
        ]
    },
    optimization: {
        minimizer: [
            new CssMinimizerPlugin()
        ],
    },
    experiments: {
        topLevelAwait: true
    }
};