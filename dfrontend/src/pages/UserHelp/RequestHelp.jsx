"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Upload,
  X,
  Loader2,
  MapPinOff,
  Check,
  ArrowLeft,
} from "lucide-react";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import axios from "axios";
import { API_URL } from "../../context/myurl";
import toast, { Toaster } from "react-hot-toast";

// for validations
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { disasterFormSchema } from "../../validations/helpRequestSchema";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function RequestHelp() {
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualLocation, setManualLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(disasterFormSchema),
    defaultValues: {
      requester_name: "",
      help_type: "Food",
      latitude: 0,
      longitude: 0,
      images: [],
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  const getLocation = () => {
    setIsLocating(true);
    setLocationError("");
    setLocationSuccess(false);

    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by your browser";
      setLocationError(errorMsg);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude);
        setValue("longitude", position.coords.longitude);
        setIsLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 2000);
      },
      (error) => {
        const errorMsg = `Unable to retrieve your location: ${error.message}`;
        setLocationError(errorMsg);
        setIsLocating(false);
      }
    );
  };

  const validateImageFile = (file) => {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error(`${file.name}: Only PNG, JPG, and JPEG images are allowed`);
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`${file.name}: Image must be below 5MB`);
      return false;
    }

    return true;
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = [];

      // Validate each file
      for (const file of newFiles) {
        if (validateImageFile(file)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      // Check total image limit
      const totalImages = [...images, ...validFiles];
      if (totalImages.length > 4) {
        return;
      }

      setImages(totalImages);
      setValue("images", totalImages);

      // Create URLs for preview
      const newUrls = validFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    setValue("images", updatedImages);

    const updatedUrls = [...imageUrls];
    URL.revokeObjectURL(updatedUrls[index]);
    updatedUrls.splice(index, 1);
    setImageUrls(updatedUrls);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("requester_name", data.requester_name);
      submitFormData.append("help_type", data.help_type);
      submitFormData.append("latitude", data.latitude.toString());
      submitFormData.append("longitude", data.longitude.toString());

      if (images.length > 0) {
        images.forEach((image) => {
          submitFormData.append("images", image);
        });
      }

      // API CALL
      console.log(submitFormData);
      try {
        const response = await axios.post(
          `${API_URL}/helprequests/`,
          submitFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Response from server:", response.data);

        toast.success("Help request submitted successfully!");

        // Reset form
        reset();
        setImages([]);
        setImageUrls([]);
        setManualLocation(false);
      } catch (error) {
        console.error(
          "Error uploading images:",
          error.response?.data || error.message
        );
        toast.error("Error uploading images. Please try again.");
        return;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        "There was a problem submitting your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up image URLs when component unmounts
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Navigation />
      <div className="min-h-screen bg-[url(/purplethreads.png)] bg-no-repeat bg-center py-10 px-4">
        <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          {/* Left side - Image and tagline */}
          <div className="w-full md:w-5/12 relative bg-gradient-to-br  text-white">
            <div className="absolute top-4 left-4 z-10 text-indigo-900">
              <h3 className="text-2xl font-bold">Request For Help</h3>
            </div>

            <div className="absolute top-4 right-4 z-10 text-indigo-900">
              <button className="flex items-center text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Home
              </button>
            </div>

            <div className="h-full flex flex-col justify-end p-8 pb-16">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Save Earth,</h2>
                <h2 className="text-3xl font-bold">Secure Earth</h2>

                <div className="flex mt-8 space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white/30"></div>
                  <div className="w-2 h-2 rounded-full bg-white/30"></div>
                  <div className="w-8 h-2 rounded-full bg-white"></div>
                </div>
              </div>
            </div>

            {/* Background image with overlay */}
            <div className="absolute inset-0 z-0">
              {loading && (
                <Skeleton
                  height="100%" // same as h-48 (48 * 4 = 192px)
                  width="100%" // same as w-48
                  className="rounded"
                />
              )}
              <img
                src="https://images.unsplash.com/photo-1678052812569-7fea895cac74?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGJlYXV0aWZ1bCUyMGxhbmRzY2FwZXxlbnwwfDF8MHx8fDA%3D"
                alt="Desert landscape"
                className={`object-cover w-full h-full ${
                  loading ? "opacity-0 absolute" : "opacity-100"
                }`}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full md:w-7/12 p-8 md:p-12 bg-white">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Request Help
              </h1>
              <p className="text-gray-500 mb-8">
                Fill out this form to request assistance. We'll review your
                request as soon as possible.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="requester_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Name
                  </label>
                  <Controller
                    name="requester_name"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        id="requester_name"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                          errors.requester_name
                            ? "border-red-300 bg-red-50"
                            : field.value && field.value.length >= 7
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your full name (2-3 words, min 7 characters)"
                      />
                    )}
                  />
                  {errors.requester_name && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.requester_name.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Name must be 2-3 words and at least 7 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700">
                    Type of Help Needed
                  </span>
                  <Controller
                    name="help_type"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-3">
                        {["Money", "Food", "Both"].map((type) => (
                          <label
                            key={type}
                            className={`flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                              field.value === type
                                ? "bg-purple-100 border-purple-500 text-purple-800 font-medium shadow-sm"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              value={type}
                              checked={field.value === type}
                              onChange={() => field.onChange(type)}
                              className="sr-only"
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.help_type && (
                    <p className="text-sm text-red-600">
                      {errors.help_type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700">
                    Upload Images (Optional)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative rounded-lg overflow-hidden h-24 bg-gray-100 border border-gray-200"
                      >
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Uploaded image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {images.length < 4 && (
                      <div className="border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center h-24 bg-purple-50 transition-colors duration-200 hover:bg-purple-100">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center p-4"
                        >
                          <Upload className="h-6 w-6 text-purple-500" />
                          <span className="mt-2 text-xs text-purple-600 font-medium">
                            {images.length === 0 ? "Upload images" : "Add more"}
                          </span>
                          <input
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/png,image/jpg,image/jpeg"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.images && (
                    <p className="text-sm text-red-600">
                      {errors.images.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Upload up to 4 images (PNG, JPG, JPEG only, max 5MB each)
                  </p>
                </div>

                <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="block text-sm font-medium text-gray-700">
                      Your Location
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setManualLocation(false)}
                        className={`px-3 py-1 text-xs rounded-l-md ${
                          !manualLocation
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Automatic
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualLocation(true)}
                        className={`px-3 py-1 text-xs rounded-r-md ${
                          manualLocation
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Manual
                      </button>
                    </div>
                  </div>

                  {!manualLocation ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={getLocation}
                        disabled={isLocating}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:bg-purple-400"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Getting your location...
                          </>
                        ) : (
                          <>
                            <MapPin className="mr-2 h-4 w-4" />
                            {watchedValues.latitude !== 0
                              ? "Update Location"
                              : "Get My Location"}
                          </>
                        )}
                      </button>
                      {watchedValues.latitude !== 0 &&
                        watchedValues.longitude !== 0 && (
                          <div
                            className={`flex items-center text-green-600 text-sm ${
                              locationSuccess ? "animate-pulse" : ""
                            }`}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Location: {watchedValues.latitude.toFixed(4)},{" "}
                            {watchedValues.longitude.toFixed(4)}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="latitude"
                          className="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Latitude
                        </label>
                        <Controller
                          name="latitude"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              step="any"
                              id="latitude"
                              placeholder="e.g. 40.7128"
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                errors.latitude
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="longitude"
                          className="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Longitude
                        </label>
                        <Controller
                          name="longitude"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              step="any"
                              id="longitude"
                              placeholder="e.g. -74.0060"
                              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                errors.longitude
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {locationError && (
                    <p className="text-sm text-red-600 flex items-center">
                      <MapPinOff className="h-4 w-4 mr-1" />
                      {locationError}
                    </p>
                  )}
                  {(errors.latitude || errors.longitude) && (
                    <p className="text-sm text-red-600">
                      Please provide your location
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    We need your location to connect you with nearby help
                    resources.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid || !isDirty}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                      isValid && isDirty
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Help Request"
                    )}
                  </button>
                  {(!isValid || !isDirty) && (
                    <p className="mt-2 text-xs text-center text-red-500">
                      Please fill in all required fields correctly
                    </p>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <a
                      href="#"
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Log in
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
