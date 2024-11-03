import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; 
import { FaEdit } from 'react-icons/fa';
import "../styles/Settings.css";

function Settings() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Add this state for image preview
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);

    // Create a preview URL for the selected image
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setUploading(true);
      let downloadURL = user.profilePic;
      if (imageFile) {
        const storageRef = ref(storage, `profile_pictures/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        downloadURL = await getDownloadURL(storageRef);
      }
      const response = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        { name: user.name, profilePic: downloadURL },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200) {
        setUser(response.data);
        setImagePreview(null); // Reset preview after saving
      }

      setIsEditing(false);
      setImageFile(null);
    } catch (error) {
      console.error('Error updating user details:', error.response?.data || error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
    window.location.reload();
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="settings">
      <div className="user-details">
        <img
          src={imagePreview || user.profilePic || 'path/to/default/image.jpg'} // Use image preview if available
          alt={user.name}
          className="user-profile-pic"
        />
        {isEditing && (
          <label htmlFor="imageUpload" className="upload-icon">
            <FaEdit className="pencil_icon" />
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
        )}
        <div className="user-info">
          <div className="profile_group">
            <label>Name:</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="profile_group">
            <label>Phone Number:</label>
            <input type="text" value={user.mobile} disabled />
          </div>
        </div>
        {isEditing && (
          <div className="save_btn_group">
            <button onClick={handleSave} disabled={uploading}>
              {uploading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}
        {!isEditing && (
          <div className='logout_btn'>
            <button onClick={handleEditClick}>Edit</button>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
