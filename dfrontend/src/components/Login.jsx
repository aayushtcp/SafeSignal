"use client"

import { useState, useEffect } from "react"
import { FaUser, FaLock } from "react-icons/fa"
import axios from "axios"
import { generateToken } from "../firebase"
import { API_URL, API_URL_USER } from "../context/myurl"

// for validations
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { loginSchema } from "../validations/loginSchema"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [fcmToken, setFcmToken] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  // Using useForm for form validation
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      fcmToken: "",
      device: "web",
    },
    mode: "onSubmit", // Changed from "onChange" to reduce validation frequency
  })

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      window.location.href = "/"
    }
  }, [])

  // Fetching FCM token on mount
  useEffect(() => {
    const fetchFcmToken = async () => {
      try {
        const token = await generateToken()
        setFcmToken(token)
        setValue("fcmToken", token || "")
      } catch (error) {
        console.warn("FCM token generation failed:", error)
        // Continue without FCM token
      }
    }
    fetchFcmToken()
  }, [setValue])

  const onSubmit = async (data) => {
    setIsLoading(true)
    setLoginError("")

    const user = {
      username: data.username,
      password: data.password,
    }

    try {
      const response = await axios.post(`${API_URL_USER}/token/`, user, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })

      localStorage.clear()
      localStorage.setItem("access_token", response.data.access)
      localStorage.setItem("refresh_token", response.data.refresh)

      const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000
      localStorage.setItem("refresh_token_expiry", expiryTime)

      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`

      // FCM token registration with error handling
      if (fcmToken) {
        try {
          await axios.post(
            `${API_URL}/register-fcm-token/`,
            { fcmToken, device: data.device },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            },
          )
        } catch (fcmError) {
          console.warn("FCM token registration failed:", fcmError)
          // Continue with login even if FCM registration fails
        }
      }

      window.location.href = "/"
    } catch (error) {
      setIsLoading(false)
      console.error("Login failed:", error)

      if (error.response?.status === 401) {
        setLoginError("Invalid username or password")
      } else if (error.response?.status >= 500) {
        setLoginError("Server error. Please try again later.")
      } else {
        const errorMsg = error.response.data.detail || error.response.data.non_field_errors?.[0] || JSON.stringify(error.response.data);
        setLoginError(errorMsg || "An unexpected error occurred");
      }
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[url(/testbg2.jpg)] bg-cover bg-no-repeat bg-top p-4">
      <div className="bg-white w-full max-w-4xl shadow-lg rounded-2xl flex overflow-hidden">
        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10 bg-[url(/testbg2.jpg)] bg-cover bg-no-repeat text-black bg-gradient-to-br from-blue-700 to-blue-900">
          <h2 className="text-4xl font-bold">WELCOME</h2>
          <p className="mt-3 text-center text-white text-sm opacity-90">
            SafeSignal Instant Alert! Stay connected and receive real-time updates.
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8">
          <h3 className="text-3xl font-bold text-gray-800">Sign in</h3>
          <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue.</p>

          {isLoading ? (
            <div className="mt-6 space-y-4">
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={20} width={120} />
              <Skeleton height={40} />
              <Skeleton height={20} width={200} />
              <Skeleton height={40} />
            </div>
          ) : (
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
                      placeholder="User Name"
                    />
                  )}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
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
                    />
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-sm text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox text-blue-600" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={`w-full font-semibold py-2 rounded-lg transition-all ${
                  isValid && !isLoading
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              {/* Separator */}
              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <span className="px-3 text-gray-500">Or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              {/* Alternate Sign-In Button */}
              {/* <button
                type="button"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg border transition-all"
              >
                Sign in with other
              </button> */}

              {/* Sign Up Link */}
              <p className="text-sm text-center text-gray-600 mt-2">
                Don't have an account?{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                  Sign Up
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default Login
