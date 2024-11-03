import React, { useRef, useState } from 'react';
import { FaBell, FaCamera } from 'react-icons/fa'; 
import '../styles/navbar.css';

function Navbar() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData); 
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setStreaming(false);
      video.srcObject = null; 
    }
  };

  const backToCamera = () => {
    setCapturedImage(null); 
    openCamera();
  };

  return (
    <div className="navbar">
      <div className="navbar-title">ChitChat</div>
      <div className="navbar-icons">
        <FaCamera className="navbar-icon" onClick={openCamera} />
        <FaBell className="navbar-icon" />
      </div>

      {streaming && !capturedImage && (
        <div className="camera-overlay">
          <video ref={videoRef} autoPlay playsInline></video>
          <button onClick={captureImage}>Capture</button>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}

      {capturedImage && (
        <div className="captured-image-overlay">
          <img src={capturedImage} alt="Captured" className="captured-image" />
          <button onClick={backToCamera} className="back-button">Back</button>
        </div>
      )}
    </div>
  );
}

export default Navbar;
