var path = require('path');
var webpack = require('webpack');
var Visualizer = require('webpack-visualizer-plugin');

module.exports = function(prod, version) {
  var plugins = [
    new webpack.ProvidePlugin({
      '__': ['translations', 'getTranslation']
    }),
  ];
  var front = [ "babel-polyfill", "front" ];
  var back = [ "babel-polyfill", "back" ];

  if (! prod) {
    plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify("development"),
    }));
  } else {
    plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify("production"),
    }));
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    plugins.push(new webpack.optimize.UglifyJsPlugin({ sourceMap: true, }));
    plugins.push(new Visualizer());
  }

  const ver = version.replace(/\./g, '_');
  const frontName = prod ? 'front-'+ver : 'front_app';
  const backName = prod ? 'back-'+ver : 'back_app';

  return {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loaders: ['babel-loader'],
          exclude: [ /node_modules/]
        },
        {
          test: /\.less$/,
          loaders: ['style-loader', 'css-loader?module', 'less-loader' ]
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        {
          test: /\.svg$/,
          loaders: ['svg-react-loader']
        },
        {
          test: /\.json$/,
          loaders: ['json-loader']
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
