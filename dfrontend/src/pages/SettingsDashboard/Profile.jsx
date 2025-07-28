"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL } from "../../context/myurl";
import toast, { Toaster } from "react-hot-toast";
import { useUsername } from "../../context/UsernameContext";
import { useUserDetails } from "../../context/UserDetailsContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const Profile = () => {
  const { username } = useUsername();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
    latitude: "",
    longitude: "",
    profilePicture: null,
    previewPicture: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("general");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const { userDetails } = useUserDetails();
  const [userDetailsFetched, setUserDetailsFetched] = useState([]);
  const [loading, setLoading] = useState(false);
  6;
  useEffect(() => {
    setLoading(true);
    if (userDetails) {
      setUserDetailsFetched(userDetails);

      // console.log(userDetails);
      setProfile((prevProfile) => ({
        ...prevProfile,
        username: "",
        email: "",
        bio: "",
        latitude: "",
        longitude: "",
        previewPicture: userDetails.profile_picture || "",
      }));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfile((prevProfile) => ({
            ...prevProfile,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setLoadingLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoadingLocation(false);
    }
    setLoading(false);
  }, [userDetails]);

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    const files = e.target.files;

    if (name === "profilePicture" && files && files.length > 0) {
      const file = files[0];
      setProfile((prev) => ({
        ...prev,
        profilePicture: file,
        previewPicture: URL.createObjectURL(file),
      }));
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", profile.username);
    formData.append("email", profile.email);
    formData.append("bio", profile.bio);
    formData.append("latitude", profile.latitude);
    formData.append("longitude", profile.longitude);
    formData.append("currentPassword", profile.currentPassword);
    formData.append("newPassword", profile.newPassword);
    formData.append("confirmPassword", profile.confirmPassword);

    if (profile.profilePicture instanceof File) {
      formData.append("profilePicture", profile.profilePicture);
    }

    const sendRequest = async (token) => {
      return await axios.patch(
        `${API_URL}/${username}/update-profile/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    };

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await sendRequest(accessToken);

      toast.success(response.data.detail || "Profile updated successfully!");
      setProfile((prev) => ({
        ...prev,
        profilePicture: null,
        previewPicture: "",
      }));
      document.getElementById("profile-upload").value = "";
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refresh = localStorage.getItem("refresh_token");
          const { data: refreshData } = await axios.post(
            `${API_URL}/token/refresh/`,
            {
              refresh,
            }
          );

          localStorage.setItem("access_token", refreshData.access);
          localStorage.setItem("refresh_token", refreshData.refresh);

          const retryResponse = await sendRequest(refreshData.access);
          toast.success(
            retryResponse.data.detail || "Profile updated after token refresh."
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          toast.error("Session expired. Please log in again.");
        }
      } else {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-slate-50 rounded-xl shadow-sm overflow-hidden">
      <Toaster position="top-right" />
      {/* Header with background */}
      {loading ? (
        // Full rectangular skeleton with same height as your div
        <div className="relative h-60 px-8">
          <Skeleton
            height="100%"
            width="100%"
            baseColor="#e0e7e9"
            highlightColor="#f5f5f5"
            className="rounded"
          />
        </div>
      ) : (
        // Your actual content once loading is false
        <div className="relative h-40 bg-[url('https://safeland.edu.np/static/images/indexmain.jpg')] bg-cover bg-center">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden">
                {profile.previewPicture ? (
                  <img
                    className="w-full h-full object-cover"
                    src={profile.previewPicture || "/placeholder.svg"}
                    alt="Profile"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#e0e7e9]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-16 h-16 text-[#6b7280]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <label
                htmlFor="profile-upload"
                className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  name="profilePicture"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Profile content */}
      <div className="pt-20 px-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-500">Update your profile information</p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save Changes
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("general")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "general"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    placeholder={userDetailsFetched.username}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder={
                      userDetailsFetched.email || "example@gmail.com"
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="latitude"
                      value={profile.latitude}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    {loadingLocation && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg
                          className="animate-spin h-5 w-5 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="longitude"
                      value={profile.longitude}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    {loadingLocation && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg
                          className="animate-spin h-5 w-5 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4  0 00-4 4H4z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder={
                    userDetailsFetched.bio ||
                    "Tell us a little about yourself..."
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Brief description for your profile.
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Changing your password will log you out of all devices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={profile.currentPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={profile.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={profile.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
