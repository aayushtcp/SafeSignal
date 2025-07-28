import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Login from "./components/Login.jsx";
import Logout from "./components/Logout.jsx";
import "./interceptor/axios.js";
import Register from "./components/Register.jsx";
import DisasterRegister from "./pages/DisasterRegister.jsx";
import { DisasterList } from "./pages/DisasterList.jsx";
import DisasterDetail from "./pages/DisasterDetail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { UsernameProvider } from "./context/UsernameContext.jsx";
import { DisastersProvider } from "./context/DisastersContext.jsx";
import RequestHelp from "./pages/UserHelp/RequestHelp.jsx";
import HelpRequestsList from "./pages/UserHelp/HelpRequestsList.jsx";
import HelpRequestDetail from "./pages/UserHelp/HelpRequestDetail.jsx";
import { HelpsProvider } from "./context/HelpsContext.jsx";
import UploadImage from "./pages/UploadImage.jsx";
import ImageGallery from "./pages/ImageGallery.jsx";
import Analytics from "./pages/Analytics.jsx";
import Sidebar from "./components/UserSettings/Sidebar.jsx";
import Profile from "./pages/SettingsDashboard/Profile.jsx";
import Settings from "./pages/SettingsDashboard/Settings.jsx";
import { UserDetailsProvider } from "./context/UserDetailsContext.jsx";
import { UserPreferencesProvider } from "./context/UserPreferencesContext.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import About from "./pages/About.jsx";

let urls = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <UsernameProvider>
        <DisastersProvider>
          <Home />
        </DisastersProvider>
      </UsernameProvider>
    ),
  },
  {
    path: "/disaster-list",
    element: (
      <UsernameProvider>
        <UserDetailsProvider>
          <DisastersProvider>
            <DisasterList />
          </DisastersProvider>
        </UserDetailsProvider>
      </UsernameProvider>
    ),
  },
  {
    path: "/upload-image",
    element: (
      <UsernameProvider>
        <UploadImage />
      </UsernameProvider>
    ),
  },
  {
    path: "/gallery",
    element: (
      <UsernameProvider>
        <ImageGallery />
      </UsernameProvider>
    ),
  },
  {
    path: "/register-disaster",
    element: (
      <UsernameProvider>
        <DisasterRegister />
      </UsernameProvider>
    ),
  },

  // Any route that needs authentication can be nested under ProtectedRoute:
  {
    element: <ProtectedRoute />, // ProtectedRoute wrapper
    children: [
      {
        path: "/logout",
        element: <Logout />,
      },

      {
        path: "/settings",
        element: (
          <UsernameProvider>
            <UserDetailsProvider>
              <Sidebar />
            </UserDetailsProvider>
          </UsernameProvider>
        ),
        children: [
          {
            path: "/settings/profile",
            element: (
              <UsernameProvider>
                <UserDetailsProvider>
                  <Profile />
                </UserDetailsProvider>
              </UsernameProvider>
            ),
          },
          {
            path: "/settings",
            element: (
              <UsernameProvider>
                <UserPreferencesProvider>
                  <Settings />
                </UserPreferencesProvider>
              </UsernameProvider>
            ),
          },
        ],
      },

      {
        path: "/disaster-detail/:disaster_id",
        element: (
          <UsernameProvider>
            <UserDetailsProvider>
              <DisastersProvider>
                <DisasterDetail />
              </DisastersProvider>
            </UserDetailsProvider>
          </UsernameProvider>
        ),
      },
    ],
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/about",
    element: (
      <UsernameProvider>
        <DisastersProvider>
          <About />
        </DisastersProvider>
      </UsernameProvider>
    ),
  },

  {
    path: "/request-help",
    element: (
      <UsernameProvider>
        <RequestHelp />
      </UsernameProvider>
    ),
  },
  {
    path: "/all-help-requests",
    element: (
      <UsernameProvider>
        <HelpsProvider>
          <HelpRequestsList />
        </HelpsProvider>
      </UsernameProvider>
    ),
  },
  {
    path: "/help-request/:help_id",
    element: (
      <UsernameProvider>
        <UserDetailsProvider>
          <HelpRequestDetail />
        </UserDetailsProvider>
      </UsernameProvider>
    ),
  },

  //Analytics routes
  {
    path: "/analytics",
    element: (
      <UsernameProvider>
        <Analytics />
      </UsernameProvider>
    ),
  },

  {
    path: "*",
    element: <PageNotFound />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={urls} />
);
