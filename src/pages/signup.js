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

const Signup = () => {
  const [name, setName] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+91'); 
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 
  const { setIsAuthenticated } = useAuth(); 

  const handleSignup = async (e) => {
    e.preventDefault();

    const fullMobileNumber = selectedCountryCode + mobile;

    if (!isValidPhoneNumber(fullMobileNumber, selectedCountryCode)) {
      toast.error('Please enter a valid mobile number'); 
      return;
    }

    try {
      const response = await axios.post('https://chitchat-backend-0pu0.onrender.com/api/auth/signup', { name, mobile: fullMobileNumber, password });
      localStorage.setItem('token', response.data.token);
      toast.success('User created successfully!'); 
      navigate('/'); 
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.error || 'Error creating user');
      } else {
        toast.error('Error creating user');
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="User Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">Sign Up</button>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
      <ToastContainer /> 
    </div>
  );
};

export default Signup;
