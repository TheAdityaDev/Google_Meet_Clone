import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, authUserData } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUserData,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUserData) return;

      try {
        const user = {
          id: authUserData._id,
          name: authUserData.fullname,
          image: authUserData.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({
          create: true,
        });

        toast.success("Joinded successfully....");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error to joining call", error);
        toast.error("Could not join the call, Please try again...");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUserData, callId]);

  if (authUser || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>
              Could not initialize the call.Please refresh or try again later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();

  const callingSatate = useCallCallingState()

  const navigate = useNavigate()

  // call end fuction
  if(callingSatate === CallingState.LEFT) return navigate("/")

    return(
      <StreamTheme>
        <SpeakerLayout />
        <CallControls />
      </StreamTheme>
    )
};
export default CallPage;
