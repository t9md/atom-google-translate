const {CompositeDisposable} = require('atom')
const googleTranslate = require('./google-translate')

module.exports = {
  activate () {
    this.disposable = new CompositeDisposable(
      atom.commands.add('atom-text-editor:not([mini])', {
        'google-translate:translate' () {
          googleTranslate.transalte(this.getModel())
        },
        'google-translate:translate-with-replace' () {
          googleTranslate.translate(this.getModel(), 'replace')
        },
        'google-translate:translate-with-insert-bottom' () {
          googleTranslate.transalte(this.getModel(), 'insert-bottom')
        }
      })
    )
  },

  deactivate () {
    this.disposable.dispose()
  },

  consumeVimModePlus (service) {
    const WRITE_MODE_BY_CLASS_NAME = {
      GoogleTranslate: 'normal',
      GoogleTranslateWithReplace: 'replace',
      GoogleTranslateWithInsertBottom: 'insert-bottom'
    }

    class GoogleTranslate extends service.getClass('Operator') {
      initialize () {
        this.stayAtSamePosition = true
        super.initialize()
      }
      mutateSelection (selection) {
        if (selection.isLastSelection()) {
          googleTranslate.translate(this.editor, WRITE_MODE_BY_CLASS_NAME[this.name])
        }
      }
    }
    GoogleTranslate.commandPrefix = 'vim-mode-plus-user'

    class GoogleTranslateWithReplace extends GoogleTranslate {}
    class GoogleTranslateWithInsertBottom extends GoogleTranslate {}

    GoogleTranslate.registerCommand()
    GoogleTranslateWithReplace.registerCommand()
    GoogleTranslateWithInsertBottom.registerCommand()
  }
}
