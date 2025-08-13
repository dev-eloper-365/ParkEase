import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { createContext, useContext, useState } from "react";
import Admin from "./components/AdminDashboard";
import User from "./components/UserDashboard";
import LicensePlateScanner from "./components/LicensePlateScanner";

export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function App() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
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
