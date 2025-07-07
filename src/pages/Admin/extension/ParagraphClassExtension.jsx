import { Extension } from '@tiptap/core'

const ParagraphClassExtension = Extension.create({
  name: 'paragraphClass',

  addGlobalAttributes() {
  return [
    {
      types: ['paragraph'],
      attributes: {
        style: {
          default: null,
          parseHTML: element => element.getAttribute('style'),
          renderHTML: attributes => {
            return { style: attributes.style }
          },
        },
      },
    },
  ]
}

})

export default ParagraphClassExtension