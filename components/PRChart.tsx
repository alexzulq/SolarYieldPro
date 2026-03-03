import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
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

interface PRChartProps {
  data: AggregatedData[];
  title: string;
}

const HorizontalDash = (props: any) => {
    const { cx, cy, stroke, value } = props;
    if (value === 0 || value === null || value === undefined) return null;
    
    return (
        <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke={stroke} strokeWidth={3} strokeLinecap="round" />
    );
};

const PRChart: React.FC<PRChartProps> = ({ data, title }) => {
  const { chartColors, t } = useThemeLanguage();
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  // Check if we have data for the contractor target
  const hasContractorTarget = useMemo(() => data.some(d => d.contractorPrTarget && d.contractorPrTarget > 0), [data]);

  const toggleSeries = (e: any) => {
      const { dataKey } = e;
      setHiddenSeries(prev => 
          prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
      );
  };

  const formatPct = (num: number) => (num * 100).toFixed(1) + '%';
  const barSize = data.length > 50 ? undefined : data.length > 20 ? 10 : 30;

  const getBarColor = (actual: number, target: number | null) => {
    if (!target) return '#16a34a'; // Default green if no target
    const variancePct = ((actual - target) / target) * 100;
    if (variancePct >= 0) return '#16a34a'; // green-600
    if (variancePct >= -10) return '#ca8a04'; // yellow-600
    return '#dc2626'; // red-600
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
            tickFormatter={(val) => (val * 100).toFixed(0) + '%'}
            domain={[0, 'auto']} 
            label={{ value: t('label_pr'), angle: -90, position: 'insideLeft', fill: chartColors.text, fontSize: 12 }}
          />
          <Tooltip 
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
            wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} 
            content={<CustomChartLegend />}
          />
          
          <Bar 
            name={`${t('label_actual')} PR`} 
            dataKey="prActual" 
            barSize={barSize} 
            fill="#16a34a" 
            radius={[2, 2, 0, 0]} 
            hide={hiddenSeries.includes('prActual')}
          >
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.prActual || 0, entry.contractorPrTarget)} />
             ))}
          </Bar>

          {hasContractorTarget && (
            <Line 
              name="O&M Contractor PR Target" 
              dataKey="contractorPrTarget" 
              stroke="#8b5cf6" 
              strokeWidth={0} // Hide connecting line
              dot={<HorizontalDash stroke="#8b5cf6" />}
              activeDot={false}
              legendType="rect"
              hide={hiddenSeries.includes('contractorPrTarget')}
            />
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PRChart;