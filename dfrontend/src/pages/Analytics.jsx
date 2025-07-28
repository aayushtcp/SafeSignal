import Navigation from "../components/Navigation"
import Footer from "../components/Footer"
import DisasterTypePie from "../components/Analytics/DisasterTypePie"
import DisasterIncreaseGraph from "../components/Analytics/DisasterIncreaseGraph"
import DisasterByContinent from "../components/Analytics/DisasterByContinent"

const Analytics = () => {
  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Disaster Analytics Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <DisasterTypePie />
            </div>
            <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <DisasterByContinent />
            </div>
            <div className="w-full lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
              <DisasterIncreaseGraph />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Analytics
