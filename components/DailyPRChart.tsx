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
  Brush
} from 'recharts';
import { DailyData } from '../types';
import { format } from 'date-fns';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface DailyPRChartProps {
  data: DailyData[];
}

const DailyPRChart: React.FC<DailyPRChartProps> = ({ data }) => {
  const { chartColors, t, theme } = useThemeLanguage();
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  const toggleSeries = (e: any) => {
      const { dataKey } = e;
      setHiddenSeries(prev => 
          prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
      );
  };

  const formatPct = (num: number) => (num * 100).toFixed(1) + '%';

  const formatDate = (date: Date) => {
      try {
          return format(date, 'MMM dd');
      } catch (e) {
          return '';
      }
  };
  
  const formatTooltipDate = (value: any) => {
      try {
          if (value instanceof Date) {
              return format(value, 'MMM dd, yyyy');
          }
          return format(new Date(value), 'MMM dd, yyyy');
      } catch (e) {
          return '';
      }
  };

  return (
    <div className="h-[450px] w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('chart_dailyPr')}</h3>
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
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fill: chartColors.text, fontSize: 12 }} 
            minTickGap={30}
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: chartColors.text, fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(val) => (val * 100).toFixed(0) + '%'}
            domain={['auto', 'auto']}
            label={{ value: t('label_pr'), angle: -90, position: 'insideLeft', fill: chartColors.text, fontSize: 12 }}
          />
          <Tooltip 
            labelFormatter={formatTooltipDate}
            formatter={(value: number, name: string) => [formatPct(value), name]}
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
            wrapperStyle={{ paddingTop: '10px', cursor: 'pointer' }} 
          />
          <Brush 
            dataKey="date" 
            height={30} 
            stroke={theme === 'dark' ? "#4b5563" : "#94a3b8"}
            tickFormatter={formatDate} 
            fill={theme === 'dark' ? "#1f2937" : "#f8fafc"}
          />
          
          <Line 
            type="step" 
            name={`${t('label_budget')} PR`}
            dataKey="prBudget" 
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6 }}
            hide={hiddenSeries.includes('prBudget')}
          />
          
          <Line 
            type="monotone" 
            name={`${t('label_actual')} PR`}
            dataKey="prActual" 
            stroke="#ea580c" 
            strokeWidth={2} 
            dot={{ r: 2, fill: '#ea580c' }} 
            activeDot={{ r: 6 }}
            connectNulls={false}
            hide={hiddenSeries.includes('prActual')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyPRChart;