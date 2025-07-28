"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { API_URL } from "../context/myurl"
import { useParams } from "react-router-dom"
import { AlertCircle, MapPin, ThumbsUp, User, Clock, Shield, Globe, Map, Info } from "lucide-react"
import Footer from "../components/Footer"
import Navigation from "../components/Navigation"

const DisasterDetail = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [disasterDetail, setDisasterDetail] = useState(null)
  const [mapSrc, setMapSrc] = useState(null)
  const destination = "Hetuda city College/Zenith, Piple Marg 5, Hetauda 44107"

  // Getting disaster_id from URL parameters
  const { disaster_id } = useParams()

  // Get gradient based on disaster type
  const getGradient = (type) => {
    const typeToGradient = {
      flood: "from-blue-600 to-blue-400",
      landslide: "from-yellow-800 to-yellow-600",
      earthquake: "from-orange-600 to-red-500",
      fire: "from-red-600 to-orange-500",
      default: "from-gray-700 to-gray-500",
    }

    return typeToGradient[type] || typeToGradient.default
  }
  console.log(disasterDetail)

  // Get disaster icon based on type
  const getDisasterIcon = (type) => {
    switch (type) {
      case "Flood":
        return "https://cdn-icons-png.flaticon.com/512/2839/2839022.png"
      case "Landslide":
        return "https://cdn-icons-png.flaticon.com/512/4380/4380458.png"
      case "Earthquake":
        return "https://cdn-icons-png.flaticon.com/512/2933/2933997.png"
      case "Fire":
        return "https://cdn-icons-png.flaticon.com/512/785/785116.png"
      default:
        return "https://cdn-icons-png.flaticon.com/512/1684/1684375.png"
    }
  }

  // Get disaster images from disasterDetail instead of hardcoded ones
  const getDisasterImages = () => {
    if (!disasterDetail) return []

    // Create an array of available images from disasterDetail
    const images = []
    if (disasterDetail.image1) images.push(disasterDetail.image1)
    if (disasterDetail.image2) images.push(disasterDetail.image2)
    if (disasterDetail.image3) images.push(disasterDetail.image3)
    if (disasterDetail.image4) images.push(disasterDetail.image4)

    // If no images are available, use fallback images based on disaster type
    if (images.length === 0) {
      const fallbackImages = {
        Earthquake: [
          "https://cdn.pixabay.com/photo/2016/11/14/04/36/earthquakes-1822835_1280.jpg",
          "https://cdn.pixabay.com/photo/2015/09/09/20/33/nepal-933226_1280.jpg",
          "https://cdn.pixabay.com/photo/2016/01/19/17/15/earthquake-1149894_1280.jpg",
          "https://cdn.pixabay.com/photo/2015/05/01/08/02/nepal-748717_1280.jpg",
        ],
        Flood: [
          "https://cdn.pixabay.com/photo/2018/08/23/07/35/thunderstorm-3625405_1280.jpg",
          "https://cdn.pixabay.com/photo/2020/02/08/14/36/flood-4830003_1280.jpg",
          "https://cdn.pixabay.com/photo/2018/02/13/22/09/water-3151662_1280.jpg",
          "https://cdn.pixabay.com/photo/2018/02/13/22/09/water-3151662_1280.jpg",
        ],
        Landslide: [
          "https://cdn.pixabay.com/photo/2018/02/15/21/55/geology-3156117_1280.jpg",
          "https://cdn.pixabay.com/photo/2019/03/16/19/24/landslide-4059346_1280.jpg",
          "https://cdn.pixabay.com/photo/2018/02/15/21/55/geology-3156117_1280.jpg",
          "https://cdn.pixabay.com/photo/2019/03/16/19/24/landslide-4059346_1280.jpg",
        ],
        Fire: [
          "https://cdn.pixabay.com/photo/2020/03/01/06/19/fire-4892434_1280.jpg",
          "https://cdn.pixabay.com/photo/2016/09/10/11/11/fire-1658488_1280.jpg",
          "https://cdn.pixabay.com/photo/2016/11/18/15/31/fire-1835426_1280.jpg",
          "https://cdn.pixabay.com/photo/2020/02/26/05/50/forest-fire-4881208_1280.jpg",
        ],
        default: [
          "https://cdn.pixabay.com/photo/2017/02/10/19/11/emergency-2056031_1280.jpg",
          "https://cdn.pixabay.com/photo/2017/06/24/23/03/railway-2439189_1280.jpg",
          "https://cdn.pixabay.com/photo/2017/07/25/01/22/cat-2536662_1280.jpg",
          "https://cdn.pixabay.com/photo/2016/11/14/04/36/earthquakes-1822835_1280.jpg",
        ],
      }

      return fallbackImages[disasterDetail.disasterType] || fallbackImages.default
    }

    // If we have fewer than 4 images, duplicate the last one to fill the grid
    while (images.length < 4) {
      images.push(images[images.length - 1] || "")
    }

    return images
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const accessToken = localStorage.getItem("access_token")

        if (!accessToken) {
          setError("User not authenticated")
          toast.error("User not authenticated")
          setLoading(false)
          return
        }

        const response = await axios.get(`${API_URL}/disaster-detail/${disaster_id}/`, {
          headers: {
            "Content-Type": "text/json",
          },
        })
        console.log(response.data)
        setDisasterDetail(response.data)
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentLatitude = position.coords.latitude;
              const currentLongitude = position.coords.longitude;
              setMapSrc(
                `https://maps.google.com/maps?saddr=${currentLatitude},${currentLongitude}&daddr=${response.data.latitude},${response.data.longitude}&output=embed`,
              );
            },
            (error) => {
              console.error("Error fetching current location:", error);
              toast.error("Unable to fetch current location");
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
          toast.error("Geolocation is not supported by this browser.");
        }
      } catch (e) {
        console.log("Something went wrong!", e)
        setError("Error in Fetching Disaster Detail")
        toast.error("Error in Fetching Disaster Detail")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Skeleton loader for loading state
  const DisasterSkeleton = () => (
    <div className="max-w-4xl mx-auto p-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
          <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
        </div>
      </div>
      <div className="h-80 bg-gray-200 rounded-lg mb-8"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  )

  // Error display component
  const ErrorDisplay = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
        <AlertCircle className="text-red-500 mr-4 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Disaster Information</h3>
          <p className="text-red-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )

  // Image component with fallback
  const DisasterImage = ({ src, alt, index }) => {
    const [imgError, setImgError] = useState(false)

    return imgError ? (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center h-48">
        <div className="text-center p-4">
          <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Image {index + 1} unavailable</p>
        </div>
      </div>
    ) : (
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300 rounded-lg"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <>
      <Navigation />
      <div className="bg-gray-50 min-h-screen pb-12">
        <Toaster position="top-right" />

        {loading ? (
          <DisasterSkeleton />
        ) : error ? (
          <ErrorDisplay />
        ) : disasterDetail ? (
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header Section with dynamic gradient based on disaster type */}
            <div
              className={`bg-gradient-to-r ${getGradient(
                disasterDetail.disasterType,
              )} rounded-xl p-6 mb-8 text-white shadow-lg`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center">
                  <img
                    src={getDisasterIcon(disasterDetail.disasterType) || "/placeholder.svg" || "/placeholder.svg"}
                    alt={disasterDetail.disasterType}
                    className="w-12 h-12 mr-4 bg-white p-2 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = "none"
                    }}
                  />
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{disasterDetail.disasterType} Alert</h1>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-white/80 text-sm">{formatDate(disasterDetail.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-4 md:mt-0 bg-white/20 px-4 py-2 rounded-full">
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{disasterDetail.upvotes} Upvotes</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Disaster Information</h2>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="w-5 h-5 mr-3 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Reported by</p>
                        <p className="font-medium text-gray-800">{disasterDetail.triggeredBy}</p>
                      </div>
                    </div>

                    {disasterDetail.handled_by && (
                      <div className="flex items-start">
                        <Shield className="w-5 h-5 mr-3 text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Handled by</p>
                          <p className="font-medium text-gray-800">{disasterDetail.handled_by}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Location Coordinates</p>
                        <p className="font-medium text-gray-800">
                          {disasterDetail.latitude}, {disasterDetail.longitude}
                        </p>
                      </div>
                    </div>

                    {(disasterDetail.country || disasterDetail.continent) && (
                      <div className="flex items-start">
                        <Globe className="w-5 h-5 mr-3 text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Region</p>
                          <p className="font-medium text-gray-800">
                            {disasterDetail.country && disasterDetail.continent
                              ? `${disasterDetail.country}, ${disasterDetail.continent}`
                              : disasterDetail.country || disasterDetail.continent}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-gray-500 text-sm mb-1">Description</h3>
                      <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-100 text-wrap">
                        {disasterDetail.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="p-4 bg-gray-50 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Location & Route</h2>
                    <p className="text-sm text-gray-500">Route from disaster location to emergency center</p>
                  </div>
                  <div className="h-[400px] w-full">
                    {mapSrc ? (
                      <iframe
                        className="w-full h-full border-0"
                        src={mapSrc}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <Map className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">Map loading failed</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Disaster Images</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {getDisasterImages().map((img, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <DisasterImage
                          src={img}
                          alt={`${disasterDetail.disasterType} image ${index + 1}`}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Information Card */}
                <div className="bg-white rounded-xl p-6 shadow-md mt-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Emergency Contacts</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Emergency Hotline</span>
                      <span className="text-red-600 font-bold">911</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Disaster Management</span>
                      <span className="text-blue-600 font-bold">108</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Medical Emergency</span>
                      <span className="text-green-600 font-bold">102</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-6 py-3 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Report Emergency
              </button>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors">
                Share Information
              </button>
              <button className="px-6 py-3 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition-colors">
                Volunteer Help
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-700">No Disaster Details Available</h2>
            <p className="text-gray-500 mt-2">The requested disaster information could not be found.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default DisasterDetail
