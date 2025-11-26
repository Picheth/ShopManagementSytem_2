
import React from 'react';
import type { CardData } from '../types';

const Card: React.FC<CardData> = ({ title, value, change, changeType, icon }) => {
  const isIncrease = changeType === 'increase';
  
  return (
    <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-light">{title}</p>
          <p className="text-3xl font-bold text-text-main">{value}</p>
        </div>
        <div className="bg-primary/10 text-primary p-3 rounded-full">
            {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-1">
        <span className={`flex items-center text-sm font-semibold ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
          {isIncrease ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          )}
          {change}
        </span>
        <span className="text-sm text-text-light">from last week</span>
      </div>
    </div>
  );
};

export default Card;
