import { useState } from 'react';
import axios from 'axios';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Link, useNavigate } from 'react-router-dom'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../styles/Auth.css';
import { useAuth } from '../AuthContext'; 

const countryCodes = [
  { code: '+91', name: 'India' },
  { code: '+1', name: 'USA' },
  { code: '+44', name: 'UK' },
  { code: '+81', name: 'Japan' },
];

const Login = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91'); 
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 
  const { setIsAuthenticated } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    const fullMobileNumber = selectedCountryCode + mobile;

    if (!isValidPhoneNumber(fullMobileNumber, selectedCountryCode)) {
      toast.error('Please enter a valid phone number'); 
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { mobile: fullMobileNumber, password });
      localStorage.setItem('token', response.data.token); 
      setIsAuthenticated(true); 
      toast.success('Logged in successfully'); 
      navigate('/'); 
    } catch (err) {
      toast.error('Invalid credentials'); 
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className="input-group">
          <select className="country-code" value={selectedCountryCode} onChange={(e) => setSelectedCountryCode(e.target.value)}>
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
      <ToastContainer /> 
    </div>
  );
};

export default Login;
