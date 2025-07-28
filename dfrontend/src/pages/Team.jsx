"use client"
import { motion } from "framer-motion"
import {
  Code,
  Database,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Calendar,
  Award,
  Coffee,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react"

const Team = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  }

  const cardHover = {
    hover: {
      y: -10,
      transition: { duration: 0.3 },
    },
  }

  const developers = [
    {
      name: "Aayam Awal",
      role: "Frontend Developer",
      description:
        "Passionate about creating beautiful, responsive user interfaces with React and modern web technologies. Specializes in turning complex problems into simple, elegant solutions that users love.",
      longDescription:
        "With 1+ years of experience in frontend development, Aayam lex has a keen eye for design and user experience. When not coding, you'll find Alex exploring new design trends, contributing to open-source projects, or enjoying a perfect cup of coffee.",
      image: "/aayam.jpg",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Framer Motion", "Figma"],
      experience: "Student",
      location: "Makawanpur, Nepal",
      favoriteTools: ["VS Code", "Figma", "Chrome DevTools"],
      funFact: "Can debug CSS issues in sleep 😴",
      color: "green",
      gradient: "from-green-400 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      icon: <Code className="w-8 h-8 text-white" />,
      social: {
        github: "https://github.com/alexchen",
        linkedin: "https://linkedin.com/in/alexchen",
        email: "alex@safesignal.com",
      },
    },
    {
      name: "Aayush Dhakal",
      role: "Backend Developer",
      description:
        "Expert in building scalable, secure backend systems with Django and cloud technologies. Focused on creating robust APIs that power life-saving applications with reliability and performance.",
      longDescription:
        "Aayush brings all his of backend expertise to SafeSignal, with a strong background in distributed systems and cloud architecture. He's passionate about writing clean, efficient code that can handle millions of users during critical moments.",
      image: "/profile.jpg",
      skills: ["Django", "Python", "PostgreSQL", "Docker", "Redis"],
      experience: "Student",
      location: "Makawanpur, Nepal",
      favoriteTools: ["PyCharm", "Docker", "Vs Code"],
      funFact: "Once optimized a query from 30s to 50ms ⚡",
      color: "purple",
      gradient: "from-purple-400 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      icon: <Database className="w-8 h-8 text-white" />,
      social: {
        github: "https://github.com/aayushtcp",
        linkedin: "https://linkedin.com/in/sarahrodriguez",
        email: "sarah@safesignal.com",
      },
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 via-purple-500 to-green-500 rounded-full mb-8 shadow-2xl">
              <Heart className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              Meet Our{" "}
              <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-green-500 bg-clip-text text-transparent">
                Dream Team
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Two passionate developers united by a mission to save lives through technology. Meet the brilliant minds
              behind SafeSignal's life-saving platform.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-green-100 text-green-700 rounded-full text-sm font-semibold shadow-lg"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Frontend Excellence
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold shadow-lg"
              >
                <Database className="w-4 h-4 inline mr-2" />
                Backend Mastery
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold shadow-lg"
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Life-Saving Mission
              </motion.span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Members */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {developers.map((dev, index) => (
              <motion.div key={index} variants={cardHover} whileHover="hover" className="group">
                <motion.div
                  variants={fadeIn}
                  className={`relative bg-gradient-to-br ${dev.bgGradient} rounded-2xl h-full p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                    <div
                      className={`w-full h-full bg-gradient-to-br ${dev.gradient} rounded-full transform translate-x-20 -translate-y-20`}
                    ></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5">
                    <div
                      className={`w-full h-full bg-gradient-to-tr ${dev.gradient} rounded-full transform -translate-x-16 translate-y-16`}
                    ></div>
                  </div>

                  {/* Profile Section */}
                  <div className="relative z-10">
                    <div className="flex flex-col items-center mb-8">
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative mb-6">
                        <img
                          src={dev.image || "/placeholder.svg"}
                          alt={dev.name}
                          className="w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-white"
                        />
                        <div
                          className={`absolute -bottom-3 -right-3 w-16 h-16 bg-gradient-to-r ${dev.gradient} rounded-full flex items-center justify-center shadow-xl`}
                        >
                          {dev.icon}
                        </div>
                      </motion.div>

                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{dev.name}</h3>
                      <p className={`text-${dev.color}-600 font-bold text-xl mb-4`}>{dev.role}</p>
                      <p className="text-gray-600 text-center leading-relaxed mb-6">{dev.description}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
                        <Calendar className={`w-6 h-6 text-${dev.color}-500 mx-auto mb-2`} />
                        <p className="text-sm font-semibold text-gray-700">Experience</p>
                        <p className={`text-${dev.color}-600 font-bold`}>{dev.experience}</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
                        <MapPin className={`w-6 h-6 text-${dev.color}-500 mx-auto mb-2`} />
                        <p className="text-sm font-semibold text-gray-700">Location</p>
                        <p className={`text-${dev.color}-600 font-bold text-sm`}>{dev.location}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Technical Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {dev.skills.map((skill, skillIndex) => (
                          <motion.span
                            key={skillIndex}
                            whileHover={{ scale: 1.1 }}
                            className={`px-3 py-2 bg-white/90 text-${dev.color}-700 rounded-full text-sm font-semibold shadow-md border border-${dev.color}-200 hover:shadow-lg transition-all duration-200`}
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Fun Fact */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-8">
                      <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                        <Coffee className="w-4 h-4 mr-2" />
                        Fun Fact
                      </h4>
                      <p className="text-gray-600 italic">{dev.funFact}</p>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-4">
                      <motion.a
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        href={dev.social.github}
                        className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300 shadow-lg"
                      >
                        <Github className="w-6 h-6 text-white" />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.2, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                        href={dev.social.linkedin}
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-300 shadow-lg"
                      >
                        <Linkedin className="w-6 h-6 text-white" />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        href={`mailto:${dev.social.email}`}
                        className={`w-12 h-12 bg-gradient-to-r ${dev.gradient} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        <Mail className="w-6 h-6 text-white" />
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Philosophy */}
      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 bg-gradient-to-r from-orange-50 via-purple-50 to-green-50"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">
            Small Team,{" "}
            <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-green-500 bg-clip-text text-transparent">
              Big Impact
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto">
            We believe that the best products come from passionate, focused teams. Our duo combines complementary skills
            with a shared vision: using technology to protect lives and strengthen communities during their most
            vulnerable moments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality First</h3>
              <p className="text-gray-600">
                Every line of code is written with the understanding that lives depend on our work.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mission Driven</h3>
              <p className="text-gray-600">
                Our passion for saving lives through technology drives everything we build.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                We constantly explore new technologies to make disaster response faster and more effective.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact CTA */}
      <motion.section
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-4 bg-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to Join Our Mission?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            We&apos;re always looking for talented developers who share our passion for using technology to make the
            world safer. Let&apos;s build something amazing together.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 via-purple-500 to-green-500 text-white rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300"
            >
              Get In Touch
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-gray-300 text-gray-700 rounded-full font-bold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              View Our Work
              <Code className="ml-2 w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default Team
