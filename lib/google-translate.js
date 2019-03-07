const translate = require('@vitalets/google-translate-api')
const createOutlet = require('atom-outlet').create
let outlet

function isHalfWidthCharacter (character) {
  const charCode = character.charCodeAt(0)
  return (charCode >= 0xff65 && charCode <= 0xffdc) || (charCode >= 0xffe8 && charCode <= 0xffee)
}

function containsNonHalfWidthChar (editor, text) {
  for (const char of text) {
    if (editor.ratioForCharacter(char) !== 1) {
      return true
    }
  }
  return false
}

module.exports = async function googleTranslate (editor, mode = 'normal') {
  const selection = editor.getLastSelection()
  const srcText = selection.getText().trim()
  if (!srcText) return

  console.log('contains?', containsNonHalfWidthChar(editor, srcText))
  const translateToParam = containsNonHalfWidthChar(editor, srcText)
    ? 'translateToWhenTextContainsNonHalfWidthChar'
    : 'translateTo'

  // const result = {text: 'こんにちは'}
  const result = await translate(srcText, {
    to: atom.config.get(`google-translate.${translateToParam}`)
  })

  if (!result) return

  if (atom.config.get('google-translate.debug')) {
    console.log(result)
  }

  let text = result.text
  switch (mode) {
    case 'normal': {
      if (outlet) {
        outlet.show()
      } else {
        outlet = createOutlet({
          title: 'Google Translate',
          classList: ['google-transalte-editor'],
          defaultLocation: atom.config.get('google-translate.openLocation'),
          split: atom.config.get('google-translate.split'),
          extendsTextEditor: true
        })
        await outlet.open()

        outlet.onDidDestroy(() => {
          outlet = null
        })
      }

      outlet.link(editor)
      outlet.setText(text)
      outlet.update({ softWrapped: true })
      break
    }
    case 'replace': {
      selection.insertText(text)
      break
    }
    case 'insert-bottom': {
      const { end } = selection.getBufferRange()
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
