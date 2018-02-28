const translate = require('google-translate-api')
const {TextEditor} = require('atom')
const Outlet = require('atom-outlet')

class GoogleTranslate {
  constructor () {
    this.outlet = null
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
        if (this.hasOutlet()) {
          this.outlet.activate()
        } else {
          this.outlet = new Outlet(this.buildEditor())
          await this.outlet.open({
            where: atom.config.get('google-translate.openLocation')
          })
        }
        this.updateWorkspaceClass(true)
        this.outlet.item.setText(text)
        this.outlet.item.update({softWrapped: true})
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

  hasOutlet () {
    return this.outlet && this.outlet.isAlive()
  }

  // In center workspace there is no behavior differance from `destroyOutletEditor`.
  hide () {
    if (this.hasOutlet()) this.outlet.hide()
    this.updateWorkspaceClass(false)
  }

  relocate () {
    if (this.hasOutlet()) this.outlet.relocate()
  }

  destroyOutlet () {
    if (this.hasOutlet()) {
      this.outlet.destroy()
      this.outlet = null
    }
  }
}

module.exports = new GoogleTranslate()
