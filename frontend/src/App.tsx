import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { createContext, useContext, useState, useCallback } from "react";
import Admin from "./components/AdminDashboard";
import User from "./components/UserDashboard";
import LicensePlateScanner from "./components/LicensePlateScanner";
import { NewCarNotification } from "./components/ui/new-car-notification";
import { useNewCarPolling } from "./hooks/useNewCarPolling";

export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function App() {
  const [isDark, setIsDark] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    plate: string;
    timeIn: string;
    blockId: string;
  } | null>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  // Handle new car detection - memoized to prevent unnecessary re-renders
  const handleNewCar = useCallback((data: { plate: string; timeIn: string; blockId: string }) => {
    setNotificationData(data);
    setShowNotification(true);
  }, []);

  // Use the polling hook
  useNewCarPolling(handleNewCar);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {/* Global New Car Notification */}
      {showNotification && notificationData && (
        <NewCarNotification
          plate={notificationData.plate}
          timeIn={notificationData.timeIn}
          blockId={notificationData.blockId}
          onClose={handleCloseNotification}
        />
      )}
      
      <main className={`flex items-center justify-center w-screen h-screen ${isDark ? 'dark bg-background' : 'bg-white'}`}>
        <Router>
          <Routes>
            <Route path="/" element={<Admin />} />
            <Route path="/user" element={<User />} />
            <Route path="/scan-license-plate" element={<LicensePlateScanner />} />
          </Routes>
        </Router>
      </main>
    </ThemeContext.Provider>
  );
}

export default App;
