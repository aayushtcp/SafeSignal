import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const cards = [
  {
    id: 1,
    title: "Mountain Adventure",
    description: "Explore the highest peaks and breathtaking views.",
    image: "https://source.unsplash.com/400x300/?mountain",
    bgColor: "bg-blue-500",
  },
  {
    id: 2,
    title: "Ocean Waves",
    description: "Feel the calm and power of the ocean.",
    image: "https://source.unsplash.com/400x300/?ocean",
    bgColor: "bg-green-500",
  },
  {
    id: 3,
    title: "Forest Escape",
    description: "Immerse yourself in the tranquility of the forest.",
    image: "https://source.unsplash.com/400x300/?forest",
    bgColor: "bg-red-500",
  },
  {
    id: 4,
    title: "City Lights",
    description: "Experience the vibrant nightlife of modern cities.",
    image: "https://source.unsplash.com/400x300/?city",
    bgColor: "bg-yellow-500",
  },
];

const ScrollCards2 = () => {
  const { scrollYProgress } = useScroll();

  return (
    <div className="relative flex flex-col items-center overflow-hidden min-h-[300vh] bg-gray-100">
      <div className="sticky top-0 h-screen flex items-center justify-center">
        {cards.map((card, index) => {
          const yOffset = useTransform(scrollYProgress, [0, 1], [index * 50, 0]);

          return (
            <motion.div
              key={card.id}
              className={`absolute w-[80vw] md:w-[60vw] h-64 rounded-2xl shadow-lg flex items-center overflow-hidden ${card.bgColor} text-white`}
              style={{ y: yOffset }}
            >
              {/* Left Side - Text */}
              <div className="w-1/2 p-6">
                <h2 className="text-2xl font-bold">{card.title}</h2>
                <p className="mt-2 text-lg">{card.description}</p>
              </div>

              {/* Right Side - Image */}
              <div className="w-1/2">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollCards2;
