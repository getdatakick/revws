import path from "path";
import webpack from "webpack";

// noinspection JSUnusedGlobalSymbols
export default function(prod, version) {
  const plugins = [
    new webpack.ProvidePlugin({
      '__': ['translations', 'getTranslation']
    }),
  ];
  const front = ["front"];
  const back = ["back"];

  const mode = prod ? "production" : "development";

  plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(mode),
  }));

  const ver = version.replace(/\./g, '_');
  const frontName = prod ? 'front-'+ver : 'front_app';
  const backName = prod ? 'back-'+ver : 'back_app';

  const data = {
    mode: mode,
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
  };

  if (! prod) {
    data.devtool = 'source-map';
  }

  return data;
};
