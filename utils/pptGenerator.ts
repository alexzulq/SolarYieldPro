import PptxGenJS from 'pptxgenjs';
import { SimulationResult, AggregatedData, DailyData, LossFactors } from '../types';
import { format } from 'date-fns';

export const generatePPT = (data: SimulationResult, selectedSites: string[], capacityMW: number) => {
  const pres = new PptxGenJS();

  // --- Theme Setup ---
  pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pres.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial' };
  
  const COLOR_BLUE = '1e40af';
  const COLOR_LIGHT_BLUE = '93c5fd';
  const COLOR_RED = 'dc2626';
  const COLOR_ORANGE = 'ea580c';
  const COLOR_GRAY = '4b5563';
  const COLOR_GREEN = '16a34a';
  const COLOR_AMBER = 'd97706';

  // --- Slide 1: Title Slide ---
  const slide1 = pres.addSlide();
  
  slide1.addText('Solar Performance Report', {
    x: 0.5, y: 2.0, w: '90%', fontSize: 36, bold: true, color: '1e293b', align: 'left'
  });
  
  slide1.addText(`Sites: ${selectedSites.length > 3 ? `${selectedSites.length} Sites Selected` : selectedSites.join(', ')}`, {
    x: 0.5, y: 2.8, w: '90%', fontSize: 18, color: '64748b'
  });

  slide1.addText(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, {
    x: 0.5, y: 3.2, w: '90%', fontSize: 14, color: '94a3b8'
  });

  // --- Slide 2: Executive Summary (KPIs) ---
  const slide2 = pres.addSlide();
  slide2.addText('Executive Summary', { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: '1e293b' });

  // Draw 4 KPI Boxes horizontally to mimic dashboard
  const boxY = 1.0;
  const boxW = 2.1;
  const boxH = 1.2;
  const gap = 0.25;
  const startX = 0.5;

  const createKPIBox = (idx: number, title: string, value: string, sub: string, subColor: string, accentColor: string) => {
      const x = startX + (idx * (boxW + gap));
      
      // Box Background
      slide2.addShape(pres.ShapeType.rect, { x: x, y: boxY, w: boxW, h: boxH, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 } });
      
      // Icon Placeholder (Colored shape)
      slide2.addShape(pres.ShapeType.ellipse, { x: x + boxW - 0.4, y: boxY + 0.15, w: 0.25, h: 0.25, fill: { color: accentColor, transparency: 80 } });

      // Title
      slide2.addText(title, { x: x + 0.15, y: boxY + 0.15, w: boxW - 0.6, fontSize: 10, color: '64748b' });
      // Value
      slide2.addText(value, { x: x + 0.15, y: boxY + 0.5, w: boxW - 0.3, fontSize: 18, bold: true, color: '1e293b' });
      // Subtext
      slide2.addText(sub, { x: x + 0.15, y: boxY + 0.9, w: boxW - 0.3, fontSize: 9, color: subColor });
  };

  // 1. Yield
  const varianceSign = data.metrics.varianceYearEnd > 0 ? '+' : '';
  createKPIBox(0, 'Projected Yield', `${(data.metrics.totalProjected / 1000).toLocaleString()} MWh`, 
      `${varianceSign}${data.metrics.varianceYearEnd.toFixed(1)}% vs Budget`, 
      data.metrics.varianceYearEnd >= 0 ? COLOR_GREEN : COLOR_RED, COLOR_RED);

  // 2. Capacity
  createKPIBox(1, 'System Capacity', `${capacityMW.toFixed(2)} MWp`, 'Total Capacity', COLOR_BLUE, COLOR_BLUE);

  // 3. PR Trend
  const prDiff = (data.metrics.trendPrVariance * 100).toFixed(1);
  const prSign = data.metrics.trendPrVariance > 0 ? '+' : '';
  createKPIBox(2, 'Recent PR Trend', `${(data.metrics.trendPr * 100).toFixed(1)}%`, 
      `${prSign}${prDiff}% vs Budget`, 
      data.metrics.trendPrVariance >= 0 ? COLOR_GREEN : COLOR_RED, COLOR_AMBER);

  // 4. Horizon
  createKPIBox(3, 'Forecast Horizon', `${data.monthlyData.filter(m => m.kwhForecast > 0).length} Months`, 'Remaining in year', COLOR_BLUE, COLOR_BLUE);

  // --- Loss Analysis (Side by Side) ---
  slide2.addText('Loss Analysis', { x: 0.5, y: 2.6, fontSize: 18, bold: true, color: '1e293b' });

  const createLossTable = (x: number, y: number, w: number, lossData: LossFactors, title: string) => {
      // Card Container
      slide2.addShape(pres.ShapeType.rect, { x: x, y: y, w: w, h: 2.8, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0' } });
      
      // Title
      slide2.addText(title, { x: x + 0.2, y: y + 0.2, fontSize: 12, bold: true, color: '374151' });
      
      // Table Data
      const rows = [
          ['Factor', 'Energy (kWh)', 'Impact'],
          ['Total Budget', Math.round(lossData.kwhBudget).toLocaleString(), '-'],
          ['Irradiance', Math.round(lossData.varianceIrradiance).toLocaleString(), `${((lossData.varianceIrradiance / lossData.kwhBudget)*100).toFixed(1)}%`],
          ['Thermal Loss', Math.round(lossData.varianceThermal).toLocaleString(), `${((lossData.varianceThermal / lossData.kwhBudget)*100).toFixed(1)}%`],
          ['Curtailment', Math.round(lossData.varianceCurtailment).toLocaleString(), `${((lossData.varianceCurtailment / lossData.kwhBudget)*100).toFixed(1)}%`],
          ['Other Efficiency', Math.round(lossData.varianceOtherPr).toLocaleString(), `${((lossData.varianceOtherPr / lossData.kwhBudget)*100).toFixed(1)}%`],
          ['Net Variance', Math.round(lossData.varianceTotal).toLocaleString(), `${((lossData.varianceTotal / lossData.kwhBudget)*100).toFixed(1)}%`]
      ];

      slide2.addTable(rows, {
          x: x + 0.1, y: y + 0.5, w: w - 0.2,
          fontSize: 8,
          border: { pt: 0, color: 'FFFFFF' }, // Clean look
          fill: { color: 'FFFFFF' },
          rowHover: { color: 'F3F4F6' },
          colW: [1.2, 1.5, 1.0]
      });
  };

  createLossTable(0.5, 3.0, 4.4, data.lossAnalysisYTD, 'YTD Loss Analysis');
  createLossTable(5.1, 3.0, 4.4, data.lossAnalysisMTD, 'MTD Loss Analysis');

  // --- Slide 3: Yield & PR Charts (Side by Side) ---
  const slide3 = pres.addSlide();
  slide3.addText('Yield & PR Analysis', { x: 0.5, y: 0.4, fontSize: 18, bold: true, color: '1e293b' });

  const labels = data.monthlyData.map(d => d.periodLabel);
  
  // Chart 1: Yield
  const chartDataYield = [
      {
          name: 'Budget',
          labels: labels,
          values: data.monthlyData.map(d => d.kwhBudget / 1000),
      },
      {
          name: 'Actual',
          labels: labels,
          values: data.monthlyData.map(d => d.kwhActual / 1000),
      },
      {
          name: 'Forecast',
          labels: labels,
          values: data.monthlyData.map(d => d.kwhForecast / 1000),
      }
  ];

  slide3.addChart(pres.ChartType.bar, chartDataYield, {
      x: 0.5, y: 1.0, w: 4.4, h: 3.8,
      barDir: 'col',
      barGrouping: 'stacked',
      chartColors: [COLOR_RED, COLOR_BLUE, COLOR_LIGHT_BLUE],
      legend: true,
      legendPos: 'b',
      valAxisLabelFormatCode: '#,##0 "MWh"',
      title: 'Monthly Energy (MWh)',
      showValue: false
  });

  // Chart 2: PR
  const chartDataPR = [
      {
          name: 'Budget PR',
          labels: labels,
          values: data.monthlyData.map(d => d.prBudget),
      },
      {
          name: 'Actual PR',
          labels: labels,
          values: data.monthlyData.map(d => d.prActual || 0),
      }
  ];

  slide3.addChart(pres.ChartType.line, chartDataPR, {
      x: 5.1, y: 1.0, w: 4.4, h: 3.8,
      chartColors: [COLOR_GRAY, COLOR_ORANGE],
      legend: true,
      legendPos: 'b',
      valAxisLabelFormatCode: '0%',
      title: 'Performance Ratio',
      showValue: false,
      lineDataSymbol: 'circle'
  });

  // --- Slide 4: Cumulative & Irradiation (Side by Side) ---
  const slide4 = pres.addSlide();
  slide4.addText('Cumulative & Irradiation Analysis', { x: 0.5, y: 0.4, fontSize: 18, bold: true, color: '1e293b' });

  // Chart 3: Cumulative
  const chartDataCum = [
      {
          name: 'Cum. Budget',
          labels: labels,
          values: data.monthlyData.map(d => d.cumulativeKwhBudget / 1000000), // GWh
      },
      {
          name: 'Cum. Actual',
          labels: labels,
          values: data.monthlyData.map(d => (d.cumulativeKwhActual || 0) / 1000000),
      },
      {
          name: 'Cum. Projected',
          labels: labels,
          values: data.monthlyData.map(d => (d.cumulativeKwhProjected || 0) / 1000000),
      }
  ];

  slide4.addChart(pres.ChartType.line, chartDataCum, {
      x: 0.5, y: 1.0, w: 4.4, h: 3.8,
      chartColors: [COLOR_GRAY, COLOR_BLUE, COLOR_LIGHT_BLUE],
      legend: true,
      legendPos: 'b',
      valAxisLabelFormatCode: '#,##0.0 "GWh"',
      title: 'Cumulative Energy (GWh)',
      showValue: false
  });

  // Chart 4: Irradiation
  const chartDataIrr = [
    {
        name: 'Budget Irr',
        labels: labels,
        values: data.monthlyData.map(d => d.ghiBudget),
    },
    {
        name: 'Actual Irr',
        labels: labels,
        values: data.monthlyData.map(d => d.ghiActual || 0),
    }
  ];

  slide4.addChart(pres.ChartType.bar, chartDataIrr, {
      x: 5.1, y: 1.0, w: 4.4, h: 3.8,
      chartColors: [COLOR_GRAY, COLOR_ORANGE],
      legend: true,
      legendPos: 'b',
      valAxisLabelFormatCode: '#,##0',
      title: 'Irradiation (kWh/m²)',
      showValue: false
  });


  // --- Slide 5: Events List (if any) ---
  const events = data.dailyData.filter(d => (d.notes && d.notes.trim().length > 0) || (d.estimatedLoss && d.estimatedLoss > 0));
  
  if (events.length > 0) {
      const slide5 = pres.addSlide();
      slide5.addText('Major Events & Outages Log', { x: 0.5, y: 0.5, fontSize: 18, bold: true, color: '1e293b' });

      const eventHeader = ['Date', 'Site', 'Note / Issue', 'Est. Loss (kWh)'];
      // Limit to top 20 events
      const eventRows = events.slice(0, 20).map(row => [
          format(row.date, 'yyyy-MM-dd'),
          row.siteName,
          row.notes || '-',
          row.estimatedLoss ? `-${row.estimatedLoss.toLocaleString()}` : '-'
      ]);

      slide5.addTable([eventHeader, ...eventRows], {
          x: 0.5, y: 1.0, w: '90%',
          fontSize: 10,
          colW: [1.5, 2.5, 4, 1.5],
          border: { pt: 1, color: 'E2E8F0' },
          fill: { color: 'FFFFFF' },
          headerStyles: { fill: { color: 'FEE2E2' }, bold: true, color: '991B1B' },
          autoPage: true
      });
  }

  // --- Slide 6: Metrics Table ---
  const slide6 = pres.addSlide();
  slide6.addText('Monthly Performance Data', { x: 0.5, y: 0.5, fontSize: 18, bold: true, color: '1e293b' });

  const tableHeader = ['Period', 'Budget (kWh)', 'Actual (kWh)', 'Forecast (kWh)', 'Total Proj (kWh)', 'Var (%)'];
  const tableRows = data.monthlyData.map(row => [
      row.periodLabel,
      Math.round(row.kwhBudget).toLocaleString(),
      Math.round(row.kwhActual).toLocaleString(),
      Math.round(row.kwhForecast).toLocaleString(),
      Math.round(row.totalProjected).toLocaleString(),
      `${row.variancePct > 0 ? '+' : ''}${row.variancePct.toFixed(1)}%`
  ]);

  slide6.addTable([tableHeader, ...tableRows], {
      x: 0.5, y: 1.0, w: '90%',
      fontSize: 10,
      border: { pt: 1, color: 'E2E8F0' },
      fill: { color: 'FFFFFF' },
      headerStyles: { fill: { color: 'F1F5F9' }, bold: true, color: '334155' },
      autoPage: true
  });

  // --- Save ---
  pres.writeFile({ fileName: `Solar_Yield_Projection_${format(new Date(), 'yyyyMMdd')}.pptx` });
};