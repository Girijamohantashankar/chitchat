import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react"; 
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { BsEmojiSmile } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import CircularProgress from "@mui/material/CircularProgress";
import "../styles/Chat.css";
import "../styles/emoji-mart.css";
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

function Chat() {
  const location = useLocation();
  const { friend } = location.state;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUserId, setTypingUserId] = useState(null);
  const [friendStatus, setFriendStatus] = useState({ isOnline: false });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const [attachment, setAttachment] = useState(null);
  const storage = getStorage();
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentNote, setAttachmentNote] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const getUserIdFromToken = (token) => {
    if (!token) return null;
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.userId;
  };

  const userId = getUserIdFromToken(token);

  useEffect(() => {
    socket.emit("joinRoom", userId);
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat/messages/${friend.friendId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(response.data);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };

    fetchMessages();

    socket.on("receiveMessage", (message) => {
      if (
        (message.senderId === userId &&
          message.receiverId === friend.friendId) ||
        (message.receiverId === userId && message.senderId === friend.friendId)
      ) {
        setMessages((prevMessages) => {
          if (!prevMessages.some((msg) => msg._id === message._id)) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      }
    });

    socket.on("userTyping", ({ senderId }) => {
      if (senderId !== userId && senderId === friend.friendId) {
        setTypingUserId(senderId);
        setTimeout(() => setTypingUserId(null), 2000);
      }
    });

    socket.on("userStatusUpdate", ({ userId: updatedUserId, status }) => {
      if (updatedUserId === friend.friendId) {
        setFriendStatus({ isOnline: status === "online" });
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStatusUpdate");
    };
  }, [friend.friendId, token, userId]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachment) return;

    let fileURL = null;

    if (attachment) {
      setIsUploading(true);
      const storageRef = ref(storage, `attachments/${attachment.name}`);
      const uploadTask = uploadBytesResumable(storageRef, attachment);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setIsUploading(false);
          setUploadProgress(0);
        },
        async () => {
          try {
            fileURL = await getDownloadURL(uploadTask.snapshot.ref);
            sendMessageToServer(fileURL); 
          } catch (err) {
            console.error("Failed to get download URL:", err);
          }
        }
      );
    } else {
      sendMessageToServer(null);
    }
  };

  const sendMessageToServer = async (fileURL) => {
    const messageData = {
      receiverId: friend.friendId,
      text: newMessage,
      fileURL,
      attachmentNote,
    };

    const newMessageObject = {
      senderId: userId,
      receiverId: friend.friendId,
      text: newMessage,
      fileURL,
      attachmentNote,
      timestamp: new Date().toISOString(),
      _id: Date.now().toString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessageObject]);
    setNewMessage(""); 

    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat/send",
        messageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      socket.emit("sendMessage", newMessageObject);
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== newMessageObject._id)
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setAttachment(null); 
      setAttachmentPreview(null); 
      setAttachmentNote(""); 
      setPreview(null);
      setShowEmojiPicker(false);
    }
  };
  const handleTyping = () => {
    socket.emit("userTyping", {
      senderId: userId,
      receiverId: friend.friendId,
    });
  };

  const handleEmojiClick = (emojiObject) => {
    if (emojiObject && emojiObject.emoji) {
      setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    } else {
      console.error("Selected emoji is undefined", emojiObject);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return; 

    const fileType = file.type.split("/")[0]; 
    const fileURL = URL.createObjectURL(file);
    setAttachment(file); 
    if (fileType === "image" || fileType === "video") {
      setPreview({ type: fileType, url: fileURL });
    } else {
      setPreview({ type: "document", url: fileURL }); 
    }
  };
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:5000/api/chat/delete/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
      socket.emit("deleteMessage", messageId);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };
  const handleDownload = (url) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = url.split("/").pop(); 
        document.body.appendChild(a);
        a.click();
        a.remove(); 
        URL.revokeObjectURL(objectUrl); 
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img
          src={friend.profilePic}
          alt={friend.friendName}
          className="chat-profile-pic"
        />
        <div className="user_t">
          <span className="chat-friend-name">{friend.friendName}</span>
          <span className="chat-status">
            {friendStatus.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${
              msg.senderId === userId ? "sent-message" : "received-message"
            }`}
          >
            <div>{msg.text}</div>
            {msg.fileURL && (
              <div className="attachment-preview send_attachment">
                <img
                  src={msg.fileURL}
                  alt="Attachment Preview"
                  className="attachment-preview-img"
                  style={{ width: "200px", height: "200px" }}
                />
                <div className="btn_b">
                  <button onClick={() => handleDownload(msg.fileURL)} className="download-icon">
                    ⬇️
                  </button>

                  <button
                    onClick={() => handleDeleteMessage(msg._id)} 
                    className="delete-icon"
                    title="Delete Attachment"
                    style={{
                      marginTop: "5px",
                      cursor: "pointer",
                      color: "red",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}

            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        {typingUserId && typingUserId === friend.friendId && (
          <div className="typing-indicator">Typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <button
          className="emoji-button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
         <BsEmojiSmile size={26} />
        </button>
        {showEmojiPicker && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        {preview && (
          <div className="attachment-preview input_preview_img">
            {preview.type === "image" && (
              <img
                src={preview.url}
                alt="Attachment Preview"
                className="attachment-preview-img"
              />
            )}
            {preview.type === "video" && (
              <video controls className="attachment-preview-img">
                <source src={preview.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            {preview.type === "document" &&
              attachment && ( 
                <div className="attachment-preview-document">
                  <span>Document: {attachment.name}</span>
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Document
                  </a>
                </div>
              )}
            <input
              type="text"
              placeholder="Add a note..."
              className="attachment-note-input note_inpu"
              onChange={(e) => setAttachmentNote(e.target.value)} 
            />
            <button
              className="remove-attachment-button"
              onClick={() => {
                setPreview(null);
                setAttachment(null);
              }}
            >
              X
            </button>
          </div>
        )}
        {isUploading && (
          <div className="upload-progress-container">
            <CircularProgress variant="determinate" value={uploadProgress} />
            <span className="percentage">{uploadProgress}%</span>
          </div>
        )}

        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileInput"
        />
        <label htmlFor="fileInput" className="attachment-button">
          📎
        </label>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage() : null)}
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="send-button">
        <IoSend size={24} className="send_btn_b" />
        </button>
      </div>
    </div>
  );
}

export default Chat;
