import React, { useState } from 'react';
import './Inventory.css';

const Inventory = ({ 
  items = [], 
  onItemClick,
  onItemDrag,
  slots = 20,
  columns = 5,
  isOpen = false,
  onClose
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);

  const handleDragStart = (e, item, index) => {
    if (!item) return;
    setDraggedItem({ item, index });
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverSlot(index);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedItem && onItemDrag) {
      onItemDrag(draggedItem.index, targetIndex, draggedItem.item);
    }
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  const handleItemClick = (item, index) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  // 生成所有格子
  const renderSlots = () => {
    const slotsArray = [];
    for (let i = 0; i < slots; i++) {
      const item = items[i];
      const isDraggingOver = dragOverSlot === i;
      
      slotsArray.push(
        <div
          key={i}
          className={`inventory-slot ${isDraggingOver ? 'drag-over' : ''} ${item ? 'occupied' : ''}`}
          onDragOver={(e) => handleDragOver(e, i)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, i)}
          onClick={() => handleItemClick(item, i)}
        >
          {item && (
            <div
              className="inventory-item"
              draggable
              onDragStart={(e) => handleDragStart(e, item, i)}
              title={`${item.name}\n${item.description || ''}`}
            >
              <div className="item-icon">{item.icon || item.name.charAt(0)}</div>
              {item.quantity > 1 && (
                <div className="item-quantity">{item.quantity}</div>
              )}
              {item.quality && (
                <div className={`item-quality ${item.quality}`} />
              )}
            </div>
          )}
          <div className="slot-number">{i + 1}</div>
        </div>
      );
    }
    return slotsArray;
  };

  if (!isOpen) return null;

  return (
    <div className="inventory-overlay" onClick={onClose}>
      <div className="inventory-container" onClick={(e) => e.stopPropagation()}>
        <div className="inventory-header">
          <h3>背包</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div 
          className="inventory-grid"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {renderSlots()}
        </div>
        <div className="inventory-footer">
          <div className="inventory-stats">
            物品: {items.filter(item => item).length} / {slots}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
