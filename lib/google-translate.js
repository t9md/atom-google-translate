const translate = require('google-translate-api')
const {TextEditor} = require('atom')

function getAdjacentPane (basePane) {
  const parent = basePane.getParent()
  if (parent && parent.getChildren) {
    const children = parent.getChildren()
    const index = children.indexOf(basePane)

    let pane
    pane = children[index + 1]
    if (pane && pane.constructor.name === 'Pane') {
      return pane
    }

    pane = children[index - 1]
    if (pane && pane.constructor.name === 'Pane') {
      return pane
    }
  }
}

let outputEditor

async function openInCenter (item, split) {
  const currentPane = atom.workspace.getActivePane()
  let pane = getAdjacentPane(currentPane)
  let editor
  if (pane) {
    console.log('11')
    await atom.workspace.open(item, {activatePane: false, pane})
  } else {
    console.log('12')
    await atom.workspace.open(item, {activatePane: false, split})
  }

  if (atom.workspace.getActivePane() !== currentPane) {
    console.log('13')
    currentPane.activate()
  }
}

function buildOutputEditor () {
  const editor = new TextEditor({autoHeight: false})
  editor.getTitle = () => 'Google Translate'
  editor.getAllowedLocations = () => ['center', 'bottom']
  editor.buffer.isModified = () => false
  editor.element.classList.add('google-transalte-editor')
  editor.onDidDestroy(() => {
    updateWorkspaceClass(false)
  })
  atom.commands.add(editor.element, {
    'core:close': () => editor.destroy()
  })
  return editor
}

// Must reaturn outputEditor
async function openOutputEditor () {
  if (outputEditor && outputEditor.isAlive()) {
    const pane = atom.workspace.paneForItem(outputEditor)
    pane.activateItem(outputEditor)
    if (pane.getContainer().getLocation() === 'bottom') {
      atom.workspace.getBottomDock().show()
    }
    return outputEditor
  }

  outputEditor = buildOutputEditor()

  const openLocation = atom.config.get('google-translate.openLocation')
  switch (openLocation) {
    case 'center-right':
      console.log('1')
      await openInCenter(outputEditor, 'right')
      break
    case 'center-down':
      console.log('2')
      await openInCenter(outputEditor, 'down')
      break
    case 'dock-bottom':
      console.log('3')
      await atom.workspace.open(outputEditor, {location: 'bottom', activatePane: false})
      atom.workspace.getBottomDock().show()
      break
  }
  return outputEditor
}

function updateWorkspaceClass (status) {
  const element = atom.workspace.getElement()
  if (!status) {
    outputEditor && outputEditor.isAlive()
  }
  element.classList.toggle('has-google-translate', status)
}

async function googleTranslate (editor, mode = 'normal') {
  const selection = editor.getLastSelection()
  const srcText = selection.getText().trim()
  if (!srcText) return

  // const result = {text: 'こんにちは'}
  const result = await translate(srcText, {
    to: atom.config.get('google-translate.translateToLanguage')
  })

  if (!result) return

  let text = result.text
  switch (mode) {
    case 'normal':
      const outputEditor = await openOutputEditor()
      updateWorkspaceClass(true)
      outputEditor.setText(text)
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

function destroyOutputEditor () {
  if (outputEditor && outputEditor.isAlive()) {
    outputEditor.destroy()
  }
}

// In center workspace there is no behavior diff with `destroyOutputEditor`.
function hideOutputEditor () {
  if (outputEditor && outputEditor.isAlive()) {
    atom.workspace.hide(outputEditor)
  }
}

module.exports = {googleTranslate, destroyOutputEditor, hideOutputEditor}
