import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { use } from "react";
import { API_URL } from "../../context/myurl";
import axios from "axios";

const DisasterIncreaseGraph = () => {
  const [disasterData, setDisasterData] = useState({
    labels: [],
    counts: [],
  });

  useEffect(() => {
    // Fetch data from the API and update the chart data
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/disaster-count-by-year/`);
        const fetchedData = response.data;

        const labels = fetchedData.map((item) => item.year);
        const counts = fetchedData.map((item) => item.count);
        setDisasterData({ labels, counts });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Bar Chart",
      },
    },
  };


  const data = {
    labels: disasterData.labels,
    datasets: [
      {
        fill: true,
        label:"Disaster Inc/Dec Rate",
        data: disasterData.counts,
        // data: [10,20,20,22,27,28,32],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="h-96 p-3 flex justify-center items-center">
      <Line options={options} data={data} />
    </div>
  );
};

export default DisasterIncreaseGraph;
