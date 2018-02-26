const {CompositeDisposable} = require('atom')
const {googleTranslate, destroyOutputEditor, hideOutputEditor} = require('./google-translate')

module.exports = {
  activate () {
    this.disposables = new CompositeDisposable(
      atom.commands.add('atom-text-editor:not([mini])', {
        'google-translate:translate' () {
          googleTranslate(this.getModel())
        },
        'google-translate:translate-with-replace' () {
          googleTranslate(this.getModel(), 'replace')
        },
        'google-translate:translate-with-insert-bottom' () {
          googleTranslate(this.getModel(), 'insert-bottom')
        },
        'google-translate:hide-output-editor' () {
          hideOutputEditor()
        }
      }),
      atom.config.onDidChange('google-translate.openLocation', () => {
        destroyOutputEditor()
      })
    )
  },

  deactivate () {
    this.disposables.dispose()
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
          googleTranslate(this.editor, WRITE_MODE_BY_CLASS_NAME[this.name])
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
