import { Node, mergeAttributes } from '@tiptap/core'

const RawHtmlBlock = Node.create({
  name: 'rawHtmlBlock',

  group: 'block',
  selectable: true,

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: element => element.innerHTML,
        renderHTML: () => {
          return {} // Không cần render HTML qua renderHTML vì dùng nodeView
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="raw-html-block"]',
      },
    ]
  },

  renderHTML() {
    return ['div', { 'data-type': 'raw-html-block' }]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-type', 'raw-html-block')
      dom.innerHTML = node.attrs.html || ''
      return {
        dom,
      }
    }
  },

  addCommands() {
    return {
      insertRawHtml:
        html =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { html },
          })
        },
    }
  },
})

export default RawHtmlBlock
