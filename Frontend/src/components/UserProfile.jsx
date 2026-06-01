import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../lib/api";
import { Link } from "react-router";
import { X, Mail, Globe, BookOpen, MapPin, User, Calendar } from "lucide-react";
import { capitalize } from "../lib/utils";

const UserProfile = () => {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-950">
        <span className="loading loading-ring loading-lg text-indigo-500" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-rose-500">
        <p>Error loading profile: {error?.message || "Unknown error"}</p>
      </div>
    );
  }

  const profileFields = [
    { label: "Full Name", value: user.fullname, icon: User },
    { label: "Email Address", value: user.email, icon: Mail },
    { label: "Location", value: user.location || "Not specified", icon: MapPin },
    { label: "Native Language", value: capitalize(user.nativeLanguage), icon: Globe },
    { label: "Learning Language", value: capitalize(user.learningLanguage), icon: BookOpen },
    {
      label: "Member Since",
      value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown",
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="card w-full max-w-3xl bg-slate-900/50 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-md relative animate-fade-in">
        {/* Soft glowing mesh banner background */}
        <div className="h-32 w-full bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-teal-900/40 border-b border-slate-800/80 relative">
          <Link
            to="/"
            className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200"
            title="Go Back"
          >
            <X className="size-4" />
          </Link>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-8 md:px-10 relative">
          {/* Avatar floating layout */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-6 gap-4">
            <div className="avatar ring-4 ring-slate-900 rounded-full overflow-hidden w-32 h-32 bg-slate-800 border border-slate-700 shadow-2xl">
              <img
                src={user.profilePic || "https://avatar.iran.liara.run/public"}
                alt={user.fullname}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="badge badge-success text-white font-bold px-4 py-2.5 rounded-full text-xs flex items-center gap-1.5 h-8 border-0 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Active Session
            </span>
          </div>

          {/* User Meta */}
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center justify-center sm:justify-start gap-2">
              {user.fullname}
            </h1>
            {user.bio ? (
              <p className="text-slate-400 italic text-sm md:text-base leading-relaxed font-medium">
                "{user.bio}"
              </p>
            ) : (
              <p className="text-slate-500 italic text-sm">No bio added yet.</p>
            )}
          </div>

          {/* Profile details grid */}
          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mb-4">
              My Profile Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileFields.map((field, i) => {
                const Icon = field.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60"
                  >
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                        {field.label}
                      </span>
                      <span className="text-slate-200 font-semibold text-sm truncate block">
                        {field.value || "Not provided"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
