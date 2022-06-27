var path = require('path');
var webpack = require('webpack');
var ExtractTranslationKeysPlugin = require('webpack-extract-translation-keys-plugin');
var babelConfig = require('./babel.config.json');

module.exports = function(name) {
  var plugins = [
    new ExtractTranslationKeysPlugin({
      functionName: '__',
      output: path.resolve('./build/'+name+'-translation-keys.json')
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify("production"),
    })
  ];

  return {
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          options: babelConfig,
          exclude: [ /node_modules/]
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true
              }
            },
            'less-loader'
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.svg$/,
          loader: 'svg-react-loader'
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        }
      ]
    },

    entry: {
      'transl': [ name ]
    },

    resolve: {
      modules: ['js', 'node_modules'],
      extensions: ['.js', '.jsx', '.css']
    },

    output: {
      filename: '[name].js',
      path: path.resolve('./build/'),
      publicPath: '/'
    },

    plugins: plugins
  };
};
