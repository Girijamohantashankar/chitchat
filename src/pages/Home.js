import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { FaSearch } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

function Home() {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcceptedFriends = async () => {
      try {
        const token = localStorage.getItem("token");

        const friendsResponse = await axios.get(
          `http://localhost:5000/api/friends/accepted-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAcceptedFriends(friendsResponse.data);

        const messagesResponse = await axios.get(
          `http://localhost:5000/api/friends/last-messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const messages = messagesResponse.data.reduce((acc, msg) => {
          acc[msg.friendId] = msg;
          return acc;
        }, {});

        setLastMessages(messages);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedFriends();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredFriends = acceptedFriends.filter((friend) =>
    friend.friendName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openChat = (friend) => {
    navigate(`/chat/${friend.friendId}`, { state: { friend } });
  };

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <FaSearch className="search-icon" />
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul className="accepted-friends-list">
          {filteredFriends.map((friend) => (
            <li
              key={friend.friendId}
              className="friend-item"
              onClick={() => openChat(friend)}
            >
              <img
                src={friend.profilePic}
                alt={friend.friendName}
                className="friend-profile-pic"
              />
              <div className="friend-info">
                <div className="title_name">
                  <span className="friend-name">
                    {friend.friendName || "Friend"}
                  </span>
                  <span className="last-message">
                    {lastMessages[friend.friendId]?.lastMessage ||
                      "No messages yet"}
                  </span>
                </div>
                <div className="time_stap">
                  {lastMessages[friend.friendId]?.timestamp
                    ? formatDistanceToNow(
                        new Date(lastMessages[friend.friendId].timestamp),
                        { addSuffix: true }
                      )
                    : "No messages yet"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
