import React, { useState, useEffect } from "react";
import "../styles/Communities.css";
import axios from "axios"; 

function Communities() {
  const [activeTab, setActiveTab] = useState("requested");
  const [users, setUsers] = useState([]); 
  const [requests, setRequests] = useState([]); 
  const [requestStatus, setRequestStatus] = useState({}); 
  const userId = localStorage.getItem("userId"); 

  useEffect(() => {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem("token"); 
          const response = await axios.get("https://chitchat-backend-0pu0.onrender.com/api/users", {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          });
          setUsers(response.data || []); 
        } catch (error) {
          console.error("Error fetching users:", error); 
        }
      };

    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await axios.get("https://chitchat-backend-0pu0.onrender.com/api/friends/requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequests(response.data || []); 
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    const storedStatus = JSON.parse(localStorage.getItem("requestStatus")) || {};
    setRequestStatus(storedStatus);

    fetchUsers();
    fetchRequests(); 
  }, []);

  const handleSendRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://chitchat-backend-0pu0.onrender.com/api/friends/send-request/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.msg);
      
      setRequestStatus((prev) => {
        const updatedStatus = { ...prev, [userId]: "pending" };
        localStorage.setItem("requestStatus", JSON.stringify(updatedStatus)); 
        return updatedStatus;
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

    const handleUpdateRequest = async (requestId, status) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `https://chitchat-backend-0pu0.onrender.com/api/friends/update-request/${requestId}`,
          { status },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data.msg);
        
        setRequests((prev) => 
          prev.map((request) =>
            request.friendId === requestId ? { ...request, status } : request
          )
        );

        setRequestStatus((prev) => {
          const updatedStatus = { ...prev, [requestId]: status };
          localStorage.setItem("requestStatus", JSON.stringify(updatedStatus)); 
          return updatedStatus;
        });
      } catch (error) {
        console.error("Error updating friend request:", error);
      }
    };

  return (
    <div className="communities">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "requested" ? "active" : ""}`}
          onClick={() => setActiveTab("requested")}
        >
          Requested
        </button>
        <button
          className={`tab ${activeTab === "friends" ? "active" : ""}`}
          onClick={() => setActiveTab("friends")}
        >
          Friends
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "requested" ? (
          <div>
            <h2>Requested Communities</h2>
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.friendId} className="request-item">
                  <img
                    src={request.profilePic} 
                    alt={request.friendName}
                    className="friend-profile-pic" 
                  />
                  <span className="friend-name">{request.friendName}</span>
                  <div className="status-buttons">
                    
                    {request.status === "pending" && (
                      <div>
                        <button className="accept_btn"
                          onClick={() =>
                            handleUpdateRequest(request.friendId, "accepted")
                          }
                        >
                          Accept
                        </button>
                        <button className="reject_btn"
                          onClick={() =>
                            handleUpdateRequest(request.friendId, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No requests at the moment.</p>
            )}
          </div>
        ) : (
          <div>
            <h2>Friends Communities</h2>
            <div className="user-list">
              {users.length > 0 ? (
                users
                  .filter(user => user._id !== userId && 
                    !requests.some(request => 
                      request.senderId === userId && request.friendId === user._id 
                    )
                  ) 
                  .map((user) => (
                    <div key={user._id} className="user-item">
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="user-profile-pic"
                      />
                      <span className="user-name">{user.name}</span>
                      <button
                        className={`send-request ${
                          requestStatus[user._id] === "pending"
                            ? "pending"
                            : requestStatus[user._id] === "accepted"
                            ? "accepted"
                            : ""
                        }`}
                        onClick={() => handleSendRequest(user._id)}
                        disabled={
                          requestStatus[user._id] === "pending" ||
                          requestStatus[user._id] === "accepted"
                        } 
                      >
                        {requestStatus[user._id] === "pending"
                          ? "Pending"
                          : requestStatus[user._id] === "accepted"
                          ? "Accepted"
                          : "Send Request"}
                      </button>
                    </div>
                  ))
              ) : (
                <p>No friends found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Communities;
