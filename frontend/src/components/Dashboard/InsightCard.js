import React from 'react';

const InsightCard = ({ title, data, type }) => {
  const renderContent = () => {
    if (!data) return <p className="text-[#B3B3B3]">No data available</p>;

    switch (type) {
      case 'list':
        return (
          <ul className="space-y-3">
            {data.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-[#2B2B2B]">{item.name || item.customer}</span>
                <span className="text-[#4c9085] font-medium">
                  {item.count || item.requests}
                </span>
              </li>
            ))}
          </ul>
        );

      case 'percentage':
        return (
          <ul className="space-y-3">
            {data.map((item, index) => (
              <li key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-[#2B2B2B]">{item.name}</span>
                  <span className="text-[#4c9085] font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4c9085] rounded-full h-2"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        );

      case 'distribution':
        return (
          <ul className="space-y-3">
            {data.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-[#2B2B2B]">{item.type}</span>
                <div className="flex items-center">
                  <span className="text-[#4c9085] font-medium mr-2">{item.count}</span>
                  <span className="text-[#B3B3B3] text-sm">({item.percentage}%)</span>
                </div>
              </li>
            ))}
          </ul>
        );

      case 'score':
        return (
          <div className="text-center">
            <div className="text-4xl font-bold text-[#4c9085] mb-2">{data.score}</div>
            <div className="text-[#B3B3B3] text-sm">{data.description}</div>
          </div>
        );

      default:
        return <p className="text-[#B3B3B3]">Invalid card type</p>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-[#3D7269] mb-4">{title}</h3>
      {renderContent()}
    </div>
  );
};

export default InsightCard; 