import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import HeroMoving from "../components/Index/HeroMoving";
import ScrollCards from "../components/Index/ScrollCards";
import GeneralCards2 from "../components/GeneralCards2";
import ModernHero from "../components/ModernHero";

const Home = () => {
  return (
    <>
      <Navigation />
      <div>
        <ModernHero />
        <HeroMoving />
        <ScrollCards />
        <GeneralCards2 />
      </div>
      <Footer />
    </>
  );
};

export default Home;
