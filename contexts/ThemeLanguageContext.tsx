import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'id' | 'zh';
type Theme = 'light' | 'dark';

interface Translations {
  [key: string]: {
    en: string;
    id: string;
    zh: string;
  };
}

const translations: Translations = {
  appTitle: { en: "SolarYieldPro", id: "SolarYieldPro", zh: "SolarYieldPro" },
  dashboardTitle: { en: "Yield Projection Dashboard", id: "Dasbor Proyeksi Hasil", zh: "产量预测仪表板" },
  uploadTitle: { en: "Predict Your Solar Performance", id: "Prediksi Performa Solar Anda", zh: "预测您的太阳能性能" },
  uploadDesc: { en: "Upload your daily solar production data (Excel) to generate a \"Smart Projection\" for the year-end based on recent Performance Ratio trends.", id: "Unggah data produksi harian (Excel) untuk menghasilkan \"Proyeksi Cerdas\" akhir tahun berdasarkan tren Rasio Performa terkini.", zh: "上传您的每日太阳能生产数据（Excel），根据最近的性能比率趋势生成年终“智能预测”。" },
  step1: { en: "Upload Data", id: "Unggah Data", zh: "上传数据" },
  step2: { en: "Analyze Trend", id: "Analisa Tren", zh: "分析趋势" },
  step3: { en: "Project Yield", id: "Proyeksi Hasil", zh: "项目产量" },
  
  // Metrics
  metric_yield: { en: "Projected Year-End Yield", id: "Proyeksi Hasil Akhir Tahun", zh: "预计年终产量" },
  metric_capacity: { en: "System Capacity", id: "Kapasitas Sistem", zh: "系统容量" },
  metric_pr: { en: "Recent PR Trend", id: "Tren PR Terkini", zh: "近期PR趋势" },
  metric_horizon: { en: "Forecast Horizon", id: "Cakrawala Perkiraan", zh: "预测范围" },
  sub_vsBudget: { en: "to Budget", id: "vs Anggaran", zh: "与预算相比" },
  sub_totalCap: { en: "Total Capacity", id: "Total Kapasitas", zh: "总容量" },
  sub_forecasting: { en: "Used for forecasting", id: "Digunakan untuk perkiraan", zh: "用于预测" },
  sub_remaining: { en: "Remaining in year", id: "Tersisa tahun ini", zh: "当年剩余" },
  
  // Status Notes
  note_met: { en: "Met / Exceeded Budget", id: "Memenuhi / Melebihi Anggaran", zh: "达到/超出预算" },
  note_below_5: { en: "0-10% Below Budget", id: "0-10% Di Bawah Anggaran", zh: "低于预算 0-10%" },
  note_below_more: { en: ">10% Below Budget", id: ">10% Di Bawah Anggaran", zh: "低于预算 >10%" },

  // Filters
  filter_title: { en: "Data Filters", id: "Filter Data", zh: "数据筛选" },
  filter_selectSites: { en: "Select Sites", id: "Pilih Situs", zh: "选择站点" },
  filter_dateRange: { en: "Date Range", id: "Rentang Tanggal", zh: "日期范围" },
  btn_filters: { en: "Filters", id: "Filter", zh: "筛选" },
  btn_reset: { en: "Upload New File", id: "Unggah File Baru", zh: "上传新文件" },

  // Charts Generic
  chart_yield_daily: { en: "Daily Yield: Actuals vs Projection", id: "Hasil Harian: Aktual vs Proyeksi", zh: "日产量：实际 vs 预测" },
  chart_yield_weekly: { en: "Weekly Yield: Actuals vs Projection", id: "Hasil Mingguan: Aktual vs Proyeksi", zh: "周产量：实际 vs 预测" },
  chart_yield_monthly: { en: "Monthly Yield: Actuals vs Projection", id: "Hasil Bulanan: Aktual vs Proyeksi", zh: "月产量：实际 vs 预测" },
  chart_yield_quarterly: { en: "Quarterly Yield: Actuals vs Projection", id: "Hasil Kuartalan: Aktual vs Proyeksi", zh: "季度产量：实际 vs 预测" },
  chart_yield_yearly: { en: "Yearly Yield: Actuals vs Projection", id: "Hasil Tahunan: Aktual vs Proyeksi", zh: "年度产量：实际 vs 预测" },

  chart_pr_daily: { en: "Daily PR: Actual vs O&M Contractor PR Target", id: "PR Harian: Aktual vs Target Kontraktor O&M", zh: "日PR：实际 vs O&M承包商目标" },
  chart_pr_weekly: { en: "Weekly PR: Actual vs O&M Contractor PR Target", id: "PR Mingguan: Aktual vs Target Kontraktor O&M", zh: "周PR：实际 vs O&M承包商目标" },
  chart_pr_monthly: { en: "Monthly PR: Actual vs O&M Contractor PR Target", id: "PR Bulanan: Aktual vs Target Kontraktor O&M", zh: "月PR：实际 vs O&M承包商目标" },
  chart_pr_quarterly: { en: "Quarterly PR: Actual vs O&M Contractor PR Target", id: "PR Kuartalan: Aktual vs Target Kontraktor O&M", zh: "季度PR：实际 vs O&M承包商目标" },
  chart_pr_yearly: { en: "Yearly PR: Actual vs O&M Contractor PR Target", id: "PR Tahunan: Aktual vs Target Kontraktor O&M", zh: "年度PR：实际 vs O&M承包商目标" },

  chart_irr_daily: { en: "Daily Irradiation (GHI)", id: "Iradiasi Harian (GHI)", zh: "日辐照度 (GHI)" },
  chart_irr_weekly: { en: "Weekly Irradiation (GHI)", id: "Iradiasi Mingguan (GHI)", zh: "周辐照度 (GHI)" },
  chart_irr_monthly: { en: "Monthly Irradiation (GHI)", id: "Iradiasi Bulanan (GHI)", zh: "月辐照度 (GHI)" },
  chart_irr_quarterly: { en: "Quarterly Irradiation (GHI)", id: "Iradiasi Kuartalan (GHI)", zh: "季度辐照度 (GHI)" },
  chart_irr_yearly: { en: "Yearly Irradiation (GHI)", id: "Iradiasi Tahunan (GHI)", zh: "年度辐照度 (GHI)" },

  // Availability Charts
  chart_avail_daily: { en: "Daily Availability: Actual vs Guaranteed", id: "Ketersediaan Harian: Aktual vs Dijamin", zh: "日可用性：实际 vs 保证" },
  chart_avail_weekly: { en: "Weekly Availability: Actual vs Guaranteed", id: "Ketersediaan Mingguan: Aktual vs Dijamin", zh: "周可用性：实际 vs 保证" },
  chart_avail_monthly: { en: "Monthly Availability: Actual vs Guaranteed", id: "Ketersediaan Bulanan: Aktual vs Dijamin", zh: "月可用性：实际 vs 保证" },
  chart_avail_quarterly: { en: "Quarterly Availability: Actual vs Guaranteed", id: "Ketersediaan Kuartalan: Aktual vs Dijamin", zh: "季度可用性：实际 vs 保证" },
  chart_avail_yearly: { en: "Yearly Availability: Actual vs Guaranteed", id: "Ketersediaan Tahunan: Aktual vs Dijamin", zh: "年度可用性：实际 vs 保证" },

  chart_cumulative: { en: "Cumulative Energy: Actual / Projected vs Budget", id: "Energi Kumulatif: Aktual / Proyeksi vs Anggaran", zh: "累计能量：实际/预测 vs 预算" },

  // Legends/Labels
  label_actual: { en: "Actual", id: "Aktual", zh: "实际" },
  label_forecast: { en: "Forecast", id: "Perkiraan", zh: "预测" },
  label_budget: { en: "Budget", id: "Anggaran", zh: "预算" },
  label_mixed: { en: "Mixed", id: "Campuran", zh: "混合" },
  label_energy: { en: "Energy", id: "Energi", zh: "能量" },
  label_pae: { en: "PAE Energy", id: "Energi PAE", zh: "PAE 能量" },
  label_guaranteed: { en: "Guaranteed (92.5% PAE)", id: "Dijamin (92.5% PAE)", zh: "保证 (92.5% PAE)" },
  label_pr: { en: "Performance Ratio", id: "Rasio Performa", zh: "性能比率" },
  label_irr: { en: "Irradiation", id: "Iradiasi", zh: "辐照度" },
  label_availability: { en: "Availability", id: "Ketersediaan", zh: "可用性" },
  label_guaranteed_avail: { en: "Guaranteed Availability", id: "Ketersediaan Dijamin", zh: "保证可用性" },
  label_actual_avail: { en: "Actual Availability", id: "Ketersediaan Aktual", zh: "实际可用性" },

  // Loss Analysis
  loss_ytd: { en: "Loss Analysis (YTD)", id: "Analisis Rugi (YTD)", zh: "损失分析 (年初至今)" },
  loss_mtd: { en: "Loss Analysis (MTD)", id: "Analisis Rugi (MTD)", zh: "损失分析 (本月至今)" },
  loss_irrImpact: { en: "Irradiance Impact", id: "Dampak Iradiasi", zh: "辐照度影响" },
  loss_thermal: { en: "Thermal Loss", id: "Kerugian Termal", zh: "热损失" },
  loss_curtailment: { en: "Curtailment", id: "Pengurangan (Curtailment)", zh: "限电" },
  loss_otherPr: { en: "Other Efficiency", id: "Efisiensi Lainnya", zh: "其他效率" },
  loss_prImpact: { en: "PR Impact", id: "Dampak PR", zh: "PR影响" },
  loss_totalVar: { en: "Total Deviation", id: "Total Deviasi", zh: "总偏差" },
  loss_totalBudget: { en: "Total Budget", id: "Total Anggaran", zh: "总预算" },

  // Table Energy
  table_title_daily: { en: "Daily Performance Data (Energy)", id: "Data Performa Harian (Energi)", zh: "日性能数据 (能量)" },
  table_title_weekly: { en: "Weekly Performance Data (Energy)", id: "Data Performa Mingguan (Energi)", zh: "周性能数据 (能量)" },
  table_title_monthly: { en: "Monthly Performance Data (Energy)", id: "Data Performa Bulanan (Energi)", zh: "月度性能数据 (能量)" },
  table_title_quarterly: { en: "Quarterly Performance Data (Energy)", id: "Data Performa Kuartalan (Energi)", zh: "季度性能数据 (能量)" },
  table_title_yearly: { en: "Yearly Performance Data (Energy)", id: "Data Performa Tahunan (Energi)", zh: "年度性能数据 (能量)" },
  
  // Table PR
  table_pr_title_daily: { en: "Daily Performance Data (PR)", id: "Data Performa Harian (PR)", zh: "日性能数据 (PR)" },
  table_pr_title_weekly: { en: "Weekly Performance Data (PR)", id: "Data Performa Mingguan (PR)", zh: "周性能数据 (PR)" },
  table_pr_title_monthly: { en: "Monthly Performance Data (PR)", id: "Data Performa Bulanan (PR)", zh: "月度性能数据 (PR)" },
  table_pr_title_quarterly: { en: "Quarterly Performance Data (PR)", id: "Data Performa Kuartalan (PR)", zh: "季度性能数据 (PR)" },
  table_pr_title_yearly: { en: "Yearly Performance Data (PR)", id: "Data Performa Tahunan (PR)", zh: "年度性能数据 (PR)" },

  // Table Temp
  table_temp_title_daily: { en: "Daily Performance Data (Thermal Loss)", id: "Data Performa Harian (Rugi Termal)", zh: "日性能数据 (热损失)" },
  table_temp_title_weekly: { en: "Weekly Performance Data (Thermal Loss)", id: "Data Performa Mingguan (Rugi Termal)", zh: "周性能数据 (热损失)" },
  table_temp_title_monthly: { en: "Monthly Performance Data (Thermal Loss)", id: "Data Performa Bulanan (Rugi Termal)", zh: "月度性能数据 (热损失)" },
  table_temp_title_quarterly: { en: "Quarterly Performance Data (Thermal Loss)", id: "Data Performa Kuartalan (Rugi Termal)", zh: "季度性能数据 (热损失)" },
  table_temp_title_yearly: { en: "Yearly Performance Data (Thermal Loss)", id: "Data Performa Tahunan (Rugi Termal)", zh: "年度性能数据 (热损失)" },

  table_month: { en: "Month", id: "Bulan", zh: "月份" },
  table_comp: { en: "Composition", id: "Komposisi", zh: "组成" },
  table_var: { en: "Deviation", id: "Deviasi", zh: "偏差" },
};

interface ThemeLanguageContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  chartColors: {
    grid: string;
    text: string;
    tooltipBg: string;
    tooltipText: string;
  };
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Check system preference or saved local storage could go here
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || key;
  };

  const chartColors = {
    grid: theme === 'dark' ? '#374151' : '#E5E7EB',
    text: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    tooltipBg: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    tooltipText: theme === 'dark' ? '#F3F4F6' : '#111827',
  };

  return (
    <ThemeLanguageContext.Provider value={{ theme, language, toggleTheme, setLanguage, t, chartColors }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};