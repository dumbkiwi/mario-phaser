const path = require('path');

module.exports = {
  entry: './src/game.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'ts-loader'
      },
      {
        test: require.resolve('phaser'),
        loader: 'expose-loader',
        options: { exposes: { globalName: 'Phaser', override: true } }
      }
    ]
  },
  stats: 'errors-warnings',
  devtool: 'eval',
  devServer: {
    static: './',
    host: 'localhost',
    port: 8080,
    open: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
};
