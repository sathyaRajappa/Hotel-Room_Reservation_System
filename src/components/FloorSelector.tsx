import React, { useState } from 'react';
import CustomButton from './CustomButton';

interface Room {
  number: number;
  floor: number;
  position: number;
  isBooked: boolean;
}

interface FloorSelectorProps {
  selectedFloors: number[];
  onFloorsChange: (floors: number[]) => void;
  availableRooms: Room[];
}

const FloorSelector: React.FC<FloorSelectorProps> = ({
  selectedFloors,
  onFloorsChange,
  availableRooms
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const floors = Array.from({ length: 10 }, (_, i) => i + 1);

  const getAvailableRoomsOnFloor = (floor: number) => {
    return availableRooms.filter(room => room.floor === floor).length;
  };

  const toggleFloor = (floor: number) => {
    const isSelected = selectedFloors.includes(floor);
    if (isSelected) {
      onFloorsChange(selectedFloors.filter(f => f !== floor));
    } else {
      onFloorsChange([...selectedFloors, floor]);
    }
  };

  const clearSelection = () => {
    onFloorsChange([]);
  };

  const selectAll = () => {
    const floorsWithRooms = floors.filter(floor => getAvailableRoomsOnFloor(floor) > 0);
    onFloorsChange(floorsWithRooms);
  };

  return (
    <div className="floor-selector">
      <div className="floor-selector-trigger">
        <CustomButton
          onClick={() => setIsOpen(!isOpen)}
          variant="secondary"
          className="floor-selector-btn"
        >
          🏢 Floors {selectedFloors.length > 0 && `(${selectedFloors.length})`}
        </CustomButton>
      </div>

      {isOpen && (
        <div className="floor-selector-dropdown">
          <div className="floor-selector-header">
            <h4>Select Preferred Floors</h4>
            <div className="floor-selector-actions">
              <button onClick={selectAll} className="floor-action-btn">
                Select All
              </button>
              <button onClick={clearSelection} className="floor-action-btn">
                Clear
              </button>
            </div>
          </div>

          <div className="floor-options">
            {floors.map(floor => {
              const availableCount = getAvailableRoomsOnFloor(floor);
              const isSelected = selectedFloors.includes(floor);
              const hasRooms = availableCount > 0;

              return (
                <div
                  key={floor}
                  className={`floor-option ${isSelected ? 'selected' : ''} ${!hasRooms ? 'disabled' : ''}`}
                  onClick={() => hasRooms && toggleFloor(floor)}
                >
                  <div className="floor-option-content">
                    <span className="floor-number">Floor {floor}</span>
                    <span className="floor-rooms-count">
                      {availableCount} room{availableCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isSelected && <span className="floor-selected-indicator">✓</span>}
                </div>
              );
            })}
          </div>

          <div className="floor-selector-footer">
            <small>
              {selectedFloors.length === 0 
                ? "No floors selected - system will choose optimal floors"
                : `${selectedFloors.length} floor${selectedFloors.length !== 1 ? 's' : ''} selected`
              }
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorSelector;