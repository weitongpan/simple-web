module.exports = {
  devServer: {
    proxy: {
      'api/': {
        target: 'http://8b0e-112-73-0-56.ngrok.io/',
        changeOrigin: true,
        secure: false
      }
    }
  }
}
