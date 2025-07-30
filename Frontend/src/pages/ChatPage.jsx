import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { Channel , ChannelHeader ,Chat , MessageInput ,MessageList ,Thread ,Window} from 'stream-chat-react'
import { StreamChat } from "stream-chat";


const ChatPage = () => {
  const { id:targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)

  const {authUserData} = useAuthUser();

  const {data:tokenData} = useQuery({
    queryKey:['streamToken'],
    queryFn:getStreamToken,
    enabled:!!authUserData
  })

  useEffect(() => {
    const initChat = async () => {
      if(tokenData?.token || authUserData) return;

      try {
        console.log("Initilzing stram chat with client....");

        const client = StreamChat.getInstance()
      } catch (error) {
        
      }
    }
    initChat()
  }, [])
  

  console.log(targetUserId)
  return <div>ChatPage</div>;
};

export default ChatPage;
