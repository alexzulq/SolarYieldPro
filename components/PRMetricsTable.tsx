import React from 'react';
import { AggregatedData } from '../types';
import clsx from 'clsx';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface PRMetricsTableProps {
  data: AggregatedData[];
  title: string;
}

const PRMetricsTable: React.FC<PRMetricsTableProps> = ({ data, title }) => {
  const { t } = useThemeLanguage();
  const formatPct = (n: number) => `${(n * 100).toFixed(2)}%`;
  const formatDiff = (n: number) => `${n > 0 ? '+' : ''}${(n * 100).toFixed(2)}%`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 transition-colors mt-8">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3">Period</th>
              <th className="px-6 py-3 text-right">{t('label_budget')} PR</th>
              <th className="px-6 py-3 text-right">O&M Contractor PR Target</th>
              <th className="px-6 py-3 text-right">{t('label_actual')} + {t('label_forecast')} PR</th>
              <th className="px-6 py-3 text-right">{t('table_comp')}</th>
              <th className="px-6 py-3 text-right">{t('table_var')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((row) => {
               // Calculate Projected PR (Weighted Logic if Mixed)
               let projectedPr = 0;
               if (row.kwhForecast === 0 && row.prActual !== null) {
                 projectedPr = row.prActual;
               } else if (row.kwhActual === 0 && row.prForecast !== null) {
                 projectedPr = row.prForecast;
               } else {
                 // Reconstruct theoretical energy to weight the PR correctly
                 // Theoretical = Energy / PR
                 const theoAct = row.prActual ? row.kwhActual / row.prActual : 0;
                 const theoFcst = row.prForecast ? row.kwhForecast / row.prForecast : 0;
                 const totalTheo = theoAct + theoFcst;
                 projectedPr = totalTheo > 0 ? row.totalProjected / totalTheo : 0;
               }
               
               const deviation = projectedPr - row.prBudget;

               return (
              <tr key={row.periodKey} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap">{row.periodLabel}</td>
                <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{formatPct(row.prBudget)}</td>
                <td className="px-6 py-3 text-right text-purple-600 dark:text-purple-400 font-medium">
                    {row.contractorPrTarget ? formatPct(row.contractorPrTarget) : '-'}
                </td>
                <td className="px-6 py-3 text-right font-medium text-gray-900 dark:text-white">{formatPct(projectedPr)}</td>
                <td className="px-6 py-3 text-right text-xs text-gray-500 dark:text-gray-400">
                    {row.kwhActual > 0 && row.kwhForecast > 0 ? (
                        <span className="text-purple-600 dark:text-purple-400 font-medium">{t('label_mixed')}</span>
                    ) : row.kwhActual > 0 ? (
                        <span className="text-blue-700 dark:text-blue-400 font-medium">{t('label_actual')}</span>
                    ) : (
                        <span className="text-blue-400 dark:text-blue-300">{t('label_forecast')}</span>
                    )}
                </td>
                <td className="px-6 py-3 text-right">
                  <span
                    className={clsx(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      deviation >= 0
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        : deviation >= -0.10
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                    )}
                  >
                    {formatDiff(deviation)}
                  </span>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PRMetricsTable;