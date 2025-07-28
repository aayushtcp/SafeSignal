import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = [
  "https://images.unsplash.com/photo-1638890809947-673d33ac18d4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zmxvb2R8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1605555649847-b19b05bd048f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGh1cnJpY2FuZXxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/photo-1519373533972-d0fc32881b46?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];
const HelpDetailCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };
  return (
    <>
      <div className="h-[60vh] bg-sate-100 mx-5 lg:mx-15 my-5 p-2 rounded-xl flex justify-center items-center mb-10">
        <div className="w-full h-full relative">
          <Slider {...settings}>
            {images.map((img, index) => (
              <div key={index} className="h-[60vh]">
                <img
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </>
  );
};

export default HelpDetailCarousel;
