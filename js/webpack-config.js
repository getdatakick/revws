var path = require('path');
var webpack = require('webpack');
var babelConfig = require('./babel.config.json');

module.exports = function(prod, version) {
  var plugins = [
    new webpack.ProvidePlugin({
      '__': ['translations', 'getTranslation']
    }),
  ];
  var front = [ "front" ];
  var back = [ "back" ];

  var mode = prod ? "production" : "development";

  plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(mode),
  }));

  const ver = version.replace(/\./g, '_');
  const frontName = prod ? 'front-'+ver : 'front_app';
  const backName = prod ? 'back-'+ver : 'back_app';

  return {
    mode: mode,
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
      [frontName]: front,
      [backName]: back
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

    plugins: plugins,

    devtool: 'source-map'

  };
};
