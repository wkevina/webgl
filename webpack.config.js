const path = require('path');

module.exports = {
  entry: './src/app.js',
  devtool: 'inline-source-map',
  devServer: {
      contentBase: '.'
  },
  resolve: {
    modules: ['src']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};

