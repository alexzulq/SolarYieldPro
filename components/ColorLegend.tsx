import React from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const ColorLegend: React.FC = () => {
  const { theme } = useThemeLanguage();
  
  return (
    <div className="flex flex-col space-y-1.5 text-xs mt-2 px-1">
      <div className="flex items-center">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 shadow-sm"></span>
        <span className="text-gray-600 dark:text-gray-300 font-medium">Met / Exceeded Budget (≥ 0%)</span>
      </div>
      <div className="flex items-center">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2 shadow-sm"></span>
        <span className="text-gray-600 dark:text-gray-300 font-medium">0% to -10% Below Budget</span>
      </div>
      <div className="flex items-center">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 shadow-sm"></span>
        <span className="text-gray-600 dark:text-gray-300 font-medium">&lt; -10% Below Budget</span>
      </div>
    </div>
  );
};

export default ColorLegend;