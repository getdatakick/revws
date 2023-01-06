import path from "path";
import webpack from "webpack";
import ExtractTranslationKeysPlugin from "webpack-extract-translation-keys-plugin";

// noinspection JSUnusedGlobalSymbols
export default name => {
  const plugins = [
    new ExtractTranslationKeysPlugin({
      functionName: '__',
      output: path.resolve('./build/' + name + '-translation-keys.json')
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
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          }
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
