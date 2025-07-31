import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../lib/api";

const ProfilePage = () => {
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
    select: (data) => {
      if (data && typeof data === "object" && data.fullname && data.email) {
        return data;
      }
      console.error("Invalid or incomplete user data:", data);
      return null;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-ring loading-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-10">
        Error loading profile: {error?.message || "Unknown error"}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-500 mt-10">
        No valid user data received
      </div>
    );
  }

  const profileFields = [
    { label: "Full Name", value: user.fullname },
    { label: "Email", value: user.email },
    { label: "Bio", value: user.bio },
    { label: "Location", value: user.location },
    { label: "Native Language", value: user.nativeLanguage },
    { label: "Learning Language", value: user.learningLanguage },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
          <img
            src={user.profilePic || "/default-avatar.png"}
            alt={`${user.fullname}'s profile`}
            className="w-28 h-28 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="text-center sm:text-left mt-4 sm:mt-0">
            <h1 className="text-4xl font-bold">👋{user.fullname}</h1>
            <p className="text-gray-600 text-2xl mt-3">📧{user.email}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileFields.map((field, index) => (
              <div key={index}>
                <label className="block text-gray-700 font-medium mb-1">
                  {field.label}
                </label>
                <input
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  value={field.value || "Not provided"}
                  readOnly
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>
            Member since:{" "}
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
