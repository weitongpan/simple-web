module.exports = {
  devServer: {
    proxy: {
      'api/': {
        target: 'http://7e0f-112-73-0-56.ngrok.io',
        changeOrigin: true,
        secure: false
      }
    }
  }
}
