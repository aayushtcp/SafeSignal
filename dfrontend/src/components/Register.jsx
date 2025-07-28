"use client"

import { useState, useEffect } from "react"
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa"
import axios from "axios"
import { generateToken } from "../firebase"
import { API_URL_USER } from "../context/myurl"

import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { signupFormSchema } from "../validations/signupFormSchema"

const Register = () => {
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [fcmToken, setFcmToken] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
    window.location.href = "/"
    return null 
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm({
    resolver: yupResolver(signupFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "", 
      user_type: "", 
    },
    mode: "onChange", 
  })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Failed to fetch location. Please enable location services.")
        },
      )
    } else {
      setError("Geolocation is not supported by your browser.")
    }

    const fetchFcmToken = async () => {
      try {
        const token = await generateToken()
        setFcmToken(token)
      } catch (err) {
        console.error("Error fetching FCM token:", err)
      }
    }

    fetchFcmToken()
  }, [])

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data) // Debug log
    setLoading(true)
    setError("")

    try {
      const token = await generateToken()
      const user = {
        username: data.username,
        email: data.email,
        password: data.password,
        user_type: data.user_type,
        latitude: latitude,
        longitude: longitude,
        fcm_token: token,
        device: "web",
      }

      console.log("Sending registration data:", user) // Debug log

      const response = await axios.post(`${API_URL_USER}/register/`, user, {
        headers: { "Content-Type": "application/json" },
      })

      if (response.status === 201) {
        // Keep loading state while backend processes confirmation
        setTimeout(() => {
          window.location.href = "/login"
        }, 1000)
      } else {
        setError("Registration failed. Please try again.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error Registering:", error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.response?.data?.errors) {
        // Handle field-specific errors from backend
        const backendErrors = error.response.data.errors
        Object.keys(backendErrors).forEach((field) => {
          setFormError(field, {
            type: "server",
            message: backendErrors[field][0],
          })
        })
      } else {
        setError("An error occurred. Please try again later.")
      }
      setLoading(false)
    }
  }

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Creating Your Account</h3>
        <p className="text-gray-600">Please wait while we process your registration...</p>
      </div>
    </div>
  )

  return (
    <>
      {loading && <LoadingOverlay />}
      <section className="flex min-h-screen items-center justify-center bg-[url(/signupbg.jpg)] bg-cover bg-no-repeat bg-top p-4">
        <div className="bg-white w-full max-w-4xl shadow-lg rounded-2xl flex overflow-hidden">
          {/* Left Side - Registration Form */}
          <div className="w-full md:w-1/2 p-8">
            <h3 className="text-3xl font-bold text-gray-800">Sign Up</h3>
            <p className="text-gray-500 text-sm mt-1">Create your account to continue.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Username Field */}
              <div className="relative">
                <FaUser className="absolute left-3 top-3.5 text-gray-500" />
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 ${
                        errors.username ? "border-red-500" : "border-gray-300"
                      }`}
                      type="text"
                      placeholder="Username"
                      disabled={loading}
                    />
                  )}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
              </div>

              {/* Email Field */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-500" />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      type="email"
                      placeholder="Email"
                      disabled={loading}
                    />
                  )}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* User Type Field */}
              <div className="relative">
                <Controller
                  name="user_type"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 ${
                        errors.user_type ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={loading}
                    >
                      <option value="">Select User Type</option>
                      <option value="Normal">Normal</option>
                      <option value="Organization">Organization</option>
                    </select>
                  )}
                />
                {errors.user_type && <p className="text-red-500 text-xs mt-1">{errors.user_type.message}</p>}
              </div>

              {/* Password Field */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-500" />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      disabled={loading}
                    />
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-sm text-blue-600 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-500" />
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      disabled={loading}
                    />
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-sm text-blue-600 disabled:opacity-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? "HIDE" : "SHOW"}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>
              )}

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !latitude || !longitude}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>

              {/* Separator */}
              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <span className="px-3 text-gray-500">Or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              {/* Alternate Sign-Up Button */}
              {/* <button
                type="button"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg border transition-all disabled:opacity-50"
                disabled={loading}
              >
                Sign up with other
              </button> */}

              {/* Sign In Link  */}
                      <p className="text-sm text-center text-gray-600 mt-2">
                      Already have an account?{" "}
                      <a href="/login" className="text-blue-600 hover:underline">
                        Sign In
                      </a>
                      </p>
                    </form>
                    {/* Show latitude and longitude */}
                    <div className="mt-4 text-xs text-gray-500">
                      <p>Latitude: {latitude !== null ? latitude : "Fetching..."}</p>
                      <p>Longitude: {longitude !== null ? longitude : "Fetching..."}</p>
                    </div>
                    </div>

                    {/* Right Side */}
          <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10 bg-[url(/signupbg.jpg)] bg-cover bg-no-repeat text-black bg-gradient-to-br from-blue-700 to-blue-900">
            <h2 className="text-4xl font-bold text-white">WELCOME</h2>
            <p className="mt-3 text-center text-white text-sm opacity-90">
              SafeSignal Instant Alert! Stay connected and receive real-time updates.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Register
