import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const { authUserData } = useAuthUser();

  useEffect(() => {
    if (!authUserData) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    const apiURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socketURL = apiURL.replace("/api", "");

    const newSocket = io(socketURL, {
      query: {
        userId: authUserData._id,
      },
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("call:incoming", ({ callerId, offer, callerName, callerPic, chatId }) => {
      setIncomingCall({ callerId, offer, callerName, callerPic, chatId });
    });

    newSocket.on("call:ended", () => {
      setIncomingCall(null);
    });

    newSocket.on("call:rejected", () => {
    });

    return () => {
      newSocket.close();
      setSocket(null);
    };
  }, [authUserData]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        incomingCall,
        setIncomingCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
