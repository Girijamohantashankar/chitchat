import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Signup from './pages/signup.js';
import Login from './pages/Login.js';
import Home from './pages/Home.js';
import Communities from './pages/Communities.js';
import Settings from './pages/Settings.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js'; 
import Calls from './pages/Calls.js';
import Chat from './components/Chat.js';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      {isAuthenticated && <Navbar />} 

      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/communities" element={isAuthenticated ? <Communities /> : <Navigate to="/login" />} />
        <Route path="/calls" element={isAuthenticated ? <Calls /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/chat/:friendId" element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} />
      </Routes>

      {isAuthenticated && <Footer />} 
    </Router>
  );
}

export default App;
