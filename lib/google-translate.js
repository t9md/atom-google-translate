const translate = require('google-translate-api')
const {TextEditor} = require('atom')
const RelocatableItem = require('atom-relocatable-item')

class GoogleTranslate {
  constructor () {
    this.output = null
  }

  updateWorkspaceClass (state) {
    const element = atom.workspace.getElement()
    element.classList.toggle('has-google-translate', state)
  }

  buildEditor () {
    const editor = new TextEditor({autoHeight: false})
    editor.getTitle = () => 'Google Translate'
    editor.getAllowedLocations = () => ['center', 'bottom']
    editor.buffer.isModified = () => false
    editor.element.classList.add('google-transalte-editor')
    editor.onDidDestroy(() => {
      this.updateWorkspaceClass(false)
    })
    atom.commands.add(editor.element, {
      'core:close': () => editor.destroy()
    })
    return editor
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
        if (this.hasOutput()) {
          this.output.activate()
        } else {
          this.output = new RelocatableItem(this.buildEditor())
          await this.output.open({
            where: atom.config.get('google-translate.openLocation')
          })
        }
        this.updateWorkspaceClass(true)
        this.output.item.setText(text)
        this.output.item.update({softWrapped: true})
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

  hasOutput () {
    return this.output && this.output.isAlive()
  }

  // In center workspace there is no behavior differance from `destroyOutputEditor`.
  hide () {
    if (this.hasOutput()) this.output.hide()
    this.updateWorkspaceClass(false)
  }

  relocate () {
    if (this.hasOutput()) {
      this.output.relocate()
    }
  }

  destroyOutput () {
    if (this.hasOutput()) {
      this.output.destroy()
      this.output = null
    }
  }
}

module.exports = new GoogleTranslate()
