"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Bell,
  MapPin,
  Vote,
  Code,
  Shield,
  AlertTriangle,
  Users,
  Zap,
  Globe,
  ArrowRight,
  Smartphone,
  Database,
  Heart,
} from "lucide-react"
import Footer from "../components/Footer"
import Navigation from "../components/Navigation"
import Team from "./Team"

const About = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Real-time alerts for natural disasters",
      description:
        "Get instant notifications about earthquakes, floods, wildfires, and other natural disasters as they happen in your area.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Location-based push notifications",
      description:
        "Receive precise alerts relevant to your exact location, ensuring you only get information that directly affects you.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: <Vote className="w-8 h-8" />,
      title: "User-driven verification system",
      description:
        "Community voting helps verify incident reports, reducing false alarms and ensuring information accuracy.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Built with React, Django, and Flutter",
      description: "Modern tech stack ensures seamless performance across web and mobile platforms for the future.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enhancing community safety & response",
      description:
        "Empowering communities with timely information to prepare, respond, and recover from disasters effectively.",
      color: "from-orange-500 to-amber-500",
    },
  ]

  const techStack = [
    { name: "React", icon: <Code className="w-6 h-6" />, description: "Frontend web interface" },
    { name: "Django", icon: <Database className="w-6 h-6" />, description: "Backend API & data management" },
    { name: "Flutter", icon: <Smartphone className="w-6 h-6" />, description: "Cross-platform mobile app" },
  ]

  return (
      <div className="min-h-screen bg-white">
        <Navigation/>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br bg-white text-black">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-8 shadow-2xl"
            >
              <Bell className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                SafeSignal
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              A smart disaster alert system designed to provide real-time, location-based alerts during natural
              disasters
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                🌍 Real-time Alerts
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                📍 Location-based
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                🗳️ Community Verified
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                🚑 Life Saving
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register-disaster"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full font-semibold text-white hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Report Disaster
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center justify-center px-8 py-4 bg-green-500 backdrop-blur-sm border border-white/30 rounded-full font-semibold text-white hover:bg-green-600 transition-all duration-300"
              >
                Watch Demo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-12">
            SafeSignal enhances disaster response and helps protect lives by ensuring timely and accurate updates. We
            believe that when every second counts, having the right information at the right time can make the
            difference between safety and danger.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Lives</h3>
              <p className="text-gray-600">Every alert sent has the potential to save lives and protect communities</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unite Communities</h3>
              <p className="text-gray-600">Bringing people together to verify information and support each other</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Act Fast</h3>
              <p className="text-gray-600">Delivering real-time alerts when every second matters most</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SafeSignal combines cutting-edge technology with community-driven verification to deliver the most
              reliable disaster alert system available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                ></div>

                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6 text-white shadow-lg`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      <Team/>

      {/* Technology Stack */}
      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 bg-gray-900 text-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for the Future</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              SafeSignal leverages modern technologies to ensure reliability, scalability, and performance across all
              platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700 hover:border-gray-600 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  {tech.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{tech.name}</h3>
                <p className="text-gray-400">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How SafeSignal Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our three-step process ensures you receive accurate, verified alerts when disasters strike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div variants={fadeIn} className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute top-10 left-1/2 transform translate-x-8 hidden md:block">
                <ArrowRight className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Detect</h3>
              <p className="text-gray-600 leading-relaxed">
                Multiple data sources and user reports help us detect natural disasters as they happen in real-time.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="absolute top-10 left-1/2 transform translate-x-8 hidden md:block">
                <ArrowRight className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Verify</h3>
              <p className="text-gray-600 leading-relaxed">
                Community members vote to verify information, ensuring only accurate alerts reach users.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Alert</h3>
              <p className="text-gray-600 leading-relaxed">
                Verified alerts are instantly sent to users in affected areas through push notifications.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 text-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the SafeSignal Community</h2>
          <p className="text-xl mb-12 opacity-90">
            Be part of a community that&apos;s making disaster response faster, more accurate, and more effective.
            Together, we can save lives.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/download"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Download Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white rounded-full font-bold hover:bg-white hover:text-orange-500 transition-all duration-300"
              >
                Contact Us
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
      <Footer/>
    </div>
  )
}

export default About
