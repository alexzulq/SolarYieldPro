import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Loader2, Download, Database } from 'lucide-react';
import { RawRow } from '../types';
import { addDays, format, startOfYear, subYears, differenceInDays } from 'date-fns';

interface FileUploaderProps {
  onDataLoaded: (data: RawRow[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const headers = [
      "Date", "Site Name", 
      "PV Capacity (kWp)", "Inverter Capacity (kW)", "BESS Capacity (kWh)", 
      "GHI Budget", "kWh Budget", "PR Budget", "Corrected PR Budget", "O&M Contractor PR Target",
      "kWh Actual", "PR Actual", "PAE Energy (kWh)",
      "Guaranteed Availability (%)", "Actual Availability (%)",
      "Notes", "Estimated Loss (kWh)",
      "Module Temp (°C)", "Curtailment (kWh)",
      "BESS Operation Mode", "COD"
    ];
    const rows = [
      ["2024-01-01", "Site Alpha", 1200, 1000, 0, 5.2, 5200, 0.82, 0.82, 0.815, 5100, 0.81, 5080, 0.99, 0.995, "", "", 45.2, 0, "", "2023-12-01"],
      ["2024-01-02", "Site Alpha", 1200, 1000, 0, 4.8, 4800, 0.82, 0.82, 0.815, 4000, 0.69, 3950, 0.99, 0.85, "Inverter 2 Offline", 800, 42.1, 150, "", "2023-12-01"],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    ws['!cols'] = [
        { wch: 12 }, { wch: 15 }, 
        { wch: 20 }, { wch: 20 }, { wch: 20 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 22 }, { wch: 22 },
        { wch: 12 }, { wch: 12 }, { wch: 15 },
        { wch: 25 }, { wch: 25 },
        { wch: 30 }, { wch: 20 },
        { wch: 15 }, { wch: 15 },
        { wch: 20 }, { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "solar_template_extended_v4.xlsx");
  };

  const generateMockData = () => {
    setIsLoading(true);
    setTimeout(() => {
        try {
            const headers = [
                "Date", "Site Name", "System Capacity (kWp)", "Inverter Capacity (kW)", "BESS Capacity (kWh)",
                "GHI Budget (kWh/m2)", "GHI Actual (kWh/m2)",
                "kWh Budget", "kWh Actual",
                "PR Budget", "Corrected PR Budget", "O&M Contractor PR Target", "PR Actual",
                "PAE Energy (kWh)",
                "Guaranteed Availability", "Actual Availability",
                "SY Budget (kWh/kWp)", "SY Actual (kWh/kWp)",
                "Notes", "Estimated Loss (kWh)",
                "Module Temp (°C)", "Curtailment (kWh)",
                "BESS Operation Mode", "COD"
            ];

            const sites = [
                { name: "Alpha Solar Park", capacity: 1200, inv: 1000, bess: 0, cod: "2022-06-01" }, 
                { name: "Beta Roof Systems", capacity: 450, inv: 400, bess: 200, cod: "2023-01-15" },
                { name: "Gamma Ray Field", capacity: 2500, inv: 2200, bess: 1000, cod: "2021-11-20" },
                { name: "Delta Energy Hub", capacity: 5000, inv: 4500, bess: 5000, cod: "2022-03-10" },
                { name: "Epsilon Carport", capacity: 800, inv: 750, bess: 0, cod: "2023-08-01" },
            ];

            const rows: any[][] = [];
            const today = new Date();
            const startDate = startOfYear(subYears(today, 1));
            
            const daysToGenerate = 730;
            
            const issues = [
                "Inverter Communication Fault",
                "Grid Curtailment",
                "Transformer Maintenance",
                "Panel Cleaning"
            ];

            const bessModes = ["Self-Consumption", "Peak Shaving", "Arbitrage"];

            sites.forEach(site => {
                const bessMode = site.bess > 0 ? bessModes[Math.floor(Math.random() * bessModes.length)] : "";
                
                for (let i = 0; i < daysToGenerate; i++) {
                    const currentDate = addDays(startDate, i);
                    const isFuture = currentDate > today;
                    
                    const dayOfYear = i % 365;
                    const seasonality = Math.cos(((dayOfYear - 172) / 365) * 2 * Math.PI); 
                    
                    const ghiBudget = 4.5 + (seasonality * -2.5);
                    const prBudget = 0.81 + (seasonality * 0.03); 
                    const correctedPrBudget = prBudget * 0.99;
                    const contractorPrTarget = prBudget * 0.985;

                    const kwhBudget = ghiBudget * prBudget * site.capacity;
                    const syBudget = kwhBudget / site.capacity;

                    let ghiActual: number | null = null;
                    let prActual: number | null = null;
                    let kwhActual: number | null = null;
                    let syActual: number | null = null;
                    let paeActual: number | null = null;
                    let guaranteedAvail: number = 0.99;
                    let actualAvail: number | null = null;
                    let note = "";
                    let estLoss: number | null = null;
                    let modTemp: number | null = null;
                    let curtailment: number | null = null;

                    if (!isFuture) {
                        const weather = Math.random() > 0.2 ? 0.9 + (Math.random() * 0.2) : 0.4 + (Math.random() * 0.4);
                        ghiActual = ghiBudget * weather;
                        
                        const ambient = 25 + (seasonality * -10);
                        const tempRise = ghiActual * 5; 
                        modTemp = ambient + tempRise;

                        let prNoise = 0.95 + (Math.random() * 0.07);
                        actualAvail = 0.995 + (Math.random() * 0.004); // Usually high

                        if (Math.random() < 0.05) {
                            curtailment = (kwhBudget * 0.1) + (Math.random() * kwhBudget * 0.2); 
                            if (curtailment < 50) curtailment = 0;
                            if (curtailment > 0) note = "Grid Curtailment";
                        } else {
                            curtailment = 0;
                        }

                        if (Math.random() < 0.02) {
                            const issueIdx = Math.floor(Math.random() * issues.length);
                            note = issues[issueIdx];
                            prNoise = 0.4 + (Math.random() * 0.3);
                            // Drop availability if issue
                            actualAvail = 0.7 + (Math.random() * 0.2);
                        }

                        const tempLoss = 1 - (0.0029 * (modTemp - 25));
                        prActual = prBudget * prNoise * tempLoss;
                        if (prActual > 0.99) prActual = 0.99;

                        const potentialEnergy = ghiActual * prActual * site.capacity;
                        kwhActual = potentialEnergy - (curtailment || 0);
                        if (kwhActual < 0) kwhActual = 0;

                        paeActual = kwhActual * (0.98 + (Math.random() * 0.01));

                        if (ghiActual > 0) {
                            prActual = kwhActual / (ghiActual * site.capacity);
                        }
                        syActual = kwhActual / site.capacity;
                        
                        if (note && !curtailment) {
                           const hypotheticalPr = prBudget * 0.95; 
                           const hypotheticalKwh = ghiActual * hypotheticalPr * site.capacity;
                           estLoss = Math.max(0, hypotheticalKwh - kwhActual);
                        }
                    }

                    rows.push([
                        format(currentDate, 'yyyy-MM-dd'),
                        site.name,
                        site.capacity,
                        site.inv,
                        site.bess,
                        ghiBudget.toFixed(3),
                        ghiActual !== null ? ghiActual.toFixed(3) : null,
                        kwhBudget.toFixed(2),
                        kwhActual !== null ? kwhActual.toFixed(2) : null,
                        prBudget.toFixed(4),
                        correctedPrBudget.toFixed(4),
                        contractorPrTarget.toFixed(4),
                        prActual !== null ? prActual.toFixed(4) : null,
                        paeActual !== null ? paeActual.toFixed(2) : null,
                        guaranteedAvail.toFixed(3), // Guaranteed Avail
                        actualAvail !== null ? actualAvail.toFixed(3) : null, // Actual Avail
                        syBudget.toFixed(3),
                        syActual !== null ? syActual.toFixed(3) : null,
                        note,
                        estLoss !== null ? estLoss.toFixed(0) : null,
                        modTemp !== null ? modTemp.toFixed(1) : null,
                        curtailment !== null ? curtailment.toFixed(2) : null,
                        site.bess > 0 ? bessMode : "",
                        site.cod
                    ]);
                }
            });

            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            ws['!cols'] = [
                { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
                { wch: 15 }, { wch: 15 }, 
                { wch: 15 }, { wch: 15 }, 
                { wch: 12 }, { wch: 22 }, { wch: 22 }, { wch: 12 }, 
                { wch: 15 }, // PAE
                { wch: 22 }, { wch: 22 }, // Avail
                { wch: 15 }, { wch: 15 },
                { wch: 30 }, { wch: 15 },
                { wch: 15 }, { wch: 15 },
                { wch: 20 }, { wch: 15 }
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Mock_Extended_v4");
            XLSX.writeFile(wb, "Solar_Mock_Data_Extended_v4.xlsx");
        } catch (e) {
            console.error(e);
            setError("Failed to generate mock data.");
        } finally {
            setIsLoading(false);
        }
    }, 100);
  };

  const processFile = (file: File) => {
    setIsLoading(true);
    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<RawRow>(sheet);
        
        if (jsonData.length === 0) {
            setError("The uploaded file appears to be empty.");
            setIsLoading(false);
            return;
        }

        onDataLoaded(jsonData);
      } catch (err) {
        console.error(err);
        setError("Failed to parse the file. Please ensure it is a valid Excel file.");
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading the file.");
      setIsLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'}
        `}
      >
        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
          {isLoading ? (
             <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          ) : (
             <FileSpreadsheet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isLoading ? "Processing..." : "Upload Solar Data"}
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm text-sm">
          Drag and drop your Excel file here, or click to browse.
        </p>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
          Browse Files
        </button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            <Download className="w-4 h-4 mr-2" />
            Template (with System Specs)
        </button>
        <button 
            onClick={generateMockData}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
            <Database className="w-4 h-4 mr-2" />
            Mock Data (Specs)
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800 flex items-center">
            <span className="font-semibold mr-2">Error:</span> {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;