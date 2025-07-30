import { Routes, Route, Navigate } from "react-router";
import { lazy } from "react";
import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

const HomePage = lazy(() => import("./pages/HomePage"));
const SingUpPage = lazy(() => import("./pages/SingUpPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const CallPage = lazy(() => import("./pages/CallPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));

const LoginPage = lazy(() => import("./pages/LoginPage"));

const Layout = lazy(() => import("./components/Layout"));

const OnboargdingPage = lazy(() => import("./pages/OnboardingPage"));

const App = () => {
  const { authUser, authUserData } = useAuthUser();

  // theme of app
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUserData);
  const isOnboard = authUserData?.isOnboarded;
  if (authUser) return <PageLoader />;
  return (
    <div className="h-screen w-screen overflow-x-hidden" data-theme={theme}>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboard ? (
              <Layout showSildeBar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate
                to={!isAuthenticated ? "/login" : "/onboard"}
                replace={true}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <SingUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboard ? "/" : "/onboard"} />
            )
          }
        />
        <Route
          path="/notification"
          element={
            isAuthenticated && isOnboard ? (
              <Layout showSildeBar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboard"} />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboard ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboard "} />
            )
          }
        />
        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboard ? (
              <Layout showSildeBar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboard "} />
            )
          }
        />
        <Route
          path="/onboard"
          element={
            isAuthenticated ? (
              !isOnboard ? (
                <OnboargdingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
