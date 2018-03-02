const translate = require('google-translate-api')
const outlet = require('atom-outlet')

class GoogleTranslate {
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
            split: atom.config.get('google-translate.split'),
            extendsTextEditor: true
          })
          await this.outlet.open()

          this.outlet.onDidDestroy(() => {
            this.outlet = null
          })
        }
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
}

module.exports = new GoogleTranslate()
