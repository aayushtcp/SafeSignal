"use client"

import { useState, useEffect } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import axios from "axios"
import { API_URL } from "../../context/myurl"
import { PieChart } from "lucide-react"

const DisasterTypePie = () => {
  const [disasterData, setDisasterData] = useState({
    labels: [],
    counts: [],
  })

  //backend data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/disaster-count-by-type/`)
        const fetchedData = response.data

        const labels = fetchedData.map((item) => item.disasterType)
        const counts = fetchedData.map((item) => item.count)

        setDisasterData({ labels, counts })
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  // main pie chart data
  ChartJS.register(ArcElement, Tooltip, Legend)

  // Enhanced color palette
  const backgroundColors = [
    "rgba(79, 70, 229, 0.8)", // Indigo
    "rgba(16, 185, 129, 0.8)", // Emerald
    "rgba(245, 158, 11, 0.8)", // Amber
    "rgba(239, 68, 68, 0.8)", // Red
    "rgba(139, 92, 246, 0.8)", // Violet
    "rgba(6, 182, 212, 0.8)", // Cyan
    "rgba(236, 72, 153, 0.8)", // Pink
    "rgba(107, 114, 128, 0.8)", // Gray
  ]

  const borderColors = [
    "rgba(79, 70, 229, 1)", // Indigo
    "rgba(16, 185, 129, 1)", // Emerald
    "rgba(245, 158, 11, 1)", // Amber
    "rgba(239, 68, 68, 1)", // Red
    "rgba(139, 92, 246, 1)", // Violet
    "rgba(6, 182, 212, 1)", // Cyan
    "rgba(236, 72, 153, 1)", // Pink
    "rgba(107, 114, 128, 1)", // Gray
  ]

  const data = {
    labels: disasterData.labels,
    datasets: [
      {
        data: disasterData.counts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      title: {
        display: true,
        text: "Distribution by Disaster Type",
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
        boxPadding: 6,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.raw || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ${value} (${percentage}%)`
          },
        },
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
      },
    },
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Disaster Types</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">Distribution of disasters by type</p>
      </div>
      <div className="p-4 h-[300px]">
        <Pie data={data} options={options} />
      </div>
    </div>
  )
}

export default DisasterTypePie
