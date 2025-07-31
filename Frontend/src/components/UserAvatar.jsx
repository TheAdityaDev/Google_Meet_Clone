import { useEffect, useState } from "react";

const SecureAvatar = ({ imageUrl, alt = "User Avatar", size = 40 }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrl;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(imageUrl, {
          credentials: "include", // required for cookies/auth
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (isMounted) {
          setBlobUrl(objectUrl);
        }
      } catch (err) {
        console.error("🔴 Error loading avatar:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (imageUrl) {
      fetchImage();
    }

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl]);

  if (loading) {
    return (
      <div
        className="rounded-full bg-gray-200 animate-pulse"
        style={{ width: size, height: size }}
      />
    );
  }

  if (error || !blobUrl) {
    return (
      <img
        src="/default-avatar.png"
        alt="Fallback Avatar"
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
};

export default SecureAvatar;
