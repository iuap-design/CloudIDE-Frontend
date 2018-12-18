var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
//var ExtractTextPlugin = require("extract-text-webpack-plugin");
const scriptPort = process.env.SCRIPT_PORT || 3004;
let localPath = 'localhost';
if (process.env.IP === 'true') {
  //获取本机ip
  var os = require('os');
  var ifaces = os.networkInterfaces();
  var ips = [];
  for (var dev in ifaces) {
    var alias = 0;
    ifaces[dev].forEach(function (details) {
      if (details.family == 'IPv4') {
        //console.log(dev+(alias?':'+alias:''),details.address);
        ips.push(details.address)
        ++alias;
      }
    });
  }

  localPath = ips[1];
}

var origin = [
  path.resolve('src/common'),
  path.resolve('src/client'),
  path.resolve('src/yxyweb')
];
//let extractCSS = new ExtractTextPlugin('static/styles/default/vendor.css');
//let extractLESS = new ExtractTextPlugin('static/styles/default/index.css');

var config = {
  entry: {
    'index': './src/client'
  },
  output: {
    publicPath: `http://${localPath}:${scriptPort}/`,
    path: path.join(__dirname, './'),
    filename: 'static/javascripts/[name].js'
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
          plugins: [["import", { "style": "css", "libraryName": "antd" }]],
          cacheDirectory: true
        }
      }, {
        test: /\.(jpg|png|gif|ico)$/,
        loader: 'url-loader',
        options: {
          limit: 8192
        },
        include: origin,
      }, {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
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


      }, {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
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
  /*  postcss: [
   autoprefixer({
   browsers: ['last 2 versions']
   })
   ],*/
  plugins: [
    new CaseSensitivePathsPlugin(),


    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      'process.env.__CLIENT__': 'true',
    }),


    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./manifest.development.json')
    }),
    new webpack.HotModuleReplacementPlugin(),


  ],
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    host: '0.0.0.0',
    hot: true,
    inline: true,
    port: scriptPort,
    disableHostCheck: true
  },
  devtool: 'source-map',
  cache: true,
};

module.exports = config
