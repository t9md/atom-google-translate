const translate = require('google-translate-api')
const outlet = require('atom-outlet')

class GoogleTranslate {
  updateWorkspaceClass (state) {
    const element = atom.workspace.getElement()
    element.classList.toggle('has-google-translate', state)
  }

  async translate (editor, mode = 'normal') {
    const selection = editor.getLastSelection()
    const srcText = selection.getText().trim()
    if (!srcText) return

    // const result = {text: 'こんにちは'}
    const result = await translate(srcText, {
      to: atom.config.get('google-translate.translateToLanguage')
    })

    if (!result) return

    if (atom.config.get('google-translate.debug')) {
      console.log(result)
    }

    let text = result.text
    switch (mode) {
      case 'normal':
        if (this.outlet) {
          this.outlet.show()
        } else {
          this.outlet = outlet.create({
            title: 'Google Translate',
            classList: ['google-transalte-editor'],
            defaultLocation: atom.config.get('google-translate.openLocation'),
            extendsTextEditor: true
          })
          await this.outlet.open()

          this.outlet.onDidDestroy(() => {
            this.updateWorkspaceClass(false)
            this.outlet = null
          })
        }
        this.updateWorkspaceClass(true)
        this.outlet.setText(text)
        this.outlet.update({softWrapped: true})
        break
      case 'replace':
        selection.insertText(text)
        break
      case 'insert-bottom':
        const {end} = selection.getBufferRange()
        if (end.column === 0) {
          text += '\n'
        } else {
          text = ' ' + text + ' '
        }
        const newRange = editor.setTextInBufferRange([end, end], text)
        selection.cursor.setBufferPosition(newRange.start)
        break
    }
  }

  // In center workspace there is no behavior differance from `destroyOutletEditor`.
  hide () {
    this.outlet && this.outlet.hide()
    this.updateWorkspaceClass(false)
  }

  relocate () {
    this.outlet && this.outlet.relocate()
  }

  destroyOutlet () {
    this.outlet && this.outlet.destroy()
  }
}

module.exports = new GoogleTranslate()
