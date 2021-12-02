const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require("path")

module.exports = {
  publicPath: '/', // 部署应用包时的基本 URL
  outputDir: 'notice-web-pc/notice-web-pc',
  lintOnSave: true,
  css: {
    loaderOptions: {
      sass: {
        // 全局sass变量
        prependData: `@import "~@/assets/css/variables.scss";`
      },
      less: {
        // 若 less-loader 版本小于 6.0，请移除 lessOptions 这一级，直接配置选项。
        modifyVars: {

        }
      }
    }
  },
  devServer: {
    port: '8080',
    proxy: {
      '/': {
        // 测试在线预览，在线编辑
        // target: 'http://notice.wps.gz.cegn.cn/',
        // 省政府
        // target: 'http://notice-test.mh.gz.cegn.cn/',
        // 省政协
        target: 'http://notice.zx.gz.cegn.cn/',
        changeOrigin: true,
        secure: false
      }
    }
  },
  configureWebpack: {
    plugins: [
      // 注册环境变量 RELEASE_ENV： test测试环境  pro正式环境
      new webpack.DefinePlugin({
        "process.env": {
          RELEASE_ENV: JSON.stringify(process.env.RELEASE_ENV)
        }
      }),
      new HtmlWebpackPlugin({
        template: path.resolve('./public/index.html'),
        title: '通知公告'
      })
    ]
  }
}
