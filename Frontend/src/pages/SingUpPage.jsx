import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";
import useSignup from "../hooks/useSignup.js";

const SignUpPage = () => {
  // Fixed component name spelling
  const [signupData, setSignupData] = useState({
    // Fixed function name casing
    fullname: "",
    email: "",
    password: "",
  });

  //
    const  {error , isPending , signupMutation}= useSignup()

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-xl overflow-hidden">
        {/* SignUp form - Left side */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* Icon */}
          <div className="mb-4 flex items-center justify-start gap-3">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Meet
            </span>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response?.data?.message || error.message}</span>
            </div>
          )}

          {/* Form */}
          <div className="w-full form-control">
            <form onSubmit={handleSignup} method="post">
              <div className="space-y-4 mb-4">
                <h2 className="text-2xl font-bold text-primary">
                  Create your account
                </h2>
                <p className="text-sm opacity-70">
                  Join the meet now and explore new people and languages{" "}
                  {/* Fixed typo */}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <label className="text-lg font-medium text-primary">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  value={signupData.fullname}
                  onChange={(e) => {
                    setSignupData({ ...signupData, fullname: e.target.value });
                  }}
                  className="w-full p-2 border border-primary/25 rounded-md focus:outline-none focus:border-primary"
                  required
                />
                <label className="text-lg font-medium text-primary">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => {
                    setSignupData({ ...signupData, email: e.target.value });
                  }}
                  className="w-full p-2 border border-primary/25 rounded-md focus:outline-none focus:border-primary"
                  required
                />
                <label className="text-lg font-medium text-primary">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => {
                    setSignupData({ ...signupData, password: e.target.value });
                  }}
                  className="w-full p-2 border border-primary/25 rounded-md focus:outline-none focus:border-primary"
                  required
                />
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      required
                    />
                    <span className="label-text text-white">
                      I agree with the{" "}
                      <a href="/" className="text-primary">
                        terms and conditions
                      </a>{" "}
                      &{" "}
                      <a href="/" className="text-primary">
                        privacy policy
                      </a>
                    </span>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary">
                  {isPending ? (
                    <>
                      <span className="loading loading-dots"></span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have account?{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:underline ml-1"
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
        {/* SignUp form - Right side */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {" "}
            {/* Fixed spacing */}
            <div className="relative aspect-square max-w-xs mx-auto">
              <img
                src="/Videocall-bro.svg"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide {/* Fixed typos */}
              </h2>
              <p className="text-sm opacity-70">
                Join the meet now and explore new people and languages{" "}
                {/* Fixed typo */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
