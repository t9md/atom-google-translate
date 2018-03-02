## What's this?

Translate selected text via google translate then write output to normal editor in dock or pane.  

## Commands

- `google-translate:translate`: Open translated text in different editor in dock or split-pane.
- `google-translate:translate-with-replace`: Replace selected text with translated one.
- `google-translate:translate-with-insert-bottom`: Insert translated text at bottom of selected text.

#### vmp commands

- `vim-mode-plus-user:google-translate`
- `vim-mode-plus-user:google-translate-with-replace`
- `vim-mode-plus-user:google-translate-with-insert-bottom`

## Keymap

- `keymap.cson`

```coffeescript
'atom-text-editor.vim-mode-plus:not(.insert-mode)':
  'g t t': "vim-mode-plus-user:google-translate"
```
