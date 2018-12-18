var path = require('path');
var webpack = require('webpack');
var moment = require('moment')
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HTMLWebpackPlugin = require('html-webpack-plugin')
var GenerateAssetPlugin = require('generate-asset-webpack-plugin');
var version = require('uuid')();
var origin = [
  path.resolve('src/common'),
  path.resolve('src/client'),
  path.resolve('src/yxyweb')
];
let extractCSS = new ExtractTextPlugin('styles/default/[name].min.css')
var nowDateStr = moment().format("YYYY-MM-DD HH:mm:ss")
var autoprefixer = require('autoprefixer');
var config = {
  entry: {
    'index': './src/client'
  },
  output: {
    //comments: false,
    publicPath: '/',
    path: path.join(__dirname, 'static'),
    filename: 'public/javascripts/[name].min.js',
    chunkFilename: `public/javascripts/[name].bundle.js?_=${version}`
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    //root: origin,
    //modulesDirectories: ['node_modules'],
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: origin,
        query: {
          plugins: [["import", {"style": "css", "libraryName": "antd"}]],
          cacheDirectory: true
        }
      }, {
        test: /\.(jpg|png|gif|ico)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: 'styles/default/images/[hash:8].[name].[ext]'
        },
        include: origin,
      }, {
        test: /\.less$/,
        loader: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                minimize: true
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  autoprefixer()
                ]
              }
            },
            {
              loader: 'less-loader'
            },

          ],
        }),
      }, {
        test: /\.css$/,
        loader: extractCSS.extract({
          fallback: 'style-loader',
          use: [

            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                minimize: true
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  autoprefixer()
                ]
              }
            },

          ],
        }),
      }, {
        test: /\.(woff|svg|eot|ttf)\??.*$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[md5:hash:hex:7].[ext]'
        },
        //loader: 'url-loader?name=fonts/[name].[md5:hash:hex:7].[ext]',
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      'process.env.__CLIENT__': 'true',
    }),
    // webpack3已经移除DedupePlugin和默认设置OccurenceOrderPlugin[https://webpack.js.org/guides/migrating/]
    //new webpack.optimize.DedupePlugin(),
    //new webpack.optimize.OccurenceOrderPlugin(),

    // new HTMLWebpackPlugin({
    //   title: 'Code Splitting'
    // }),

    new GenerateAssetPlugin({
      filename: '../bin/version.json',
      fn: (compilation, cb) => {
        cb(null, JSON.stringify({version: version}, null, '\t'));
      },
      extraFiles: []
    }),

    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      output: {
        comments: false,
      },
      compress: {
        warnings: false
      }
    }),

    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.production.json')
    }),
    new webpack.BannerPlugin(`U零售\nupdate: ${nowDateStr}`),
    extractCSS

  ],
  devtool: 'source-map',
};

module.exports = config;
