import React, { useState, useCallback } from 'react';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import FloorSelector from './FloorSelector';
import { useCustomToast } from '../hooks/useCustomToast';

interface Room {
  number: number;
  floor: number;
  position: number;
  isBooked: boolean;
}

interface BookingResult {
  rooms: Room[];
  totalTravelTime: number;
}

const HotelReservationSystem = () => {
  const [rooms, setRooms] = useState<Room[]>(() => initializeRooms());
  const [roomsToBook, setRoomsToBook] = useState<number>(1);
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [lastBooking, setLastBooking] = useState<Room[]>([]);
  const { showToast } = useCustomToast();

  function initializeRooms(): Room[] {
    const roomList: Room[] = [];
    
    // Floors 1-9: 10 rooms each
    for (let floor = 1; floor <= 9; floor++) {
      for (let pos = 1; pos <= 10; pos++) {
        roomList.push({
          number: floor * 100 + pos,
          floor,
          position: pos,
          isBooked: false
        });
      }
    }
    
    // Floor 10: 7 rooms
    for (let pos = 1; pos <= 7; pos++) {
      roomList.push({
        number: 1000 + pos,
        floor: 10,
        position: pos,
        isBooked: false
      });
    }
    
    return roomList;
  }

  const calculateTravelTime = (room1: Room, room2: Room): number => {
    const verticalTime = Math.abs(room1.floor - room2.floor) * 2;
    const horizontalTime = room1.floor === room2.floor ? 
      Math.abs(room1.position - room2.position) : 0;
    return verticalTime + horizontalTime;
  };

  const calculateTotalTravelTime = (selectedRooms: Room[]): number => {
    if (selectedRooms.length <= 1) return 0;
    
    let totalTime = 0;
    for (let i = 0; i < selectedRooms.length - 1; i++) {
      totalTime += calculateTravelTime(selectedRooms[i], selectedRooms[i + 1]);
    }
    return totalTime;
  };

  const findOptimalRooms = (numRooms: number, preferredFloors?: number[]): BookingResult | null => {
    let availableRooms = rooms.filter(room => !room.isBooked);
    
    // Filter by preferred floors if specified
    if (preferredFloors && preferredFloors.length > 0) {
      availableRooms = availableRooms.filter(room => preferredFloors.includes(room.floor));
    }
    
    if (availableRooms.length < numRooms) {
      return null;
    }

    let bestCombination: Room[] = [];
    let minTravelTime = Infinity;

    // Priority 1: Try to book all rooms on the same floor first
    const floorsToCheck = preferredFloors && preferredFloors.length > 0 
      ? preferredFloors 
      : Array.from({length: 10}, (_, i) => i + 1);

    for (const floor of floorsToCheck) {
      const floorRooms = availableRooms
        .filter(room => room.floor === floor)
        .sort((a, b) => a.position - b.position);
      
      if (floorRooms.length >= numRooms) {
        // Find the best consecutive or near-consecutive rooms on this floor
        for (let start = 0; start <= floorRooms.length - numRooms; start++) {
          const selectedRooms = floorRooms.slice(start, start + numRooms);
          const travelTime = calculateTotalTravelTime(selectedRooms);
          
          if (travelTime < minTravelTime) {
            minTravelTime = travelTime;
            bestCombination = selectedRooms;
          }
        }
      }
    }

    // If we found a same-floor solution, return it
    if (bestCombination.length === numRooms) {
      return { rooms: bestCombination, totalTravelTime: minTravelTime };
    }

    // Priority 2: Cross-floor booking to minimize travel time
    const tryMultiFloorBooking = (): Room[] => {
      const sortedRooms = availableRooms.sort((a, b) => {
        if (a.floor !== b.floor) return a.floor - b.floor;
        return a.position - b.position;
      });

      // For smaller bookings, try all combinations
      if (numRooms <= 4 && availableRooms.length <= 50) {
        return findBestCombination(sortedRooms, numRooms);
      }

      // For larger bookings, use greedy approach
      return sortedRooms.slice(0, numRooms);
    };

    const multiFloorRooms = tryMultiFloorBooking();
    const multiFloorTravelTime = calculateTotalTravelTime(multiFloorRooms);

    if (multiFloorTravelTime < minTravelTime) {
      bestCombination = multiFloorRooms;
      minTravelTime = multiFloorTravelTime;
    }

    return bestCombination.length === numRooms ? 
      { rooms: bestCombination, totalTravelTime: minTravelTime } : null;
  };

  const findBestCombination = (availableRooms: Room[], numRooms: number): Room[] => {
    let bestCombination: Room[] = [];
    let minTravelTime = Infinity;

    const generateCombinations = (arr: Room[], size: number): Room[][] => {
      if (size === 1) return arr.map(item => [item]);
      
      const combinations: Room[][] = [];
      for (let i = 0; i <= arr.length - size; i++) {
        const head = arr[i];
        const tail = generateCombinations(arr.slice(i + 1), size - 1);
        tail.forEach(combination => combinations.push([head, ...combination]));
      }
      return combinations;
    };

    const allCombinations = generateCombinations(availableRooms, numRooms);
    
    allCombinations.forEach(combination => {
      const sortedCombination = [...combination].sort((a, b) => {
        if (a.floor !== b.floor) return a.floor - b.floor;
        return a.position - b.position;
      });
      
      const travelTime = calculateTotalTravelTime(sortedCombination);
      
      if (travelTime < minTravelTime) {
        minTravelTime = travelTime;
        bestCombination = sortedCombination;
      }
    });

    return bestCombination;
  };

  const handleBookRooms = useCallback(() => {
    if (roomsToBook < 1 || roomsToBook > 5) {
      showToast("You can book between 1 and 5 rooms at a time.", "error");
      return;
    }

    const result = findOptimalRooms(roomsToBook, selectedFloors.length > 0 ? selectedFloors : undefined);
    
    if (!result) {
      const availableCount = selectedFloors.length > 0 
        ? rooms.filter(r => !r.isBooked && selectedFloors.includes(r.floor)).length
        : rooms.filter(r => !r.isBooked).length;
      
      const floorText = selectedFloors.length > 0 
        ? ` on selected floors (${selectedFloors.join(', ')})`
        : '';
      
      showToast(`Not enough rooms available${floorText}. Only ${availableCount} rooms remaining.`, "error");
      return;
    }

    const newRooms = rooms.map(room => {
      if (result.rooms.find(r => r.number === room.number)) {
        return { ...room, isBooked: true };
      }
      return room;
    });

    setRooms(newRooms);
    setLastBooking(result.rooms);
    
    const roomNumbers = result.rooms.map(r => r.number).join(', ');
    const floorText = selectedFloors.length > 0 ? ` (floors: ${selectedFloors.join(', ')})` : '';
    showToast(`Booked rooms: ${roomNumbers}${floorText}. Total travel time: ${result.totalTravelTime} minutes.`, "success");
  }, [roomsToBook, rooms, selectedFloors, showToast]);

  const handleReset = useCallback(() => {
    setRooms(initializeRooms());
    setLastBooking([]);
    showToast("All rooms are now available for booking.", "info");
  }, [showToast]);

  const handleRandomOccupancy = useCallback(() => {
    const newRooms = rooms.map(room => ({
      ...room,
      isBooked: Math.random() < 0.3
    }));
    
    setRooms(newRooms);
    setLastBooking([]);
    showToast("Hotel occupancy has been randomized.", "info");
  }, [rooms, showToast]);

  const availableRoomsCount = rooms.filter(room => !room.isBooked).length;
  const totalRooms = rooms.length;

  return (
    <div className="hotel-container">
      <div className="hotel-content">
        <div className="hotel-header">
          <h1 className="hotel-title">Hotel Room Reservation System</h1>
          <p className="hotel-subtitle">Intelligent Room Booking</p>
          <div className="room-counter">
            {availableRoomsCount} of {totalRooms} rooms available
          </div>
        </div>

        <div className="control-panel">
          <div className="control-row">
            <div className="input-group">
              <label htmlFor="rooms" className="input-label">
                Number of Rooms:
              </label>
              <CustomInput
                type="number"
                min="1"
                max="5"
                value={roomsToBook}
                onChange={(e) => setRoomsToBook(parseInt(e.target.value) || 1)}
                className="rooms-input"
              />
            </div>
            
            <FloorSelector
              selectedFloors={selectedFloors}
              onFloorsChange={setSelectedFloors}
              availableRooms={rooms.filter(room => !room.isBooked)}
            />
            
            <CustomButton 
              onClick={handleBookRooms}
              variant="primary"
              className="book-btn"
            >
              📚 Book Rooms
            </CustomButton>
            
            <CustomButton 
              onClick={handleRandomOccupancy}
              variant="secondary"
              className="random-btn"
            >
              🎲 Random
            </CustomButton>
            
            <CustomButton 
              onClick={handleReset}
              variant="danger"
              className="reset-btn"
            >
              🔄 Reset
            </CustomButton>
          </div>
        </div>

        <div className="hotel-layout">
          <h2 className="layout-title">Hotel Floor Plan</h2>
          
          <div className="floors-container">
            {Array.from({ length: 10 }, (_, i) => 10 - i).map(floor => {
              const floorRooms = rooms.filter(room => room.floor === floor);
              const maxRoomsOnFloor = floor === 10 ? 7 : 10;
              
              return (
                <div key={floor} className="floor">
                  <div className="floor-header">
                    <div className="lift-indicator">
                      LIFT
                    </div>
                    
                    <div className="floor-info">
                      <h3 className="floor-number">Floor {floor}</h3>
                      <p className="floor-rooms">
                        Rooms {floor === 10 ? '1001-1007' : `${floor}01-${floor}10`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="rooms-row">
                    {Array.from({ length: maxRoomsOnFloor }, (_, pos) => {
                      const room = floorRooms.find(r => r.position === pos + 1);
                      const isLastBooked = lastBooking.some(r => r.number === room?.number);
                      
                      return (
                        <div
                          key={pos}
                          className={`room ${room?.isBooked ? (isLastBooked ? 'room-new-booking' : 'room-booked') : 'room-available'}`}
                          title={`Room ${room?.number} - ${room?.isBooked ? 'Booked' : 'Available'}`}
                        >
                          {room?.number.toString().slice(-2)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color legend-available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-booked"></div>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-new-booking"></div>
              <span>Last Booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelReservationSystem;