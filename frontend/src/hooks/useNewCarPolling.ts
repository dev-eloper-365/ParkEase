import { useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://parkease-21u2.onrender.com';

interface ParkingEntry {
  _id: string;
  noPlate: string;
  timeIn: string;
  blockId: string;
  createdAt: string;
  updatedAt: string;
}

interface NewCarNotificationData {
  plate: string;
  timeIn: string;
  blockId: string;
}

export function useNewCarPolling(onNewCar: (data: NewCarNotificationData) => void) {
  const lastCarIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // Initial fetch to get the latest car ID
    const initializeLastCarId = async () => {
      try {
        // Use the same endpoint pattern as AdminDashboard
        const endpoint = `${API_BASE}/parkingData`;
        
        const response = await fetch(endpoint);
        if (response.ok) {
          const data: ParkingEntry[] = await response.json();
          if (data.length > 0) {
            // Sort by createdAt to get the most recent
            const sorted = [...data].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            lastCarIdRef.current = sorted[0]._id;
          }
        }
      } catch (error) {
        console.error('Error initializing car polling:', error);
      }
    };

    initializeLastCarId();

    // Poll every 3 seconds
    const startPolling = () => {
      intervalRef.current = setInterval(async () => {
        try {
          // Use the same endpoint pattern as AdminDashboard
          const endpoint = `${API_BASE}/parkingData`;
          
          const response = await fetch(endpoint);
          if (response.ok) {
            const data: ParkingEntry[] = await response.json();
            
            if (data.length > 0) {
              // Sort by createdAt to get the most recent
              const sorted = [...data].sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              const latestCar = sorted[0];
              
              // Check if this is a new car (different ID than last known)
              if (lastCarIdRef.current && latestCar._id !== lastCarIdRef.current) {
                // New car detected!
                onNewCar({
                  plate: latestCar.noPlate,
                  timeIn: latestCar.timeIn,
                  blockId: latestCar.blockId,
                });
              }
              
              // Update the last known car ID
              lastCarIdRef.current = latestCar._id;
            }
          }
        } catch (error) {
          console.error('Error polling for new cars:', error);
        }
      }, 3000); // Poll every 3 seconds
    };

    if (isPolling) {
      startPolling();
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPolling, onNewCar]);

  return { isPolling, setIsPolling };
}

