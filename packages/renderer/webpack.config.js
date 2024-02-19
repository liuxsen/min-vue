const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const root = path.join(__dirname)
const entryJs = path.join(root, 'index.js')
const distDir = path.join(root, 'dist')
const htmlEntry = path.join(root, 'index.html')

module.exports = {
  entry: entryJs,
  mode: 'development',
  output: {
    path: distDir,
  },
  plugins: [new HtmlWebpackPlugin({
    template: htmlEntry,
  })],
}
