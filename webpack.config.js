const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const JavaScriptObfuscator = require("webpack-obfuscator");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = [
    {
        entry: {
            main: "./src/main.js",
            renderer: "./src/renderer.js",
            preload: "./src/preload.js",
        },
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, "dist"),
        },
        mode: "production",
        target: ["electron-main", "electron-renderer", "electron-preload"],
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            }, ],
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin()],
        },
        plugins: [
            new JavaScriptObfuscator({
                rotateStringArray: true,
            }),
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                filename: "index.html",
                chunks: ["renderer"], 
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: "src/*.css", to: "[name][ext]" },
                ],
            }),
        ],
    }
];
