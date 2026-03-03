import React from 'react';
import { LossFactors } from '../types';
import { BarChart3, CloudSun, AlertTriangle, Thermometer, ZapOff, Activity } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface LossAnalysisCardProps {
  title: string;
  data: LossFactors;
}

const getVarianceColor = (val: number, total: number) => {
    const pct = total !== 0 ? (val / total * 100) : 0;
    // For net variance, positive is green, slightly negative is amber, very negative is red.
    // However, if we are looking at specific LOSS bars (Irradiance, PR), these are usually deviations.
    // Let's apply generic "Good/Bad" logic.
    // If Net Variance >= 0 -> Green
    // If Net Variance >= -10% -> Yellow
    // Else -> Red
    
    if (pct >= 0) return 'text-green-600 dark:text-green-400';
    if (pct >= -10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
}

const LossBar: React.FC<{ label: string; value: number; total: number; icon?: React.ReactNode }> = ({ label, value, total, icon }) => {
    const isPositive = value >= 0;
    const sign = isPositive ? '+' : '';
    const formatted = Math.round(value).toLocaleString();
    const percent = total !== 0 ? (value / total * 100).toFixed(1) : '0.0';
    
    // For component losses, negative means loss. 
    // Usually we want to highlight big losses in red.
    let colorClass = 'text-gray-600 dark:text-gray-400';
    if (value < 0) {
        // Loss
        const pctVal = parseFloat(percent);
        if (pctVal < -2) colorClass = 'text-red-600 dark:text-red-400';
        else colorClass = 'text-yellow-600 dark:text-yellow-400';
    } else {
        colorClass = 'text-green-600 dark:text-green-400';
    }

    return (
        <div className="flex items-center text-sm py-2">
            <div className="w-36 text-gray-600 dark:text-gray-400 font-medium flex items-center">
                 {icon && <span className="mr-2 text-gray-400 dark:text-gray-500">{icon}</span>}
                 {label}
            </div>
            <div className="flex-1 flex items-center justify-end">
                <span className={`font-bold mr-2 ${colorClass}`}>
                    {sign}{formatted} kWh
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right">
                    ({sign}{percent}%)
                </span>
            </div>
        </div>
    );
}

const LossAnalysisCard: React.FC<LossAnalysisCardProps> = ({ title, data }) => {
  const { t } = useThemeLanguage();

  const netVarianceColor = getVarianceColor(data.varianceTotal, data.kwhBudget);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"/>
            {title}
        </h3>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
            {data.periodLabel}
        </span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-6">
          <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('loss_totalBudget')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(data.kwhBudget).toLocaleString()} kWh</p>
          </div>

          <div className="space-y-2 relative">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 ml-[10rem]"></div>
              
              <LossBar 
                  label={t('loss_irrImpact')} 
                  value={data.varianceIrradiance} 
                  total={data.kwhBudget}
                  icon={<CloudSun className="w-3.5 h-3.5"/>}
              />
              
              {/* Detailed Breakdown */}
              <LossBar 
                  label={t('loss_thermal')} 
                  value={data.varianceThermal} 
                  total={data.kwhBudget}
                  icon={<Thermometer className="w-3.5 h-3.5"/>}
              />
              
              <LossBar 
                  label={t('loss_curtailment')} 
                  value={data.varianceCurtailment} 
                  total={data.kwhBudget}
                  icon={<ZapOff className="w-3.5 h-3.5"/>}
              />
              
              <LossBar 
                  label={t('loss_otherPr')} 
                  value={data.varianceOtherPr} 
                  total={data.kwhBudget}
                  icon={<Activity className="w-3.5 h-3.5"/>}
              />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('loss_totalVar')}</p>
              <div className="flex items-baseline justify-between">
                    <p className={`text-2xl font-bold ${netVarianceColor}`}>
                        {data.varianceTotal > 0 ? '+' : ''}{Math.round(data.varianceTotal).toLocaleString()} kWh
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {data.varianceTotal > 0 ? '+' : ''}{((data.varianceTotal / data.kwhBudget) * 100).toFixed(1)}% {t('sub_vsBudget')}
                    </span>
              </div>
          </div>
      </div>
      
      <div className="mt-6 bg-slate-50 dark:bg-gray-750 p-3 rounded-lg text-xs text-gray-500 dark:text-gray-400 space-y-1">
           <p className="flex items-start gap-2">
              <CloudSun className="w-3 h-3 mt-0.5" />
              {t('label_irr')}: Weather deviations.
          </p>
           <p className="flex items-start gap-2">
              <Thermometer className="w-3 h-3 mt-0.5" />
              {t('loss_thermal')}: Heat loss (above 25°C).
          </p>
          <p className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 mt-0.5" />
              {t('loss_otherPr')}: Soiling, degradation, faults.
          </p>
      </div>
    </div>
  );
};

export default LossAnalysisCard;