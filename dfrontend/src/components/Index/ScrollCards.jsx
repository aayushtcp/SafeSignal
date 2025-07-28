'use client';
import { useTransform, motion, useScroll } from 'framer-motion';
import { useRef } from 'react';

const projects = [
  {
    title: 'Fire Safety',
    description:
      'Learn how to prevent and respond to fire emergencies with essential safety tips and guidelines.',
    src: 'rock.jpg',
    link: 'https://images.unsplash.com/photo-1605106702842-01a887a31122?q=80&w=500&auto=format&fit=crop',
    color: '#5196fd',
  },
  {
    title: 'Landslide Preparation',
    description:
      'Understand the risks of landslides and how to prepare effectively to minimize damage and ensure safety.',
    src: 'tree.jpg',
    link: 'https://images.unsplash.com/photo-1605106250963-ffda6d2a4b32?w=500&auto=format&fit=crop&q=60',
    color: '#8f89ff',
  },
  {
    title: 'Safe from Earthquake',
    description:
      'Discover practical steps to protect yourself and your property during an earthquake.',
    src: 'water.jpg',
    link: 'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=500&auto=format&fit=crop',
    color: '#13006c',
  },
  {
    title: 'Flood Safety',
    description:
      'Get informed about flood preparedness and how to stay safe during and after flooding events.',
    src: 'house.jpg',
    link: 'https://images.unsplash.com/photo-1605106715994-18d3fecffb98?w=500&auto=format&fit=crop&q=60',
    color: '#ed649e',
  },
  {
    title: 'Tornado Safety',
    description:
      'Learn the best practices to stay safe and protect your home during a tornado.',
    src: 'cactus.jpg',
    link: 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=500&auto=format&fit=crop',
    color: '#fd521a',
  },
];

export default function ScrollCards() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <main className="bg-black" ref={container}>
      <section className="text-white h-[70vh] w-full bg-slate-950 grid place-content-center ">
        <h1 className="2xl:text-7xl text-5xl px-8 font-semibold text-center tracking-tight leading-[120%]">
          Some Safety<br /> Recommendations (●'◡'●)
        </h1>
      </section>

      <section className="text-white w-full bg-slate-950">
        {projects.map((project, i) => {
          const targetScale = 1 - (projects.length - i) * 0.05;
          return (
            <Card
              key={`p_${i}`}
              i={i}
              url={project?.link}
              src={project?.src}
              title={project?.title}
              color={project?.color}
              description={project?.description}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </section>

    </main>
  );
}

export const Card = ({
  i,
  title,
  description,
  src,
  url,
  color,
  progress,
  range,
  targetScale,
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div ref={container} className="h-screen flex items-center justify-center sticky top-0">
      <motion.div
        style={{ backgroundColor: color, scale, top: `calc(-5vh + ${i * 25}px)` }}
        className="flex flex-col relative -top-[25%] h-[450px] w-[90%] lg:w-[70%] rounded-md p-10 origin-top"
      >
        <h2 className="text-2xl text-center font-semibold">{title}</h2>
        <div className="flex h-full mt-5 gap-10">
          <div className="w-[70%] lg:w-[40%] flex flex-col justify-center pb-10">
            <p className="text-md lg:text-justify text-start ">{description}</p>
            <p className="text-md lg:text-justify text-start mt-4">
              This section provides detailed insights and actionable steps to ensure your safety and preparedness. Explore the best practices and expert advice tailored to help you navigate through challenging situations effectively.
            </p>
          </div>
          <div className="relative w-[30%] lg:w-[60%] h-full flex items-center rounded-lg overflow-hidden">
            <motion.div className="w-full h-[50%] lg:h-[90%]" style={{ scale: imageScale }}>
              <img src={url} alt={title} className="object-cover w-full h-full" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
