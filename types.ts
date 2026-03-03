
export interface RawRow {
  [key: string]: any;
}

export interface DailyData {
  date: Date;
  siteName: string;
  ghiBudget: number;
  ghiActual: number | null;
  kwhBudget: number;
  prBudget: number;
  correctedPrBudget: number | null; 
  contractorPrTarget: number | null; 
  kwhActual: number | null;
  prActual: number | null;
  systemCapacity: number | null; 
  invCapacity: number | null; 
  bessCapacity: number | null; 
  bessOperationMode: string | null; 
  cod: Date | null; 
  kwhForecast: number | null;
  ghiForecast: number | null;
  isForecast: boolean;
  notes?: string;
  estimatedLoss?: number;
  moduleTemp: number | null;
  curtailment: number | null;
  thermalVariance: number; 
  paeEnergy: number | null; 
  // New Availability Fields
  guaranteedAvailability: number | null;
  actualAvailability: number | null;
}

export interface AggregatedData {
  periodKey: string; 
  periodLabel: string;
  
  // Energy
  kwhBudget: number;
  kwhActual: number;
  kwhForecast: number;
  totalProjected: number; 
  variancePct: number;
  paeEnergy: number; 
  paeGuaranteed: number; 

  // Cumulative Energy
  cumulativeKwhBudget: number;
  cumulativeKwhProjected: number; 
  cumulativeKwhActual: number | null; 
  cumulativeKwhForecast: number | null; 

  // Irradiation
  ghiBudget: number;
  ghiActual: number;
  ghiForecast: number;

  // PR
  prBudget: number;
  correctedPrBudget: number | null; 
  contractorPrTarget: number | null; 
  prActual: number | null; 
  prForecast: number | null; 
  
  // Availability
  guaranteedAvailability: number | null;
  actualAvailability: number | null;
  
  // New Corrected Metrics
  moduleTemp: number | null; 
  curtailment: number; 
  correctedPr: number | null;
  
  // Variances
  varianceThermal: number; 
}

export interface LossFactors {
  periodLabel: string;
  kwhBudget: number;
  kwhActual: number;
  varianceTotal: number;
  varianceIrradiance: number;
  variancePr: number;
  // New detailed variances
  varianceThermal: number;
  varianceCurtailment: number;
  varianceOtherPr: number;
  
  prBudget: number;
  correctedPrBudget: number; 
  prActual: number;
  correctedPr: number;

  // Added for GHI Card
  ghiBudget: number;
  ghiActual: number;
}

export interface SystemSpecs {
    pvCapacityKW: number;
    invCapacityKW: number;
    bessCapacityKWh: number;
    bessOperationMode: string;
    cod: string;
}

export interface SimulationResult {
  dailyData: DailyData[];
  monthlyData: AggregatedData[];
  metrics: {
    lastDataDate: Date;
    trendPr: number;
    trendPrVariance: number; 
    impliedCapacity: number; 
    totalBudget: number;
    totalProjected: number;
    varianceYearEnd: number;
    systemSpecs: SystemSpecs; 
  };
  lossAnalysisYTD: LossFactors;
  lossAnalysisMTD: LossFactors;
}

export interface SolarConfig {
  prLookbackDays: number;
}