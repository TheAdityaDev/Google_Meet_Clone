// import  { useEffect, useState } from "react";
// // import useAuthUser from "../hooks/useAuthUser";

// const SecureAvatar = ({ imageUrl }) => {
//    const [blobUrl, setBlobUrl] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
// //   const {authUserData} = useAuthUser()
// // 
//   useEffect(() => {
//     let isMounted = true;

//    const fetchImage = async () => {
//       try {
//         setLoading(true);
//         setError(false);

//         const response = await fetch(imageUrl, {
//           credentials: "include", // required if your backend uses cookies
//         });

//         if (!response.ok) {
//           throw new Error(`Image fetch failed: ${response.status}`);
//         }

//         const blob = await response.blob();
//         const objectUrl = URL.createObjectURL(blob);

//         if (isMounted) {
//           setBlobUrl(objectUrl);
//         }
//       } catch (err) {
//         console.error("Image load error:", err);
//         if (isMounted) setError(true);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     if (imageUrl) {
//       fetchImage();
//     }

//     return () => {
//       isMounted = false;
//       if (blobUrl) {
//         URL.revokeObjectURL(blobUrl); // cleanup
//       }
//     };
//   }, [imageUrl]);


//   if (loading) {
//     return (
//       <div className="size-10 bg-gray-200 loading-ring animate-pulse"/> 
//     );
//   } 

//   if (!error || !blobUrl) {
//     return (
//       <img
//         src="/default-avatar.png"
//         alt="Fallback Avatar"
//       />
//     );
//   }

// //   return (
// //     <img
// //       src={blobUrl || authUserData?.profilePic}
// //       alt="User Avatar"
// //     />
// //   );

//   return (
//     <img
//       src={blobUrl} // fallback in case blobUrl is null
//       alt="User Avatar"
//     />
//   );
// };

// export default SecureAvatar;
