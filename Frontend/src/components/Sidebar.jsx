import { BellIcon, HomeIcon, ShipWheelIcon, UserIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";

const Sidebar = () => {
  const { authUserData } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  console.log(currentPath);
  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-base-300">
        <Link to="/" className=" flex items-center justify-start gap-3">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Meet
          </span>
        </Link>
      </div>
      {/* SideBar Links */}
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        {/* Friends */}
        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UserIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        {/* Notifications */}
        <Link
          to="/notification"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notification" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notification</span>
        </Link>
      </nav>

      {/* User Profile Details */}
      <div className="p-4 border-t border-base-300  mt-auto flex items-center justify-center">
        <Link to={"/profile"}>
          <div className="flex items-center  gap-3  hover:bg-gray-300/10 rounded-lg w-[150px] px-5 py-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={authUserData?.profilePic} alt="Avatar" />
              </div>
            </div>
            <div className="flex-1 pl-3">
              <p className="font-semibold text-sm">{authUserData?.fullname}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
