import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Admin from "./components/AdminDashboard";
import User from "./components/UserDashboard";

function App() {
  return (
    <main className="flex items-center justify-center w-screen h-screen bg-background dark">
      <Router>
        <Routes>
          <Route path="/" element={<Admin />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </Router>
    </main>
  );
}

export default App;
