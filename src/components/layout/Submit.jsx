import React, { useState } from 'react';
import Template from './Template';
import DraggableCanvas from './DraggableCanvas';

const Submit = () => {
  const [items, setItems] = useState([]);
  const [itemsCanvas, setItemsCanvas] = useState([]);

  const handleCreateNew = (templateItems) => {
    setItemsCanvas(templateItems);
    // console.log('Items sau khi gửi từ Template:', templateItems);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-6">
      <Template items={items} setItems={setItems} onCreateNew={handleCreateNew} />
      <DraggableCanvas items={itemsCanvas || []} />
    </div>
  );
};

export default Submit;
