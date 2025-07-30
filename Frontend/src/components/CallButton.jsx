import React from "react";
import { VideoIcon } from "lucide-react";

const CallButton = ({ handelVideoCall }) => {
  return (
    <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0">
      <button onClick={handelVideoCall} className="btn btn-success btn-sm text-white">
        <VideoIcon className="size-6" />
      </button>
    </div>
  );
};

export default CallButton;
