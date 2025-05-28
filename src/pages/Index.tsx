import React from 'react';
import HotelReservationSystem from '../components/HotelReservationSystem';
import { ToastProvider } from '../hooks/useCustomToast';
import '../styles/hotel.css';

const Index = () => {
  return (
    <ToastProvider>
      <HotelReservationSystem />
    </ToastProvider>
  );
};

export default Index;