import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { API_URL } from "../../context/myurl";
import axios from "axios";
import { Globe } from 'lucide-react';

const DisasterByContinent = () => {
  const [disasterData, setDisasterData] = useState({
    labels: [],
    counts: [],
  });
  
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/disaster-count-by-continent/`
        );
        const fetchedData = response.data;
        const labels = fetchedData.map((item) => item.continent);
        const counts = fetchedData.map((item) => item.count);
        setDisasterData({ labels, counts });
        console.log(disasterData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchdata();
  }, []);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          boxWidth: 8
        }
      },
      title: {
        display: true,
        text: "Disasters Registered By Continent",
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
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
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: "rgba(229, 231, 235, 0.5)"
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    }
  };

  const data = {
    labels: disasterData.labels.map(label => 
      label.charAt(0).toUpperCase() + label.slice(1)
    ),
    datasets: [
      {
        label: "Number of Disasters",
        data: disasterData.counts,
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: "rgba(79, 70, 229, 1)",
      },
    ],
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Disasters by Continent</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">Distribution of registered disasters across continents</p>
      </div>
      <div className="p-4 h-[300px]">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default DisasterByContinent;
