"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { API_URL } from "../context/myurl";
import { useUsername } from "../context/UsernameContext";
// for validations
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { disasterFormSchema } from "../validations/disasterSchema";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DisasterRegister = () => {
  const [error, setError] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState(null);
  const [mapSrc, setMapSrc] = useState(null);
  const [autoLocation, setAutoLocation] = useState(true);
  const [manualAddress, setManualAddress] = useState("");
  const [addressSearching, setAddressSearching] = useState(false);
  const { username } = useUsername();

  // Image upload state
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const blurstyle = {
    background: "rgba(255, 255, 255, 0.25)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
    backdropFilter: "blur(.7px)",
    WebkitBackdropFilter: "blur(3px)",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(disasterFormSchema),
    defaultValues: {
      disasterType: "",
      disasterDescription: "",
      images: [],
      autoLocation: true,
      manualAddress: "",
      latitude: null,
      longitude: null,
    },
  });

  // Watch for autoLocation changes
  const watchAutoLocation = watch("autoLocation");

  useEffect(() => {
    // Handle location
    if (watchAutoLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude);
          setValue("longitude", position.coords.longitude);
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationLoading(false);
          setMapSrc(
            `https://maps.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&output=embed`
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  }, [watchAutoLocation, setValue]);

  // Handle image upload with validation
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Get current images
    const currentImages = watch("images") || [];

    // Limit to 4 images
    if (currentImages.length + files.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(
      (file) => !["image/jpg", "image/jpeg", "image/png"].includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Only jpg, jpeg, and png formats are supported");
      return;
    }

    // Create preview URLs and add files to state
    const newImagePreviews = [...imagePreview];
    const newImages = [...images];
    const updatedFormImages = [...currentImages];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreviews.push(reader.result);
        setImagePreview([...newImagePreviews]);
      };
      reader.readAsDataURL(file);
      newImages.push(file);
      updatedFormImages.push(file);
    });

    setImages(newImages);
    setValue("images", updatedFormImages);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    const newImagePreviews = [...imagePreview];

    newImages.splice(index, 1);
    newImagePreviews.splice(index, 1);

    setImages(newImages);
    setImagePreview(newImagePreviews);
  };

  const searchAddress = async () => {
    const address = watch("manualAddress");
    if (!address.trim()) return;

    setAddressSearching(true);

    try {
      // Note: In a real implementation, you would use a geocoding service API
      // This is a placeholder for demonstration purposes
      setTimeout(() => {
        // Dummy coordinates for demonstration
        const dummyLat = 40.7128;
        const dummyLng = -74.006;

        setValue("latitude", dummyLat);
        setValue("longitude", dummyLng);
        setLatitude(dummyLat);
        setLongitude(dummyLng);
        setMapSrc(
          `https://maps.google.com/maps?q=${encodeURIComponent(
            address
          )}&output=embed`
        );
        setAddressSearching(false);
      }, 1000);
    } catch (error) {
      console.error("Error geocoding address:", error);
      toast.error("Could not find location. Please try a different address.");
      setAddressSearching(false);
    }
  };

  const toggleAutoLocation = () => {
    setValue("autoLocation", !watchAutoLocation);
    setAutoLocation(!autoLocation);
    if (autoLocation) {
      // Switching to manual
      setValue("manualAddress", "");
      setManualAddress("");
    } else {
      // Switching to auto
      setValue("manualAddress", "");
      setManualAddress("");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    // Create form data to handle file uploads
    const formDataObj = new FormData();
    formDataObj.append("disasterType", data.disasterType);
    formDataObj.append("latitude", data.latitude);
    formDataObj.append("longitude", data.longitude);
    formDataObj.append("description", data.disasterDescription);
    formDataObj.append("fcm_token", fcmToken);

    // Append images with proper naming
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formDataObj.append(`image${index + 1}`, image);
      });
    }

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      if (localStorage.getItem("access_token")) {
        headers.Authorization = `Bearer ${localStorage.getItem(
          "access_token"
        )}`;
      }

      // Add upload progress tracking
      const response = await axios.post(
        `${API_URL}/register-disaster/`,
        formDataObj,
        {
          headers,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      console.log(response.data.detail);
      toast.success(response.data.detail);

      // Reset form after successful submission
      reset();
      setImages([]);
      setImagePreview([]);
      setUploadProgress(0);
    } catch (e) {
      console.error(
        "Error submitting disaster:",
        e.response?.data || e.message
      );
      toast.error(e.response?.data?.detail || "An error occurred");
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Toaster position="top-right" />
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Information */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-white">
                <h2 className="text-3xl font-bold mb-6">
                  Register <span className="text-yellow-300">Disaster</span>
                </h2>
                <div className="space-y-6">
                  <p className="text-white/90 leading-relaxed">
                    I am really glad to know that you are safe. Now, it's
                    important to notify the nearby users so that everyone can
                    take necessary precautions and stay out of danger.
                  </p>
                  <p className="text-white/90 leading-relaxed">
                    If you have experienced or witnessed a disaster, please
                    register it here to ensure that all nearby users are alerted
                    and can stay safe.
                  </p>
                </div>
                <div className="mt-8 flex justify-center">
                  {loading && (
                    <Skeleton
                      height={192} // same as h-48 (48 * 4 = 192px)
                      width={192} // same as w-48
                      baseColor="#00ab40"
                      highlightColor="#00ab4e"
                      className="rounded"
                    />
                  )}
                  <img
                    src="saveearth.png"
                    alt="Save Earth"
                    className={`w-48 h-48 object-contain transition-opacity duration-300 ${
                      loading ? "opacity-0 absolute" : "opacity-100"
                    }`}
                    onLoad={() => setLoading(false)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                <h1 className="text-2xl font-bold text-white">
                  Disaster Registration
                </h1>
                <p className="text-white/80">
                  User: {username || user || "Guest"}
                </p>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Disaster Type */}
                  <div className="space-y-2">
                    <label
                      htmlFor="disasterType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Disaster Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="disasterType"
                        className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base py-3 px-4 pr-8 appearance-none bg-white ${
                          errors.disasterType
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                        {...register("disasterType")}
                      >
                        <option value="" disabled>
                          Select disaster type
                        </option>
                        <option value="fire">Fire</option>
                        <option value="flood">Flood</option>
                        <option value="tornado">Tornado</option>
                        <option value="landslide">Landslide</option>
                        <option value="earthquake">Earthquake</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600">
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.disasterType && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.disasterType.message}
                      </p>
                    )}
                  </div>

                  {/* Disaster Description */}
                  <div className="space-y-2">
                    <label
                      htmlFor="disasterDescription"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Disaster Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="disasterDescription"
                      rows={4}
                      className={`block p-3 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base ${
                        errors.disasterDescription
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      placeholder="Please describe the disaster situation in detail..."
                      {...register("disasterDescription")}
                    ></textarea>
                    {errors.disasterDescription && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.disasterDescription.message}
                      </p>
                    )}
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Images (Optional)
                    </label>

                    <div className="flex flex-wrap gap-4">
                      {/* Image Previews */}
                      {imagePreview.map((src, index) => (
                        <div key={index} className="relative">
                          <div className="h-24 w-24 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={src || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                            aria-label="Remove image"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* Add More Button */}
                      {images.length < 4 && (
                        <label className="cursor-pointer">
                          <div className="h-24 w-24 border-2 border-dashed border-purple-400 rounded-lg flex flex-col items-center justify-center text-purple-500 hover:bg-purple-50 transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span className="text-xs mt-1">Add more</span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpg,image/jpeg,image/png"
                            multiple
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      You can upload up to 4 images (jpg, jpeg, png only).
                    </p>
                    {errors.images && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.images.message}
                      </p>
                    )}
                  </div>

                  {/* Location Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {watchAutoLocation ? "Auto" : "Manual"}
                        </span>
                        <Controller
                          name="autoLocation"
                          control={control}
                          render={({ field }) => (
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(!field.value);
                                toggleAutoLocation();
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                field.value ? "bg-purple-600" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  field.value
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        {watchAutoLocation ? (
                          <div className="relative">
                            <input
                              type="text"
                              id="location"
                              value={
                                latitude && longitude
                                  ? `${latitude}, ${longitude}`
                                  : ""
                              }
                              className={`block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base py-3 px-4 pr-10 ${
                                errors.latitude || errors.longitude
                                  ? "border-red-500"
                                  : ""
                              }`}
                              readOnly
                            />
                            {locationLoading ? (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg
                                  className="animate-spin h-5 w-5 text-gray-400"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </div>
                            ) : null}
                            {locationLoading && (
                              <p className="text-sm text-gray-500 mt-1">
                                Fetching your current location...
                              </p>
                            )}
                            {(errors.latitude || errors.longitude) &&
                              !locationLoading && (
                                <p className="mt-1 text-sm text-red-600">
                                  Location is required
                                </p>
                              )}
                          </div>
                        ) : (
                          <div>
                            <div className="flex">
                              <input
                                type="text"
                                id="manualAddress"
                                className={`block w-full rounded-l-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base py-3 px-4 ${
                                  errors.manualAddress ? "border-red-500" : ""
                                }`}
                                placeholder="Enter address or location"
                                {...register("manualAddress")}
                              />
                              <button
                                type="button"
                                onClick={searchAddress}
                                disabled={
                                  addressSearching ||
                                  !watch("manualAddress")?.trim()
                                }
                                className={`px-4 rounded-r-lg border border-l-0 ${
                                  addressSearching ||
                                  !watch("manualAddress")?.trim()
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-purple-600 text-white hover:bg-purple-700"
                                }`}
                              >
                                {addressSearching ? (
                                  <svg
                                    className="animate-spin h-5 w-5 text-white"
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
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
                                  "Search"
                                )}
                              </button>
                            </div>
                            {errors.manualAddress && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.manualAddress.message}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Enter a street address, city, or landmark
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg overflow-hidden border border-gray-200 h-40 shadow-md">
                        {mapSrc ? (
                          <iframe
                            className="w-full h-full"
                            src={mapSrc}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <p className="text-gray-500">
                              {watchAutoLocation
                                ? "Map loading..."
                                : "Enter address to see map"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress Bar */}
                  {loading && uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                      <p className="text-xs text-gray-500 text-right mt-1">
                        Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white 
                      ${
                        isSubmitting || (watchAutoLocation && locationLoading)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      }`}
                      disabled={
                        isSubmitting || (watchAutoLocation && locationLoading)
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </>
                      ) : watchAutoLocation && locationLoading ? (
                        "Fetching Location..."
                      ) : (
                        "Register Disaster"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DisasterRegister;
