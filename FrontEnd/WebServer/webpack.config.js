var path = require('path');
var webpack = require('webpack');
module.exports = {

  entry: {
     index: './client/index.js',
   },
 output: {
   path: path.join(__dirname, 'client/bundle_dir/'),
   chunkFilename: "[name].bundle.js",
   //filename: 'bundle.js',
   publicPath:"./bundle_dir/",
 },
 module: {
  rules: [{
   test: /.jsx?$/,
   exclude: /node_modules/,
   loader: 'babel-loader',
   options: {
        presets: ['@babel/preset-env','@babel/preset-react']
        }
  },
  {
   test: /\.(s*)css$/,
   use: ['style-loader', 'css-loader']
  },
 {
   test: /\.(eot|svg|ttf|woff|woff2)$/,
   use: "url-loader?name=[name].[ext]"
 }]
},
 plugins: [
   new webpack.DefinePlugin({
 "process.env.WEBSERVER": JSON.stringify(process.env.WEBSERVER)
})

  ]
}
