import { useContext, useState, useEffect } from "react";
import { useUsername } from "../context/UsernameContext";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Hero from "../components/Index/Hero";
import HeroMoving from "../components/Index/HeroMoving";
import ScrollCards from "../components/Index/ScrollCards";
import ScrollCards2 from "../components/Index/ScrollCards2";
import GeneralCards2 from "../components/GeneralCards2";
import ModernHero from "../components/ModernHero";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaS } from "react-icons/fa6";

const Home = () => {
  const { username } = useUsername();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (username) {
      setMessage("Welcome to django rest jwt");
    }
  }, [username]);

  let baseImage = "https://firefox-settings-attachments.cdn.mozilla.net/main-workspace/newtab-wallpapers-v2/7fd1f326-58cf-4b5c-9737-e68a8c44dc51.avif";

  useEffect(() => {
    setLoading(true);
    const img = new window.Image();
    img.src = baseImage;
    img.onload = () => {
      setLoading(false);
    };
    img.onerror = () => {
      setLoading(false);
    };
  }, [baseImage]);

  return (
    <>
      <Navigation />
      <div className="text-center">
        <>
          {/* <Hero /> */}
          {/* {loading ? (
            <Skeleton width="90vw" height={60} />
          ) : (
            <div
              className="p-4 m-4 h-[13rem] flex items-center justify-center"
              style={{
                backgroundImage: `url(${baseImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          )} */}

          <ModernHero />
          <HeroMoving />
          <ScrollCards />
          <GeneralCards2 />
        </>
      </div>
      <Footer />
    </>
  );
};

export default Home;
