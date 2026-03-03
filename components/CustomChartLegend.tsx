import React from 'react';

export const CustomChartLegend = (props: any) => {
  const { payload, onClick } = props;

  return (
    <ul className="flex justify-center flex-wrap gap-4 pt-5 text-sm">
      {payload.map((entry: any, index: number) => {
        const isActual = entry.dataKey === 'kwhActual' || entry.dataKey === 'prActual' || entry.dataKey === 'ghiActual' || entry.dataKey === 'correctedPr';
        const isHorizontalDash = entry.dataKey === 'paeGuaranteed' || entry.dataKey === 'contractorPrTarget' || entry.dataKey === 'guaranteedAvailability';
        
        return (
          <li 
            key={`item-${index}`} 
            className="flex items-center cursor-pointer transition-opacity hover:opacity-80" 
            onClick={() => onClick(entry)}
            style={{ opacity: entry.inactive ? 0.5 : 1 }}
          >
            {isActual ? (
              <div className="flex mr-2 space-x-0.5">
                <span className="w-3 h-3 bg-green-600 block rounded-sm"></span>
                <span className="w-3 h-3 bg-amber-600 block rounded-sm"></span>
                <span className="w-3 h-3 bg-red-600 block rounded-sm"></span>
              </div>
            ) : isHorizontalDash ? (
              <svg width="24" height="6" className="mr-2">
                <line x1="2" y1="3" x2="22" y2="3" stroke={entry.color} strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : entry.type === 'rect' ? (
              <span className="w-3 h-3 mr-2 block rounded-sm" style={{ backgroundColor: entry.color }}></span>
            ) : entry.type === 'line' ? (
              <span className="w-4 h-1 mr-2 block rounded-full" style={{ backgroundColor: entry.color }}></span>
            ) : (
              <span className="w-3 h-3 mr-2 block rounded-sm" style={{ backgroundColor: entry.color }}></span>
            )}
            <span className="text-gray-700 dark:text-gray-300 font-medium">{entry.value}</span>
          </li>
        );
      })}
    </ul>
  );
};
