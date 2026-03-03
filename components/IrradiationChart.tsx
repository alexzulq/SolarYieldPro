import React, { useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AggregatedData } from '../types';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { CustomChartLegend } from './CustomChartLegend';

interface IrradiationChartProps {
  data: AggregatedData[];
  title: string;
}

const IrradiationChart: React.FC<IrradiationChartProps> = ({ data, title }) => {
  const { chartColors, t } = useThemeLanguage();
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  const toggleSeries = (e: any) => {
      const { dataKey } = e;
      setHiddenSeries(prev => 
          prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
      );
  };

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);

  const barSize = data.length > 50 ? undefined : data.length > 20 ? 10 : 30;

  const getBarColor = (actual: number, budget: number) => {
    if (!budget) return '#16a34a';
    const variancePct = ((actual - budget) / budget) * 100;
    if (variancePct >= 0) return '#16a34a'; // High Irradiation (Green)
    if (variancePct >= -10) return '#d97706'; // Slightly Low (Amber)
    return '#dc2626'; // Very Low (Red)
  };

  return (
    <div className="h-[400px] w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
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
            minTickGap={20}
          />
          <YAxis 
            tick={{ fill: chartColors.text, fontSize: 12 }} 
            axisLine={false} 
            tickLine={false}
            label={{ value: `${t('label_irr')} (kWh/m²)`, angle: -90, position: 'insideLeft', fill: chartColors.text, fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [formatNumber(value) + ' kWh/m²', name]}
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
            content={<CustomChartLegend />}
          />
          
          <Bar 
            name={t('label_actual')} 
            dataKey="ghiActual" 
            barSize={barSize} 
            fill="#16a34a" 
            radius={[2, 2, 0, 0]} 
            hide={hiddenSeries.includes('ghiActual')}
          >
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.ghiActual, entry.ghiBudget)} />
             ))}
          </Bar>
          
          <Bar 
            name={t('label_budget')} 
            dataKey="ghiBudget" 
            fill="#9ca3af" 
            barSize={barSize} 
            radius={[2, 2, 0, 0]} 
            hide={hiddenSeries.includes('ghiBudget')}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IrradiationChart;