const GoogleTranslate = require('./google-translate')

module.exports = {
  activate () {
    this.disposable = atom.commands.add('atom-text-editor:not([mini])', {
      'google-translate:translate' () {
        GoogleTranslate.translate(this.getModel(), 'normal')
      },
      'google-translate:translate-with-replace' () {
        GoogleTranslate.translate(this.getModel(), 'replace')
      },
      'google-translate:translate-with-insert-bottom' () {
        GoogleTranslate.translate(this.getModel(), 'insert-bottom')
      }
    })
  },

  deactivate () {
    this.disposable.dispose()
  }
}
