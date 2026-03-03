import React, { useMemo, useState } from 'react';
import { DailyData, SimulationResult, AggregatedData, SystemSpecs } from '../types';
import { runProjection, getSiteCapacityMap } from '../utils/solarCalculations';
import { generatePPT } from '../utils/pptGenerator';
import YieldChart from './YieldChart';
import IrradiationChart from './IrradiationChart';
import CumulativeChart from './CumulativeChart';
import PRChart from './PRChart';
import CorrectedPRChart from './CorrectedPRChart';
import AvailabilityChart from './AvailabilityChart'; // Imported
import MetricsTable from './MetricsTable';
import PRMetricsTable from './PRMetricsTable';
import TempLossTable from './TempLossTable';
import EventsList from './EventsList';
import LossAnalysisCard from './LossAnalysisCard';
import ColorLegend from './ColorLegend';
import { 
  Battery, Zap, Sun, Filter, X, CalendarDays, CalendarRange, 
  Presentation, CheckCircle, Info, Server, Cpu, ArrowUp, ArrowDown,
  CloudSun, Thermometer 
} from 'lucide-react';
import { 
  format, parseISO, isValid, 
  startOfWeek, endOfWeek, 
  startOfQuarter, endOfQuarter, 
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  getYear, getQuarter,
  subYears, subMonths, subWeeks
} from 'date-fns';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import clsx from 'clsx';

interface DashboardProps {
  initialData: DailyData[];
  onReset: () => void;
}

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const MetricCard: React.FC<{ 
    title: string; 
    value: string; 
    subValue?: React.ReactNode; 
    icon: React.ReactElement<{ className?: string }>; 
    colorClass: string; 
    progress?: number; 
    note?: string;
    budget?: string; // New prop for budget display
}> = ({ title, value, subValue, icon, colorClass, progress, note, budget }) => {
    
    // Helper to determine background color for progress bar based on text color class
    const getProgressColor = () => {
        if (colorClass.includes('green')) return 'bg-green-600 dark:bg-green-500';
        if (colorClass.includes('yellow')) return 'bg-yellow-500 dark:bg-yellow-400';
        if (colorClass.includes('red')) return 'bg-red-600 dark:bg-red-500';
        return 'bg-blue-600 dark:bg-blue-500';
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between transition-colors h-full">
        <div className="flex-1 mr-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h4>
          
          {/* Budget Display */}
          {budget && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Budget: <span className="font-medium text-gray-700 dark:text-gray-300">{budget}</span>
              </p>
          )}

          {subValue && <div className={`text-sm mt-1 font-medium ${colorClass}`}>{subValue}</div>}
          
          {progress !== undefined && (
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`} 
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
             </div>
          )}
          {note && <p className="text-xs text-gray-400 mt-3 italic">{note}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClass.includes('green') ? 'bg-green-50 text-green-600' : colorClass.includes('yellow') ? 'bg-yellow-50 text-yellow-600' : colorClass.includes('red') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'} dark:bg-opacity-20 opacity-90`}>
          {React.cloneElement(icon, { className: `w-6 h-6` })}
        </div>
      </div>
    );
};

// System Spec Item Component
const SpecItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1 text-xs uppercase tracking-wider font-semibold">
            <span className="mr-2">{icon}</span>
            {label}
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white truncate" title={value}>{value}</div>
    </div>
);

const SystemSpecsCard: React.FC<{ specs: SystemSpecs }> = ({ specs }) => {
    // Helper to format capacity: Convert kW -> MW, kWh -> MWh
    const fmtCap = (val: number, unit: string) => {
        if (val <= 0) return '-';
        const megaVal = val / 1000;
        return `${megaVal.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400"/>
                System Specifications
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <SpecItem label="PV Capacity" value={fmtCap(specs.pvCapacityKW, 'MWp')} icon={<Sun className="w-4 h-4"/>} />
                <SpecItem label="Inv Capacity" value={fmtCap(specs.invCapacityKW, 'MW')} icon={<Zap className="w-4 h-4"/>} />
                <SpecItem label="BESS Capacity" value={fmtCap(specs.bessCapacityKWh, 'MWh')} icon={<Battery className="w-4 h-4"/>} />
                <SpecItem label="BESS Mode" value={specs.bessOperationMode || '-'} icon={<Cpu className="w-4 h-4"/>} />
                <SpecItem label="COD" value={specs.cod || '-'} icon={<CalendarDays className="w-4 h-4"/>} />
            </div>
        </div>
    );
};

// Helper for Color Logic
const getVarianceColor = (variance: number) => {
    if (variance >= 0) return 'text-green-600 dark:text-green-400';
    if (variance >= -10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
};

const Dashboard: React.FC<DashboardProps> = ({ initialData, onReset }) => {
  const { t } = useThemeLanguage();
  const uniqueSites = useMemo(() => Array.from(new Set(initialData.map(d => d.siteName))).sort(), [initialData]);
  const minDataDate = initialData.length > 0 ? initialData[0].date : new Date();
  const maxDataDate = initialData.length > 0 ? initialData[initialData.length - 1].date : new Date();

  // Filter State
  const [selectedSites, setSelectedSites] = useState<string[]>(() => {
      const targetSite = 'ID08-C-0001-IKN-PLN';
      return uniqueSites.includes(targetSite) ? [targetSite] : uniqueSites;
  });

  // Default to THIS YEAR (Jan 1 to Dec 31 of current calendar year)
  const [startDate, setStartDate] = useState<string>(format(startOfYear(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfYear(new Date()), 'yyyy-MM-dd'));
  const [prLookbackDays, setPrLookbackDays] = useState<number>(30);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  // Independent Capacity Calculation: Use FULL data to determine site capacities
  const globalCapacityMap = useMemo(() => {
     return getSiteCapacityMap(initialData);
  }, [initialData]);

  const selectedCapacityMW = useMemo(() => {
     let totalKw = 0;
     selectedSites.forEach(site => {
         totalKw += globalCapacityMap.get(site) || 0;
     });
     return totalKw / 1000;
  }, [globalCapacityMap, selectedSites]);

  // Calculate Annual Budget for the target year (based on endDate year)
  const targetYear = useMemo(() => {
      try {
          return getYear(parseISO(endDate));
      } catch {
          return new Date().getFullYear();
      }
  }, [endDate]);

  const annualBudget = useMemo(() => {
      return initialData.reduce((sum, d) => {
          // Check if date is in target year and site is selected
          if (getYear(d.date) === targetYear && selectedSites.includes(d.siteName)) {
              return sum + d.kwhBudget;
          }
          return sum;
      }, 0);
  }, [initialData, targetYear, selectedSites]);

  // Compute Result
  const result: SimulationResult = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const filtered = initialData.filter(d => {
      const siteMatch = selectedSites.includes(d.siteName);
      const dateMatch = isValid(start) && isValid(end) ? (d.date >= start && d.date <= end) : true;
      return siteMatch && dateMatch;
    });

    if (filtered.length === 0) {
        // Fallback: run on 1 dummy row
        return runProjection(initialData.slice(0, 1), globalCapacityMap, prLookbackDays);
    }
    return runProjection(filtered, globalCapacityMap, prLookbackDays);
  }, [initialData, selectedSites, startDate, endDate, globalCapacityMap, prLookbackDays]);

  const { metrics, monthlyData, lossAnalysisYTD, lossAnalysisMTD, dailyData } = result;
  
  // Dynamic Aggregation Logic
  const currentViewData: AggregatedData[] = useMemo(() => {
      if (viewMode === 'monthly') return monthlyData;

      // Helper to aggregate raw DailyData
      const map = new Map<string, any>(); // Using any for intermediate accumulator
      
      dailyData.forEach(d => {
          let key = '';
          let label = '';
          
          if (viewMode === 'daily') {
              key = format(d.date, 'yyyy-MM-dd');
              label = format(d.date, 'MMM dd');
          } else if (viewMode === 'weekly') {
              const start = startOfWeek(d.date, { weekStartsOn: 1 });
              key = format(start, 'RRRR-II'); 
              label = `W${format(start, 'II')} ${format(start, 'RR')}`;
          } else if (viewMode === 'quarterly') {
              key = `${getYear(d.date)}-Q${getQuarter(d.date)}`;
              label = `Q${getQuarter(d.date)} ${getYear(d.date)}`;
          } else if (viewMode === 'yearly') {
              key = `${getYear(d.date)}`;
              label = `${getYear(d.date)}`;
          }

          if (!map.has(key)) {
              map.set(key, {
                  periodKey: key,
                  periodLabel: label,
                  kwhBudget: 0,
                  kwhActual: 0,
                  kwhForecast: 0,
                  ghiBudget: 0,
                  ghiActual: 0,
                  ghiForecast: 0,
                  theoreticalKwhBudget: 0,
                  theoreticalKwhActual: 0,
                  theoreticalKwhForecast: 0,
                  weightedPrBudgetSum: 0,
                  weightedCorrectedPrBudgetSum: 0,
                  tempWeightedSum: 0,
                  irradianceSumForTemp: 0,
                  curtailmentSum: 0,
                  energyActualSum: 0,
                  varianceThermalSum: 0,
                  guaranteedAvailabilitySum: 0,
                  guaranteedAvailabilityCount: 0,
                  actualAvailabilitySum: 0,
                  actualAvailabilityCount: 0
              });
          }
          
          const acc = map.get(key);
          const cap = globalCapacityMap.get(d.siteName) || d.systemCapacity || 0;

          acc.kwhBudget += d.kwhBudget;
          acc.kwhActual += (d.kwhActual || 0);
          acc.kwhForecast += d.kwhForecast || 0;
          
          acc.ghiBudget += d.ghiBudget;
          acc.ghiActual += (d.ghiActual || 0);
          acc.ghiForecast += d.ghiForecast || 0;
          
          acc.curtailmentSum += (d.curtailment || 0);
          if (d.kwhActual !== null) acc.energyActualSum += d.kwhActual;

          acc.theoreticalKwhBudget += (d.ghiBudget * cap);
          if (d.correctedPrBudget) {
            acc.weightedCorrectedPrBudgetSum += (d.correctedPrBudget * d.ghiBudget * cap);
          }
          
          if (!d.isForecast && d.kwhActual !== null) {
              const irr = (d.ghiActual !== null && d.ghiActual > 0) ? d.ghiActual : d.ghiBudget;
              acc.theoreticalKwhActual += (irr * cap);
              
              if (d.moduleTemp !== null) {
                  acc.tempWeightedSum += (d.moduleTemp * irr);
                  acc.irradianceSumForTemp += irr;
              }
              // Accumulate thermal variance
              acc.varianceThermalSum += d.thermalVariance;
          }
          if (d.isForecast) {
            acc.theoreticalKwhForecast += (d.ghiForecast * cap);
          }

          if (d.guaranteedAvailability !== null) {
              acc.guaranteedAvailabilitySum += d.guaranteedAvailability;
              acc.guaranteedAvailabilityCount++;
          }
          if (d.actualAvailability !== null) {
              acc.actualAvailabilitySum += d.actualAvailability;
              acc.actualAvailabilityCount++;
          }
      });

      const aggregated = Array.from(map.values()).map(acc => {
          const totalProjected = acc.kwhActual + acc.kwhForecast;
          const variancePct = acc.kwhBudget > 0 ? ((totalProjected - acc.kwhBudget) / acc.kwhBudget) * 100 : 0;
          
          const prBudget = acc.theoreticalKwhBudget > 0 ? acc.kwhBudget / acc.theoreticalKwhBudget : 0;
          const prActual = acc.theoreticalKwhActual > 0 ? acc.kwhActual / acc.theoreticalKwhActual : null;
          const prForecast = acc.theoreticalKwhForecast > 0 ? acc.kwhForecast / acc.theoreticalKwhForecast : null;
          
          let correctedPrBudget = null;
          if (acc.theoreticalKwhBudget > 0 && acc.weightedCorrectedPrBudgetSum > 0) {
              correctedPrBudget = acc.weightedCorrectedPrBudgetSum / acc.theoreticalKwhBudget;
          }

          const moduleTemp = acc.irradianceSumForTemp > 0 ? acc.tempWeightedSum / acc.irradianceSumForTemp : null;
          const curtailment = acc.curtailmentSum;
          
          let correctedPr = null;
          if (prActual !== null && moduleTemp !== null) {
             const grossEnergy = acc.energyActualSum + curtailment;
             const rawGrossPr = acc.theoreticalKwhActual > 0 ? grossEnergy / acc.theoreticalKwhActual : 0;
             const deltaT = moduleTemp - 25;
             const lossFactor = deltaT * 0.0029;
             correctedPr = rawGrossPr + lossFactor;

          } else if (prActual !== null && curtailment > 0) {
             correctedPr = acc.theoreticalKwhActual > 0 ? (acc.energyActualSum + curtailment) / acc.theoreticalKwhActual : prActual;
          }

          const guaranteedAvailability = acc.guaranteedAvailabilityCount > 0 ? acc.guaranteedAvailabilitySum / acc.guaranteedAvailabilityCount : null;
          const actualAvailability = acc.actualAvailabilityCount > 0 ? acc.actualAvailabilitySum / acc.actualAvailabilityCount : null;

          return {
              periodKey: acc.periodKey,
              periodLabel: acc.periodLabel,
              kwhBudget: acc.kwhBudget,
              kwhActual: acc.kwhActual,
              kwhForecast: acc.kwhForecast,
              totalProjected,
              variancePct,
              ghiBudget: acc.ghiBudget,
              ghiActual: acc.ghiActual,
              ghiForecast: acc.ghiForecast,
              prBudget,
              correctedPrBudget,
              prActual,
              prForecast,
              moduleTemp,
              curtailment,
              correctedPr,
              cumulativeKwhBudget: 0,
              cumulativeKwhProjected: 0,
              cumulativeKwhActual: null,
              cumulativeKwhForecast: null,
              varianceThermal: acc.varianceThermalSum,
              guaranteedAvailability,
              actualAvailability
          } as AggregatedData;
      }).sort((a, b) => a.periodKey.localeCompare(b.periodKey));

      // Calculate Cumulatives
      let runBudget = 0;
      let runProjected = 0;
      
      let lastActualIdx = -1;
      aggregated.forEach((item, idx) => {
          if (item.kwhForecast === 0) lastActualIdx = idx;
      });

      return aggregated.map((item, idx) => {
          runBudget += item.kwhBudget;
          runProjected += item.totalProjected;
          
          const isActualSeg = idx <= lastActualIdx;
          const isForecastSeg = idx >= lastActualIdx;

          return {
              ...item,
              cumulativeKwhBudget: runBudget,
              cumulativeKwhProjected: runProjected,
              cumulativeKwhActual: isActualSeg ? runProjected : null,
              cumulativeKwhForecast: isForecastSeg ? runProjected : null
          };
      });

  }, [dailyData, monthlyData, viewMode, globalCapacityMap]);

  // Helper for KPI Card Label
  const formatVarianceLabel = (valPct: number) => {
      // Format 0.0%
      const absVal = Math.abs(valPct).toFixed(1); 
      const isPositive = valPct >= 0;
      return (
          <span className="flex items-center">
             <span className="w-2.5 h-2.5 rounded-full bg-current mr-2" />
             {isPositive ? <ArrowUp className="w-3 h-3 mr-1 stroke-[3]" /> : <ArrowDown className="w-3 h-3 mr-1 stroke-[3]" />}
             {absVal}%
          </span>
      );
  };

  // Calculations for KPI Cards
  const varianceYearEnd = metrics.varianceYearEnd;
  const varianceColor = getVarianceColor(varianceYearEnd);

  // PR Variance Calculation
  const prDiffVal = metrics.trendPrVariance * 100;
  const prColor = getVarianceColor(prDiffVal); 

  // MTD Calculations
  const mtdVarianceVal = lossAnalysisMTD.kwhBudget > 0 ? ((lossAnalysisMTD.kwhActual - lossAnalysisMTD.kwhBudget) / lossAnalysisMTD.kwhBudget) * 100 : 0;
  const mtdColor = getVarianceColor(mtdVarianceVal);

  // YTD Calculations (Target: Annual Budget)
  // Logic: (YTD Actual / Annual Budget) * 100
  const ytdProgress = annualBudget > 0 ? (lossAnalysisYTD.kwhActual / annualBudget) * 100 : 0;
  // Neutral Color for Progress
  const ytdColorClass = "text-blue-600 dark:text-blue-400"; 

  // Corrected PR YTD/MTD
  const mtdCorrPr = lossAnalysisMTD.correctedPr;
  const mtdBudPr = lossAnalysisMTD.correctedPrBudget > 0 ? lossAnalysisMTD.correctedPrBudget : lossAnalysisMTD.prBudget;
  const mtdCorrDiff = (mtdCorrPr - mtdBudPr) * 100; 
  const mtdCorrColor = getVarianceColor(mtdCorrDiff);

  const ytdCorrPr = lossAnalysisYTD.correctedPr;
  const ytdBudPr = lossAnalysisYTD.correctedPrBudget > 0 ? lossAnalysisYTD.correctedPrBudget : lossAnalysisYTD.prBudget;
  const ytdCorrDiff = (ytdCorrPr - ytdBudPr) * 100;
  const ytdCorrColor = getVarianceColor(ytdCorrDiff);

  // Irradiance Calculations for KPI Cards (New Logic)
  // Use sum of daily GHI Budget and Actual
  const mtdGhiVal = lossAnalysisMTD.ghiActual;
  const mtdGhiBud = lossAnalysisMTD.ghiBudget;
  // Variance %: (Actual - Budget) / Budget
  const mtdIrrPct = mtdGhiBud > 0 ? ((mtdGhiVal - mtdGhiBud) / mtdGhiBud) * 100 : 0;
  const mtdIrrColor = getVarianceColor(mtdIrrPct);

  const ytdGhiVal = lossAnalysisYTD.ghiActual;
  const ytdGhiBud = lossAnalysisYTD.ghiBudget;
  const ytdIrrPct = ytdGhiBud > 0 ? ((ytdGhiVal - ytdGhiBud) / ytdGhiBud) * 100 : 0;
  const ytdIrrColor = getVarianceColor(ytdIrrPct);


  // Thermal Calculations
  const mtdThermVal = lossAnalysisMTD.varianceThermal;
  const mtdThermPct = lossAnalysisMTD.kwhBudget > 0 ? (mtdThermVal / lossAnalysisMTD.kwhBudget) * 100 : 0;
  const mtdThermColor = getVarianceColor(mtdThermPct);

  const ytdThermVal = lossAnalysisYTD.varianceThermal;
  const ytdThermPct = lossAnalysisYTD.kwhBudget > 0 ? (ytdThermVal / lossAnalysisYTD.kwhBudget) * 100 : 0;
  const ytdThermColor = getVarianceColor(ytdThermPct);

  const handleSiteToggle = (site: string) => {
      if (selectedSites.includes(site)) {
          if (selectedSites.length > 1) setSelectedSites(selectedSites.filter(s => s !== site));
      } else {
          setSelectedSites([...selectedSites, site]);
      }
  };

  const selectAllSites = () => setSelectedSites(uniqueSites);
  const deselectAllSites = () => setSelectedSites([]);

  const handleExportPPT = () => {
    generatePPT(result, selectedSites, selectedCapacityMW);
  };

  const applyQuickFilter = (type: 'year' | 'month' | 'week' | 'lastYear' | 'lastMonth' | 'lastWeek') => {
      const now = new Date();
      let start = now;
      let end = now;

      switch (type) {
          case 'year':
              start = startOfYear(now);
              end = endOfYear(now);
              break;
          case 'month':
              start = startOfMonth(now);
              end = endOfMonth(now);
              break;
          case 'week':
              start = startOfWeek(now, { weekStartsOn: 1 });
              end = endOfWeek(now, { weekStartsOn: 1 });
              break;
          case 'lastYear':
              start = startOfYear(subYears(now, 1));
              end = endOfYear(subYears(now, 1));
              break;
          case 'lastMonth':
              start = startOfMonth(subMonths(now, 1));
              end = endOfMonth(subMonths(now, 1));
              break;
          case 'lastWeek':
              start = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
              end = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
              break;
      }
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
  };
  
  // Dynamic Chart Titles
  const yieldTitle = t(`chart_yield_${viewMode}`);
  const prTitle = t(`chart_pr_${viewMode}`);
  const irrTitle = t(`chart_irr_${viewMode}`);
  const availTitle = t(`chart_avail_${viewMode}`); // Availability Chart Title
  const tableTitle = t(`table_title_${viewMode}`);
  const prTableTitle = t(`table_pr_title_${viewMode}`);
  const tempTableTitle = t(`table_temp_title_${viewMode}`);

  // Unit Selection
  // Modified to include monthly and quarterly in MWh as well, as they often aggregate to large numbers
  const yieldUnit = ['monthly', 'quarterly', 'yearly'].includes(viewMode) ? 'MWh' : 'kWh';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboardTitle')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {selectedSites.length === uniqueSites.length ? 'All Sites' : `${selectedSites.length} Sites`} 
            {' '} ({startDate} - {endDate})
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full sm:w-auto">
                {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as ViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={clsx(
                            "flex-1 px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all",
                            viewMode === mode 
                                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm" 
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleExportPPT}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
            >
                <Presentation className="w-4 h-4 mr-2" />
                Export PPT
            </button>

            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-colors 
                ${showFilters 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
            >
                <Filter className="w-4 h-4 mr-2" />
                {t('btn_filters')}
            </button>
            <button 
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
                {t('btn_reset')}
            </button>
        </div>
      </div>

      <div className="mb-8">
        <ColorLegend />
      </div>

      {/* Filter Panel */}
      {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center"><Filter className="w-4 h-4 mr-2"/> {t('filter_title')}</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filter_selectSites')}</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                         <button onClick={selectAllSites} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Select All</button>
                         <button onClick={deselectAllSites} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">Deselect All</button>
                      </div>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2 space-y-1">
                          {uniqueSites.map(site => (
                              <label key={site} className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedSites.includes(site)} 
                                    onChange={() => handleSiteToggle(site)}
                                    className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-200">{site}</span>
                              </label>
                          ))}
                      </div>
                  </div>
                  <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filter_dateRange')}</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
                                <input 
                                    type="date" 
                                    value={startDate}
                                    min={format(minDataDate, 'yyyy-MM-dd')}
                                    max={format(maxDataDate, 'yyyy-MM-dd')}
                                    onClick={(e) => {
                                        try { (e.currentTarget as any).showPicker() } catch(err) {}
                                    }}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 cursor-pointer"
                                />
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">To</span>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    min={format(minDataDate, 'yyyy-MM-dd')}
                                    max={format(maxDataDate, 'yyyy-MM-dd')}
                                    onClick={(e) => {
                                        try { (e.currentTarget as any).showPicker() } catch(err) {}
                                    }}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                           <button onClick={() => applyQuickFilter('year')} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 transition-colors">This Year</button>
                           <button onClick={() => applyQuickFilter('month')} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 transition-colors">This Month</button>
                           <button onClick={() => applyQuickFilter('week')} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 transition-colors">This Week</button>
                           <button onClick={() => applyQuickFilter('lastYear')} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 transition-colors">Last Year</button>
                           <button onClick={() => applyQuickFilter('lastMonth')} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 transition-colors">Last Month</button>
                           <button onClick={() => applyQuickFilter('lastWeek')} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 transition-colors">Last Week</button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PR Lookback (Days)</label>
                        <div className="flex items-center gap-2">
                             <input 
                                type="number"
                                min={7}
                                max={365}
                                value={prLookbackDays}
                                onChange={(e) => setPrLookbackDays(Number(e.target.value))}
                                className="block w-24 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                             />
                             <span className="text-xs text-gray-500 dark:text-gray-400">Days used to calculate "Recent PR" trend.</span>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* System Specifications Card */}
      <SystemSpecsCard specs={metrics.systemSpecs} />

      {/* KPI Cards (Reorganized - Top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Row 1: MTD Metrics */}
        <MetricCard 
          title="MTD Generation" 
          value={`${(lossAnalysisMTD.kwhActual / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh`}
          subValue={formatVarianceLabel(mtdVarianceVal)}
          icon={<CalendarDays />}
          colorClass={mtdColor}
          budget={`${(lossAnalysisMTD.kwhBudget / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh`}
        />
        
        <MetricCard 
          title="Irradiation (GHI) MTD"
          value={`${(mtdGhiVal).toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh/m²`}
          subValue={formatVarianceLabel(mtdIrrPct)}
          icon={<CloudSun />}
          colorClass={mtdIrrColor}
          budget={`${(mtdGhiBud).toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh/m²`}
        />

        <MetricCard 
          title="Thermal Loss (MTD)"
          value={`${(mtdThermVal / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh`}
          subValue={formatVarianceLabel(mtdThermPct)}
          icon={<Thermometer />}
          colorClass={mtdThermColor}
        />

        <MetricCard 
          title="Corrected PR (MTD)"
          value={`${(mtdCorrPr * 100).toFixed(1)}%`}
          subValue={formatVarianceLabel(mtdCorrDiff)}
          icon={<CheckCircle />}
          colorClass={mtdCorrColor}
          budget={`${(mtdBudPr * 100).toFixed(1)}%`}
        />

        {/* Row 2: YTD Metrics */}
         <MetricCard 
          title="YTD Generation" 
          value={`${(lossAnalysisYTD.kwhActual / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh`}
          subValue={`${ytdProgress.toFixed(0)}% to Annual Budget`}
          icon={<CalendarRange />}
          colorClass={ytdColorClass}
          progress={ytdProgress}
          budget={`${(lossAnalysisYTD.kwhBudget / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh`}
        />

        <MetricCard 
          title="Irradiation (GHI) YTD"
          value={`${(ytdGhiVal).toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh/m²`}
          subValue={formatVarianceLabel(ytdIrrPct)}
          icon={<CloudSun />}
          colorClass={ytdIrrColor}
          budget={`${(ytdGhiBud).toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh/m²`}
        />

        <MetricCard 
          title="Thermal Loss (YTD)"
          value={`${(ytdThermVal / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh`}
          subValue={formatVarianceLabel(ytdThermPct)}
          icon={<Thermometer />}
          colorClass={ytdThermColor}
        />

        <MetricCard 
          title="Corrected PR (YTD)"
          value={`${(ytdCorrPr * 100).toFixed(1)}%`}
          subValue={formatVarianceLabel(ytdCorrDiff)}
          icon={<CheckCircle />}
          colorClass={ytdCorrColor}
          budget={`${(ytdBudPr * 100).toFixed(1)}%`}
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
         <YieldChart data={currentViewData} title={yieldTitle} unit={yieldUnit} />
         <PRChart data={currentViewData} title={prTitle} />
         <CorrectedPRChart data={currentViewData} title="Temperature & Curtailment Corrected PR" />
         <CumulativeChart data={currentViewData} />
         <IrradiationChart data={currentViewData} title={irrTitle} />
         <AvailabilityChart data={currentViewData} title={availTitle} />
      </div>

      {/* Events Table (Only if events exist in current filtered data) */}
      <EventsList data={dailyData} />

      <MetricsTable data={currentViewData} title={tableTitle} />
      <PRMetricsTable data={currentViewData} title={prTableTitle} />
      <TempLossTable data={currentViewData} title={tempTableTitle} />

      {/* Moved to Bottom Section: Projected Yield, PR Trend, Loss Analysis */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Projection & Analysis Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MetricCard 
              title={t('metric_yield')} 
              value={`${(metrics.totalProjected / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} MWh`}
              subValue={formatVarianceLabel(varianceYearEnd)}
              icon={<Zap />}
              colorClass={varianceColor}
              budget={`${(metrics.totalBudget / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} MWh`}
            />

            <MetricCard 
              title={`${t('metric_pr')} (${prLookbackDays}d)`}
              value={`${(metrics.trendPr * 100).toFixed(1)}%`}
              subValue={formatVarianceLabel(prDiffVal)}
              icon={<Sun />}
              colorClass={prColor}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <LossAnalysisCard title={t('loss_ytd')} data={lossAnalysisYTD} />
              <LossAnalysisCard title={t('loss_mtd')} data={lossAnalysisMTD} />
          </div>
      </div>
    </div>
  );
};

export default Dashboard;