import { MessageCircleCodeIcon, UserCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { getUserFriends } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import NoFriendsFound from "./NoFriendsFound";
import { Link } from "react-router";

const FriendCards = () => {
  const [friendsList, setFriendsList] = useState([]);

  const {
    data: friendResponse,
    isLoading: loadingFriends,
    error: friendError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    onSuccess: (data) => {
      console.log("Friends data received:", data); // Debug log
    },
    onError: (error) => {
      console.error("Error fetching friends:", error); // Error logging
    },
  });

  // Improved friends list handling
  useEffect(() => {
    if (!loadingFriends && friendResponse) {
      console.log("Processing friend response:", friendResponse); // Debug log

      let friends;
      if (Array.isArray(friendResponse)) {
        friends = friendResponse;
      } else if (friendResponse.friends) {
        // Check for friends propertyf
        friends = friendResponse.friends;
      } else if (friendResponse.data) {
        // Check for data property
        friends = friendResponse.data;
      } else {
        friends = [];
        console.warn("Unexpected friends response format:", friendResponse);
      }

      console.log("Processed friends:", friends); // Debug log
      setFriendsList(friends);
    }
  }, [friendResponse, loadingFriends]);

  const StyledWrapper = styled.div`
    .card {
      position: relative;
      background: transparent;
      width: 300px;
      height: 300px;
      border: none;
    }

    .card:hover {
      width: 300px;
    }

    .card .container-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #e7e7e7;
      width: 190px;
      height: 190px;
      cursor: pointer;
      border: none;
      border-radius: 50%;
      box-shadow: 0 0 3px 1px #1818183d, 2px 2px 3px #18181865,
        inset 2px 2px 2px #ffffff;
      transition: all 0.3s ease-in-out, opacity 0.3s;
      transition-delay: 0.1s, 0s;
    }

    .card:hover .container-image {
      opacity: 0;
      border-radius: 8px;
      transition-delay: 0s, 0.6s;
    }

    .card .container-image .image-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 125px;
      height: auto;
      object-fit: contain;
      filter: drop-shadow(2px 2px 2px #1818188a);
      transition: all 0.3s ease-in-out;
      transition-delay: 0.4s;
    }

    .card:hover .container-image .image-circle {
      opacity: 0;
      transition-delay: 0s;
    }

    .card .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #e7e7e7;
      padding: 20px;
      width: 190px;
      height: 190px;
      cursor: pointer;
      border: none;
      border-radius: 8px;
      box-shadow: 0 0 3px 1px #1818183d, 2px 2px 3px #18181865,
        inset 2px 2px 2px #ffffff;
      visibility: hidden;
      transition: 0.3s ease-in-out;
      transition-delay: 0s;
      z-index: 1;
    }

    .card:hover .content {
      width: 290px;
      height: 190px;
      visibility: visible;
      transition-delay: 0.5s;
    }

    .card .content .detail {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: all 0.3s ease-in-out;
      transition-delay: 0s;
    }

    .card:hover .content .detail {
      color: #181818;
      opacity: 100%;
      transition: 1s;
      transition-delay: 0.3s;
    }

    .card .content .detail span {
      margin-bottom: 5px;
      font-size: 18px;
      font-weight: 800;
    }

    .card .content .detail button {
      margin-top: auto;
      color: #ffffff;
      font-size: 13px;
      border: none;
      border-radius: 8px;
      transition: 0.3s ease-in-out;
    }

    

    .card .content .product-image {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .card .content .product-image .box-image {
      display: flex;
      position: absolute;
      left: -55%;
      top:0;
      width: 100%;
      height: 75%;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.5s ease-in-out;
      transition-delay: 0s;
    }

    .card:hover .content .product-image .box-image {
      top: 0;
      left: 0;
      opacity: 100%;
      transform: scale(1);
      transition-delay: 0.3s;
    }

    .card .content .product-image .box-image .img-product {
      margin: auto;
      width: 7rem;
      height: auto;
    }

    .fil-shoes1,
    .fil-shoes2 {
      fill: #333333;
    }
  `;
  return (
    <>
      {loadingFriends ? (
        <div className="flex items-center justify-center">
          <span className="loading loading-ring loading-lg"></span>
        </div>
      ) : friendError ? (
        <div className="text-red-500 text-center">
          Error loading friends: {friendError.message}
        </div>
      ) : friendsList.length === 0 ? (
        <NoFriendsFound />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {friendsList.map((friend) => (
            <div className="px-8 py-6">
              <StyledWrapper>
                <div className="card">
                  <div className="container-image">
                    <img src={friend.profilePic} alt={friend.fullname} />
                  </div>
                  <div className="content">
                    <div className="detail">
                      <span>
                       {friend.fullname}
                      </span>
                      <p>{friend.bio}</p>
                     <div className="mt-auto flex justify-between">
                       <Link to={`/profile/${friend._id}`} className="btn btn-success ">
                        <UserCircleIcon className="size-6" />
                      </Link>
                       <Link to={`/chat/${friend._id}`} className="btn btn-success">
                        <MessageCircleCodeIcon className="size-6" />
                      </Link>
                     </div>
                    </div>
                    <div className="product-image">
                      <div className="box-image">
                        <img src={friend.profilePic} alt={friend.fullname} />
                      </div>
                    </div>
                  </div>
                    <div className="text-xl flex text-center">
                      {friend.fullname}
                    </div>
                </div>
              </StyledWrapper>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FriendCards;
