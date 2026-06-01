import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";
import multiavatar from "@multiavatar/multiavatar/esm";

import {
  CameraIcon,
  ShuffleIcon,
  MapPinHouseIcon,
  EarthIcon,
} from "lucide-react";
import { useState } from "react";
import { completeOnboarding, enhanceUserBio } from "../lib/api";
import { LANGUAGES } from "../constants";
const OnboardingPage = () => {
  const { authUserData } = useAuthUser();

  const queryClient = useQueryClient();

  const [fromState, setFromState] = useState({
    fullname: authUserData?.fullname || "",
    bio: authUserData?.bio || "",
    email: authUserData?.email || "",
    nativeLanguage: authUserData?.nativeLanguage || "",
    learningLanguage: authUserData?.learningLanguage || "",
    location: authUserData?.location || "",
    profilePic: authUserData?.profilePic || "",
  });

  const [bioSuggestions, setBioSuggestions] = useState([]);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhanceBio = async () => {
    if (!fromState.nativeLanguage || !fromState.learningLanguage || !fromState.location) {
      toast.error("Please fill in your languages and location first to generate a personalized bio.");
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await enhanceUserBio({
        fullname: fromState.fullname,
        nativeLanguage: fromState.nativeLanguage,
        learningLanguage: fromState.learningLanguage,
        location: fromState.location,
      });
      if (res.success && res.bios) {
        setBioSuggestions(res.bios);
        toast.success("Bio suggestions generated!");
      } else {
        toast.error("Failed to generate bio suggestions.");
      }
    } catch (error) {
      toast.error("Error generating bio suggestions.");
    } finally {
      setIsEnhancing(false);
    }
  };

  if (
    fromState.nativeLanguage &&
    fromState.learningLanguage &&
    fromState.nativeLanguage === fromState.learningLanguage
  ) {
    toast.error("Both are same choose different language");
  }

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Onboarding completed");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message);
    },
  });

  // Genrate random avatar

const handleRandomAvatar = async (e) => {
  e.preventDefault();

  // Generate a random seed for the avatar
  const seed = Math.random().toString(36).substring(2, 10);

  // Generate the SVG code for the avatar
  const svgCode = multiavatar(seed);

  // Convert SVG to Image (Base64 or Blob)
  const imageUrl = await svgToImage(svgCode);

  // Update state with the image URL
  setFromState({
    ...fromState,
    profilePic: imageUrl,
  });

  // Toast success
  toast.success("Avatar updated successfully!");
};

// Function to convert SVG to Image
const svgToImage = (svgCode) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const svgBlob = new Blob([svgCode], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Create 300x300 canvas
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;

      const ctx = canvas.getContext("2d");

      // Draw SVG onto 300x300 canvas
      ctx.drawImage(img, 0, 0, 300, 300);

      // Convert to PNG Base64
      const base64Image = canvas.toDataURL("image/png");
      resolve(base64Image);
    };

    img.onerror = (err) => reject(err);
    img.src = svgUrl;
  });
};



  // From submission method

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(fromState);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-center">
            Complete your profile.
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile pic image container */}
            <div className="flex flex-col items-center justify-center">
              {fromState.profilePic ? (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                  <img
                    src={fromState.profilePic}
                    alt=""
                    className="w-24 h-24 rounded-full"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                  <CameraIcon className="size-12 text-base-content opacity-40" />
                </div>
              )}
            </div>
            {/* Genrate random avtar */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="btn btn-active"
              >
                <ShuffleIcon className="size-4 mr-2" />
                Generate Random Avatar
              </button>
            </div>
            {/* Full name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                value={fromState.fullname}
                onChange={(e) =>
                  setFromState({ ...fromState, fullname: e.target.value })
                }
                className="input input-bordered w-full border-none outline-none"
              />
            </div>
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="text"
                value={fromState.email}
                onChange={(e) =>
                  setFromState({ ...fromState, email: e.target.value })
                }
                className="input input-bordered w-full border-none outline-none"
              />
            </div>
            {/* Bio */}
            <div className="form-control">
              <div className="flex items-center justify-between">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <button
                  type="button"
                  onClick={handleEnhanceBio}
                  className="btn btn-ghost btn-xs text-primary flex items-center gap-1 hover:bg-primary/10"
                  disabled={isEnhancing}
                >
                  {isEnhancing ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <span>✨ Enhance Bio with AI</span>
                  )}
                </button>
              </div>
              <textarea
                name="bio"
                value={fromState.bio}
                onChange={(e) =>
                  setFromState({ ...fromState, bio: e.target.value })
                }
                className="textarea textarea-bordered w-full border-none outline-none resize-none"
              ></textarea>
              {bioSuggestions.length > 0 && (
                <div className="mt-2 p-3 bg-base-300 rounded-lg space-y-2 border border-primary/20">
                  <span className="text-xs font-semibold text-primary block">Select an AI-enhanced Bio:</span>
                  {bioSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFromState({ ...fromState, bio: suggestion });
                        setBioSuggestions([]);
                      }}
                      className="w-full text-left text-sm p-2 hover:bg-primary/15 rounded border border-base-content/10 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Native language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={fromState.nativeLanguage}
                  className="select select-bordered w-full border-none outline-none"
                  onChange={(e) => {
                    setFromState({
                      ...fromState,
                      nativeLanguage: e.target.value,
                    });
                  }}
                >
                  <option value="">Select your language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              {/* Learning language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={fromState.learningLanguage}
                  className="select select-bordered w-full border-none outline-none"
                  onChange={(e) => {
                    setFromState({
                      ...fromState,
                      learningLanguage: e.target.value,
                    });
                  }}
                >
                  <option value="">Select your language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Location */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinHouseIcon className="size-6 absolute top-3 left-3 text-base-content opacity-40" />
                <input
                  type="text"
                  value={fromState.location}
                  onChange={(e) =>
                    setFromState({ ...fromState, location: e.target.value })
                  }
                  className="input input-bordered w-full border-none text-xl outline-none pl-10 font-semibold"
                />
              </div>
            </div>
            {/* Submit button */}
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="btn btn-active w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <EarthIcon className="size-5" />
                    Complete Onboarding...
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
