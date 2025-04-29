// DraggablePage.jsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState } from 'react';
import DraggableItem from '../../pages/DraggableItem';
import DropArea  from '../../pages/DropArea';


export default function DraggablePage() {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="flex p-6 gap-6">
          {/* Sidebar để kéo */}
          <div className="w-1/4">
            <h2 className="text-xl font-bold mb-4">Components</h2>
            <DraggableItem type="Input"/>
            <DraggableItem type="TextArea"/>
            {/* sau thêm type khác như Button, TextArea, Checkbox cũng tương tự */}
          </div>
  
          {/* Màn hình để thả */}
          <div className="w-3/4">
            <DropArea />
          </div>
        </div>
      </DndProvider>
    );
  }