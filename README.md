# Hotel Room Reservation System
A React-based hotel room reservation system that optimally assigns rooms based on travel time minimization.

![Screenshot 2025-05-28 115502](https://github.com/user-attachments/assets/aff28855-7365-43fe-a732-62d728e7d3c9)

## Features

- **Smart Room Assignment**: Automatically selects rooms to minimize travel time
- **Floor Selection**: Choose preferred floors for booking
- **Visual Floor Plan**: Interactive visualization of all 10 floors
- **Random Occupancy**: Generate random room bookings for testing
- **Responsive Design**: Works on desktop and mobile devices
  
![Screenshot 2025-05-28 115702](https://github.com/user-attachments/assets/48928edc-a616-44ea-8ca6-cbcce3aec38b)

## Room Assignment Rules

1. **Priority**: Same floor first, then minimize travel time
2. **Travel Time Calculation**:
   - Horizontal: 1 minute per room difference
   - Vertical: 2 minutes per floor difference
3. **Building Structure**:
   - Floors 1-9: 10 rooms each (101-110, 201-210, etc.)
   - Floor 10: 7 rooms (1001-1007)
   - Lift/stairs on the left side

## Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm Start
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── HotelReservationSystem.tsx    # Main component
│   ├── FloorSelector.tsx             # Floor selection dropdown
│   ├── CustomButton.tsx              # Custom button component
│   ├── CustomInput.tsx               # Custom input component
│   └── CustomToast.tsx               # Toast notification component
├── hooks/
│   └── useCustomToast.tsx            # Toast hook
├── App.tsx                           # App component
└── index.css                         # Global styles
```

## Technologies Used

- **React 18** with TypeScript
- **Custom Components** (no external UI libraries)

## Usage

1. Enter the number of rooms to book (1-5)
2. Optionally select preferred floors
3. Click "Book Rooms" to see optimal room assignment
4. Use "Random Occupancy" to generate test data
5. Use "Reset All" to clear all bookings

The system will automatically calculate and display the total travel time for the selected rooms.
