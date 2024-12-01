import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartComponent = ({ title, data, type }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 min-h-[300px] flex items-center justify-center">
        <p className="text-[#B3B3B3]">No data available</p>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  const getChartData = () => {
    if (type === 'line') {
      return {
        labels: data.map(item => item.month),
        datasets: [
          {
            label: 'Number of Requests',
            data: data.map(item => item.requests),
            borderColor: '#4c9085',
            backgroundColor: 'rgba(76, 144, 133, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    }

    if (type === 'pie') {
      return {
        labels: data.map(item => item.category),
        datasets: [
          {
            data: data.map(item => item.percentage),
            backgroundColor: [
              '#4c9085',
              '#3d7269',
              '#2B2B2B',
              '#B3B3B3',
              '#D4D4D4'
            ],
            borderWidth: 1
          }
        ]
      };
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <div className="h-[300px]">
            <Line data={getChartData()} options={chartOptions} />
          </div>
        );
      case 'pie':
        return (
          <div className="h-[300px]">
            <Pie data={getChartData()} options={chartOptions} />
          </div>
        );
      default:
        return <p className="text-[#B3B3B3]">Invalid chart type</p>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-[#3D7269] mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
};

export default ChartComponent; 