// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Đảm bảo đã cài đặt npm install @vitejs/plugin-react-swc

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      // ĐẢM BẢO TẤT CẢ CÁC GÓI CKEDITOR 5 ĐƯỢC IMPORT TRONG src/ckeditor.js
      // ĐỀU CÓ TRONG DANH SÁCH NÀY VỚI ĐƯỜNG DẪN src/ CHÍNH XÁC.
      '@ckeditor/ckeditor5-react',
      '@ckeditor/ckeditor5-editor-classic/src/classiceditor',
      '@ckeditor/ckeditor5-essentials/src/essentials',
      '@ckeditor/ckeditor5-paragraph/src/paragraph',
      '@ckeditor/ckeditor5-basic-styles/src/bold',
      '@ckeditor/ckeditor5-basic-styles/src/italic',
      '@ckeditor/ckeditor5-basic-styles/src/underline',
      '@ckeditor/ckeditor5-basic-styles/src/strikethrough',
      '@ckeditor/ckeditor5-link/src/link',
      '@ckeditor/ckeditor5-list/src/list',
      '@ckeditor/ckeditor5-heading/src/heading',
      '@ckeditor/ckeditor5-block-quote/src/blockquote',
      '@ckeditor/ckeditor5-image/src/image',
      '@ckeditor/ckeditor5-image/src/imagecaption',
      '@ckeditor/ckeditor5-image/src/imagestyle',
      '@ckeditor/ckeditor5-image/src/imagetoolbar',
      '@ckeditor/ckeditor5-image-upload/src/imageupload',
      '@ckeditor/ckeditor5-table/src/table',
      '@ckeditor/ckeditor5-table/src/tabletoolbar',
      '@ckeditor/ckeditor5-media-embed/src/mediaembed',
      '@ckeditor/ckeditor5-alignment/src/alignment',
      '@ckeditor/ckeditor5-font/src/font',
      '@ckeditor/ckeditor5-indent/src/indent',
      '@ckeditor/ckeditor5-indent-block/src/indentblock',
      '@ckeditor/ckeditor5-code-block/src/codeblock',
      '@ckeditor/ckeditor5-horizontal-line/src/horizontalline',
      '@ckeditor/ckeditor5-special-characters/src/specialcharacters',
      '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice',
      // Thêm bất kỳ plugin nào khác bạn muốn có "full tính năng" miễn phí ở đây
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});