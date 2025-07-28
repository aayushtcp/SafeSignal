import React, { useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";
import { useParams } from "react-router-dom";
import { API_URL } from "../../context/myurl";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  UserDetailsProvider,
  useUserDetails,
} from "../../context/UserDetailsContext";

const HelpRequestDetail = () => {
  const [helpRequest, setHelpRequest] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { help_id } = useParams();
  const { userDetails } = useUserDetails();
  const [userType, setUserType] = useState("Normal");
  const [userDetailsFetched, setUserDetailsFetched] = useState([]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  useEffect(() => {
    if (userDetails) {
      setUserDetailsFetched(userDetails);
      if (userDetails.user_type == "Organization") {
        setUserType(userDetails.user_type);
      }
    }
    const fetchHelpRequestDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/helprequests/${help_id}`);
        const data = response.data;
        setHelpRequest(data);

        const imgList = [
          data.image1,
          data.image2,
          data.image3,
          data.image4,
        ].filter(Boolean);
        setImages(imgList);
      } catch (error) {
        console.error("Error fetching help request details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequestDetails();
  }, [help_id, userDetails]);

  return (
    <>
      <Navigation />

      {/* Top section with background image */}
      <div
        className="w-full bg-contain bg-center bg-fixed py-10"
        style={{ backgroundImage: "url('/mathpattern.png')" }}
      >
        {!loading && images.length > 0 && (
          <div className="w-[95%] sm:w-[90%] mx-auto rounded-xl overflow-hidden shadow-xl">
            <Slider {...settings}>
              {images.map((img, index) => (
                <div key={index} className="relative h-[50vh] sm:h-[60vh]">
                  <img
                    src={img}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-4 rounded-b-xl">
                    <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base">
                      <div>
                        <p>
                          <strong>Requester:</strong>{" "}
                          {helpRequest.requester_name}
                        </p>
                        <p>
                          <strong>Location:</strong>{" "}
                          {helpRequest.location || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Help Type:</strong> {helpRequest.help_type}
                        </p>
                        <p>
                          <strong>Date:</strong> {helpRequest.verification_date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>

      {/* Info Section (no background) */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 w-[95%] sm:w-[90%] mx-auto mt-10 bg-white/60 rounded-2xl shadow-lg backdrop-blur-md p-6">
        {/* Details */}
        <div className="w-full lg:w-1/2 space-y-5">
          <h2 className="text-xl font-bold text-purple-700 border-b-2 pb-1 border-purple-300">
            Request Information
          </h2>
          <ul className="space-y-3 text-sm sm:text-base">
            <li className="p-3 rounded-md bg-slate-100 shadow-inner">
              <strong>Status:</strong>{" "}
              {helpRequest.approve ? "Approved" : "Pending"}
            </li>
            <li className="p-3 rounded-md bg-slate-100 shadow-inner">
              <strong>Approved By:</strong>{" "}
              {helpRequest.verified_by || "Not Verified"}
            </li>
            <li className="p-3 rounded-md bg-slate-100 shadow-inner">
              <strong>Claimed By:</strong>{" "}
              {helpRequest.claimed_by ||
                "Unclaimed {Note: Only Organization can Claim}"}
            </li>
            {userType === "Organization" && !helpRequest.claimed_by && (
              <li>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition"
                  onClick={async () => {
                    try {
                        await axios.patch(
                        `${API_URL}/helprequest/${help_id}/claim/`,
                        {
                          org_id: userDetailsFetched.id,
                        }
                        );
                        // Optionally, refetch help request details or update state
                        setHelpRequest((prev) => ({
                        ...prev,
                        claimed_by: userDetailsFetched.name || "Your Organization",
                        }));
                    } catch (error) {
                      alert("Failed to claim request.");
                    }
                  }}
                >
                  Claim This Request
                </button>
              </li>
            )}
          </ul>
        </div>
        {/* Thumbnails */}
        <div className="w-full lg:w-1/2 space-y-3">
          <h2 className="text-xl font-bold text-purple-700 border-b-2 pb-1 border-purple-300">
            Additional Images
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="h-[120px] sm:h-[150px] bg-slate-200 bg-center bg-cover rounded-xl shadow-md"
                style={{ backgroundImage: `url(${img})` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default HelpRequestDetail;
