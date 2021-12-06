module.exports = {
  devServer: {
    proxy: {
      'api/': {
        target: 'http://d65a-112-73-0-56.ngrok.io',
        changeOrigin: true,
        secure: false
      }
    }
  }
}
