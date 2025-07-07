import { Node, mergeAttributes } from "@tiptap/core";

const EditableGridBlock = Node.create({
  name: "editableGridBlock",

  group: "block",
  content: "block+",
  selectable: true,

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (el) => {
          const cols = el.getAttribute("data-columns");
          return cols ? parseInt(cols, 10) : 2;
        },
        renderHTML: (attrs) => {
          return {
            "data-columns": attrs.columns,
          };
        },
      },
      width: {
        default: "100%",
        parseHTML: (el) => el.style.width || "100%",
        renderHTML: (attrs) => ({
          style: `width: ${attrs.width}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="editable-grid-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const columns = HTMLAttributes.columns || 2;
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "editable-grid-block",
        style: "display: flex; margin: 16px 0;",
      }),
      0, // Insert block content here
    ];
  },
});

export default EditableGridBlock;
