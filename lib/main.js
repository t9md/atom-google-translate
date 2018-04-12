'use babel'

const {CompositeDisposable} = require('atom')
const googleTranslate = require('./google-translate')

module.exports = {
  activate() {
    this.disposable = new CompositeDisposable(
      atom.commands.add('atom-text-editor:not([mini])', {
        'google-translate:translate'() {
          googleTranslate(this.getModel())
        },
        'google-translate:translate-with-replace'() {
          googleTranslate(this.getModel(), 'replace')
        },
        'google-translate:translate-with-insert-bottom'() {
          googleTranslate(this.getModel(), 'insert-bottom')
        },
      })
    )
  },

  deactivate() {
    this.disposable.dispose()
  },

  consumeVimModePlus(service) {
    class GoogleTranslate extends service.getClass('Operator') {
      static commandPrefix = 'vim-mode-plus-user'
      stayAtSamePosition = true
      translationOutput = 'normal'

      mutateSelection(selection) {
        if (selection.isLastSelection()) {
          googleTranslate(this.editor, this.translationOutput)
        }
      }
    }

    class GoogleTranslateParagraph extends GoogleTranslate {
      target = 'InnerParagraph'
    }
    class GoogleTranslateWithReplace extends GoogleTranslate {
      translationOutput = 'replace'
    }
    class GoogleTranslateWithInsertBottom extends GoogleTranslate {
      translationOutput = 'insert-bottom'
    }

    GoogleTranslate.registerCommand()
    GoogleTranslateParagraph.registerCommand()
    GoogleTranslateWithReplace.registerCommand()
    GoogleTranslateWithInsertBottom.registerCommand()
  },
}
