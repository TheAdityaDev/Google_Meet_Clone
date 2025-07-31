// src/components/UserProfile.jsx
const UserProfileComponent = ({ user }) => {
  const profileFields = [
    { label: "Full Name", value: user.fullname },
    { label: "Email", value: user.email },
    { label: "Bio", value: user.bio },
    { label: "Location", value: user.location },
    { label: "Native Language", value: user.nativeLanguage },
    { label: "Learning Language", value: user.learningLanguage },
  ];

  console.log(user)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <img
            src={user.profilePic || "/default-avatar.png"}
            alt={`${user.fullname}'s profile`}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.fullname}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileFields.map((field, index) => (
              <InfoField key={index} label={field.label} value={field.value} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none"
      type="text"
      value={value || "Not provided"}
      readOnly
    />
  </div>
);

export default UserProfileComponent;
