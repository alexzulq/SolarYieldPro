import React from 'react';
import { DailyData } from '../types';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface EventsListProps {
  data: DailyData[];
}

const EventsList: React.FC<EventsListProps> = ({ data }) => {
  // Filter for rows that have notes OR estimated loss > 0
  const events = data.filter(d => 
      (d.notes && d.notes.trim().length > 0) || 
      (d.estimatedLoss && d.estimatedLoss > 0)
  ).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort Descending (Newest First)

  if (events.length === 0) {
      return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 transition-colors mb-8">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center">
        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Major Events & Outages</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700 sticky top-0">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Site</th>
              <th className="px-6 py-3">Description / Notes</th>
              <th className="px-6 py-3 text-right">Est. Loss (kWh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {events.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {format(row.date, 'yyyy-MM-dd')}
                </td>
                <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-200">{row.siteName}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400 max-w-md truncate" title={row.notes}>
                    {row.notes || '-'}
                </td>
                <td className="px-6 py-3 text-right font-medium text-red-600 dark:text-red-400">
                    {row.estimatedLoss ? `-${row.estimatedLoss.toLocaleString()}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsList;