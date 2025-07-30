import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { toast } from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sream Api key

  const Stream_API_Key = import.meta.env.VITE_STREAM_API_KEY;

  const { authUserData } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUserData,
  });

 useEffect(() => {
  const initChat = async () => {
    if (!tokenData?.token || !authUserData) return;

    try {
      console.log("Initializing Stream Chat...");

      const client = StreamChat.getInstance(Stream_API_Key);

      await client.connectUser(
        {
          id: authUserData._id,
          name: authUserData.fullname,
          image: authUserData.profilePic,
        },
        tokenData.token
      );

      const channelId = [authUserData._id, targetUserId].sort().join("-");

      const currentChannel = client.channel("messaging", channelId, {
        members: [authUserData._id, targetUserId],
      });

      await currentChannel.watch();

      setChatClient(client);
      setChannel(currentChannel);
    } catch (error) {
      console.error(error);
      toast.error("Could not connect to chat. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  initChat();
}, [tokenData, authUserData, targetUserId]);


  const handelVideoCall = () =>{
    const callUrl = `${window.location.origin}/call/${channel.id}`

    channel.sendMessage({
      text:`I've started a video call. Join me here ${callUrl}`
    })

    toast.success('Video call link sent sucessfully...')
  }



  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[91vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handelVideoCall={handelVideoCall} />
            <Window>
              <ChannelHeader  />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread/>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
