import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AggregatedData } from '../types';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface CumulativeChartProps {
  data: AggregatedData[];
  title?: string;
}

const CumulativeChart: React.FC<CumulativeChartProps> = ({ data, title }) => {
  const { chartColors, t } = useThemeLanguage();
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  const toggleSeries = (e: any) => {
      const { dataKey } = e;
      setHiddenSeries(prev => 
          prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
      );
  };

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

  const displayTitle = title || t('chart_cumulative');

  return (
    <div className="h-[430px] w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{displayTitle}</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
            data={data}
            margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
            <XAxis 
                dataKey="periodLabel" 
                tick={{ fill: chartColors.text, fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                minTickGap={30}
            />
            <YAxis 
                tick={{ fill: chartColors.text, fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}G`}
                label={{ value: `${t('label_energy')} (kWh)`, angle: -90, position: 'insideLeft', fill: chartColors.text, fontSize: 12 }}
            />
            <Tooltip 
                formatter={(value: number, name: string) => [formatNumber(value) + ' kWh', name]}
                contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: chartColors.tooltipBg,
                    color: chartColors.tooltipText
                }}
            />
            <Legend 
                onClick={toggleSeries} 
                wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} 
            />
            
            <Line 
                type="monotone" 
                name={`Cumulative ${t('label_budget')}`}
                dataKey="cumulativeKwhBudget" 
                stroke="#9ca3af" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 6 }}
                hide={hiddenSeries.includes('cumulativeKwhBudget')}
            />
            <Line 
                type="monotone" 
                name={`${t('label_forecast')} / Projected`} 
                dataKey="cumulativeKwhForecast" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 6 }}
                hide={hiddenSeries.includes('cumulativeKwhForecast')}
            />
            <Line 
                type="monotone" 
                name={t('label_actual')} 
                dataKey="cumulativeKwhActual" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 6 }}
                connectNulls={false}
                hide={hiddenSeries.includes('cumulativeKwhActual')}
            />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CumulativeChart;