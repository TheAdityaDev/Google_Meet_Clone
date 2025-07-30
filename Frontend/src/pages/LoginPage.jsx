import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin.js";

const LoginPage = () => {
  const [loginData, setloginData] = useState({
    email: "",
    password: "",
  });

  const {isPending , error ,loginMutatiom} = useLogin();



  const handleSignup = (e) => {
    e.preventDefault();
    loginMutatiom(loginData);
  };

  // // Debounced input handlers with 500ms delay
  // const handleEmailChange = useCallback((e) => {
  //   const timeoutId = setTimeout(() => {
  //     setloginData((prev) => ({ ...prev, email: e.target.value }));
  //   }, 500);
  //   return () => clearTimeout(timeoutId);
  // }, []);

  // const handlePasswordChange = useCallback((e) => {
  //   const timeoutId = setTimeout(() => {
  //     setloginData((prev) => ({ ...prev, password: e.target.value }));
  //   }, 500);
  //   return () => clearTimeout(timeoutId);
  // }, []);

  return (
      <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-xl overflow-hidden">
        {/* Login form - Left side */}
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
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => {
                    setloginData({ ...loginData, email: e.target.value });
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
                  value={loginData.password}
                  onChange={(e) => {
                    setloginData({ ...loginData, password: e.target.value });
                  }}
                  className="w-full p-2 border border-primary/25 rounded-md focus:outline-none focus:border-primary"
                  required
                />
                
                <button type="submit" className="btn btn-primary">
                  {isPending ? (
                    <>
                      <span className="loading loading-dots"></span>
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have account?{" "}
                    <Link
                      to="/signup"
                      className="text-primary hover:underline ml-1"
                    >
                      Singup
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

export default LoginPage;
