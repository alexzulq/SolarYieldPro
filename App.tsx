import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import Dashboard from './components/Dashboard';
import { parseRawData } from './utils/solarCalculations';
import { DailyData, RawRow } from './types';
import { LayoutDashboard, Moon, Sun } from 'lucide-react';
import { ThemeLanguageProvider, useThemeLanguage } from './contexts/ThemeLanguageContext';

const AppContent = () => {
  const [data, setData] = useState<DailyData[] | null>(null);
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();

  const handleDataLoaded = (rawData: RawRow[]) => {
    try {
      const cleanData = parseRawData(rawData);
      setData(cleanData);
    } catch (e) {
      console.error("Data processing failed", e);
      alert("Error processing data. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('appTitle')}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button 
                  onClick={() => setLanguage('id')} 
                  className={`px-2 py-1 text-xs rounded-md transition-all ${language === 'id' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  title="Bahasa Indonesia"
                >
                  🇮🇩 ID
                </button>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-2 py-1 text-xs rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  title="English"
                >
                  🇺🇸 EN
                </button>
                <button 
                  onClick={() => setLanguage('zh')} 
                  className={`px-2 py-1 text-xs rounded-md transition-all ${language === 'zh' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  title="Chinese"
                >
                  🇨🇳 CN
                </button>
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {!data ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                   {t('uploadTitle')}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    {t('uploadDesc')}
                </p>
             </div>
            <FileUploader onDataLoaded={handleDataLoaded} />
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-transparent dark:border-gray-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('step1')}</h3>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-transparent dark:border-gray-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('step2')}</h3>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-transparent dark:border-gray-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t('step3')}</h3>
                </div>
            </div>
          </div>
        ) : (
          <Dashboard initialData={data} onReset={() => setData(null)} />
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeLanguageProvider>
      <AppContent />
    </ThemeLanguageProvider>
  );
}

export default App;
