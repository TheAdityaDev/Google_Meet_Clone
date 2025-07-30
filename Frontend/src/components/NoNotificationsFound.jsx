import { BellIcon } from "lucide-react";
import { useEffect, useState } from "react";

function NoNotificationsFound() {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 5000); // 10 seconds

    return () => clearTimeout(timer); // Cleanup if component unmounts
  }, []);
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {showMessage ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-16 rounded-full bg-base-300 flex items-center justify-center mb-4">
            <BellIcon className="size-8 text-base-content opacity-40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
          <p className="text-base-content opacity-70 max-w-md">
            When you receive friend requests or messages, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="loading loading-infinity loading-lg" />
      )}
    </div>
  );
}

export default NoNotificationsFound;
