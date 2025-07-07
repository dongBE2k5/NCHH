// src/ckeditor.js (or src/ckeditor/ckeditor.js)

// Import the base editor from its 'src' path
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

// Import ALL the plugins you want to include in your custom build from their 'src' paths
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Font from '@ckeditor/ckeditor5-font/src/font';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';

// Define your custom editor class
class CustomEditor extends ClassicEditorBase {}

// Configure its plugins and toolbar
CustomEditor.builtinPlugins = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  Heading,
  BlockQuote,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Table,
  TableToolbar,
  MediaEmbed,
  Alignment,
  Font,
  Indent,
  IndentBlock,
  CodeBlock,
  HorizontalLine,
  SpecialCharacters,
  PasteFromOffice
];

CustomEditor.defaultConfig = {
  toolbar: {
    items: [
      'heading', '|',
      'bold', 'italic', 'underline', 'strikethrough',
      'link', 'bulletedList', 'numberedList', 'blockquote', '|',
      'alignment:left', 'alignment:center', 'alignment:right', 'alignment:justify',
      'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
      'outdent', 'indent', '|',
      'imageUpload', 'insertTable', 'mediaEmbed', 'horizontalLine', 'specialCharacters', '|',
      'undo', 'redo'
    ]
  },
  image: {
    toolbar: [
      'imageTextAlternative',
      'imageStyle:inline',
      'imageStyle:block',
      'imageStyle:side'
    ]
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  },
  fontFamily: {
      options: [
          'default',
          'Arial, Helvetica, sans-serif',
          'Courier New, Courier, monospace',
          'Georgia, serif',
          'Lucida Sans Unicode, Lucida Grande, sans-serif',
          'Tahoma, Geneva, sans-serif',
          'Times New Roman, Times, serif',
          'Trebuchet MS, Helvetica, sans-serif',
          'Verdana, Geneva, sans-serif'
      ],
      supportAllValues: true
  },
  fontSize: {
      options: [
          8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 36, 48, 72
      ],
      supportAllValues: true
  },
  fontColor: {
      colors: [
          { color: 'hsl(0, 0%, 0%)', label: 'Black' },
          { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
          { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
          { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
          { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
          { color: 'hsl(0, 75%, 60%)', label: 'Red' },
          { color: 'hsl(25, 75%, 60%)', label: 'Orange' },
          { color: 'hsl(50, 75%, 60%)', label: 'Yellow' },
          { color: 'hsl(75, 75%, 60%)', label: 'Light green' },
          { color: 'hsl(120, 75%, 60%)', label: 'Green' },
          { color: 'hsl(175, 75%, 60%)', label: 'Aqua' },
          { color: 'hsl(200, 75%, 60%)', label: 'Blue' },
          { color: 'hsl(250, 75%, 60%)', label: 'Purple' }
      ],
      supportAllValues: true
  },
  fontBackgroundColor: {
      colors: [ // You can copy the colors from fontColor if you want the same palette
          { color: 'hsl(0, 0%, 0%)', label: 'Black' },
          { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
          { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
          { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
          { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
          { color: 'hsl(0, 75%, 60%)', label: 'Red' },
          { color: 'hsl(25, 75%, 60%)', label: 'Orange' },
          { color: 'hsl(50, 75%, 60%)', label: 'Yellow' },
          { color: 'hsl(75, 75%, 60%)', label: 'Light green' },
          { color: 'hsl(120, 75%, 60%)', label: 'Green' },
          { color: 'hsl(175, 75%, 60%)', label: 'Aqua' },
          { color: 'hsl(200, 75%, 60%)', label: 'Blue' },
          { color: 'hsl(250, 75%, 60%)', label: 'Purple' }
      ],
      supportAllValues: true
  },
  alignment: {
    options: [ 'left', 'right', 'center', 'justify' ]
  }
};

export default CustomEditor; // Export your custom editor