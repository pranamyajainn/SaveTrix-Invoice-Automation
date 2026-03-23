/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from './components/Header';
import { InvoiceUploader } from './components/InvoiceUploader';
import { ExtractionForm } from './components/ExtractionForm';
import { ChatAssistant } from './components/ChatAssistant';
import { HistoryLog } from './components/HistoryLog';
import { InvoiceData, ExtractionRecord } from './types';
import { extractInvoiceData } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { TimeSavedCard } from './components/TimeSavedCard';
import { ROICalculator } from './components/ROICalculator';
import { Loader2, ArrowLeft, FileText, LayoutDashboard, History, Settings, LogOut, Zap, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [currentImage, setCurrentImage] = React.useState<string | null>(null);
  const [currentMimeType, setCurrentMimeType] = React.useState<string>('');
  const [extractedData, setExtractedData] = React.useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [extractionTime, setExtractionTime] = React.useState<number>(0);
  const [hasExtractedOnce, setHasExtractedOnce] = React.useState(() => {
    const saved = localStorage.getItem('savetrix_has_extracted');
    return saved === 'true';
  });
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'history'>('dashboard');
  const [history, setHistory] = React.useState<ExtractionRecord[]>(() => {
    const saved = localStorage.getItem('savetrix_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('savetrix_sidebar_collapsed');
    return saved === 'true';
  });

  React.useEffect(() => {
    localStorage.setItem('savetrix_history', JSON.stringify(history));
  }, [history]);

  React.useEffect(() => {
    localStorage.setItem('savetrix_sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleUpload = async (file: File, base64: string) => {
    setCurrentImage(base64);
    setCurrentMimeType(file.type);
    setIsLoading(true);
    setExtractedData(null);
    const startTime = performance.now();

    try {
      const data = await extractInvoiceData(base64, file.type);
      const endTime = performance.now();
      setExtractionTime((endTime - startTime) / 1000);
      setExtractedData(data);
      if (!hasExtractedOnce) {
        setHasExtractedOnce(true);
        localStorage.setItem('savetrix_has_extracted', 'true');
      }
    } catch (error) {
      console.error(error);
      alert("Failed to extract data. Please try again with a clearer image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedData || !currentImage) return;

    const record: ExtractionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      imageUrl: currentImage,
      data: extractedData,
      status: 'confirmed'
    };

    setHistory(prev => [record, ...prev]);
    setExtractedData(null);
    setCurrentImage(null);
  };

  const handleExport = () => {
    if (!extractedData) return;

    const escape = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [];
    rows.push(["Summary"].join(","));
    rows.push(["Vendor", "Invoice #", "Date", "Due Date", "Subtotal", "Tax", "Total", "Currency"].map(escape).join(","));
    rows.push([
      extractedData.vendorName,
      extractedData.invoiceNumber,
      extractedData.invoiceDate,
      extractedData.dueDate,
      extractedData.subtotal,
      extractedData.taxAmount,
      extractedData.totalAmount,
      extractedData.currency
    ].map(escape).join(","));

    rows.push("");

    if (extractedData.lineItems && extractedData.lineItems.length > 0) {
      rows.push(["Line Items"].join(","));
      rows.push(["Description", "Quantity", "Unit Price", "Amount"].map(escape).join(","));
      extractedData.lineItems.forEach(item => {
        rows.push([
          item.description,
          item.quantity,
          item.unitPrice,
          item.amount
        ].map(escape).join(","));
      });
    }

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${extractedData.invoiceNumber || 'export'}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const viewHistoryRecord = (record: ExtractionRecord) => {
    setExtractedData(record.data);
    setCurrentImage(record.imageUrl);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-[60px]' : 'w-64'} bg-savetrix-charcoal flex flex-col fixed h-full z-20 transition-all duration-250 ease-in-out`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-8 bg-savetrix-orange text-white p-1 rounded-full shadow-lg z-30 hover:scale-110 transition-transform"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-8 ${isSidebarCollapsed ? 'px-2.5' : 'p-8'} transition-all`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/shapes/svg?seed=savetrix" alt="SaveTrix Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-2xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden">SaveTrix</span>
            )}
          </div>
        </div>

        <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'} space-y-2 mt-4 transition-all`}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-savetrix-orange text-white shadow-lg shadow-savetrix-orange/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title={isSidebarCollapsed ? "Dashboard" : ""}
          >
            <LayoutDashboard size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold whitespace-nowrap overflow-hidden">Dashboard</span>}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-savetrix-orange text-white shadow-lg shadow-savetrix-orange/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title={isSidebarCollapsed ? "History" : ""}
          >
            <History size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold whitespace-nowrap overflow-hidden">History</span>}
          </button>
          <button 
            className={`w-full flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all`}
            title={isSidebarCollapsed ? "Settings" : ""}
          >
            <Settings size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold whitespace-nowrap overflow-hidden">Settings</span>}
          </button>
        </nav>

        <div className={`${isSidebarCollapsed ? 'p-2' : 'p-6'} border-t border-white/5 transition-all`}>
          {!isSidebarCollapsed && (
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 text-savetrix-orange mb-2">
                <ShieldCheck size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Enterprise Plan</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Precision You Can Trust. Unlimited extractions enabled.</p>
            </div>
          )}
          <button 
            className={`w-full flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all`}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="font-semibold whitespace-nowrap overflow-hidden">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-[60px]' : 'ml-64'} min-h-screen transition-all duration-250 ease-in-out`}>
        <div className="max-w-6xl mx-auto p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'history' ? (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h1 className="text-4xl font-bold tracking-tight">Extraction History</h1>
                <HistoryLog records={history} onView={viewHistoryRecord} />
              </motion.div>
            ) : !currentImage ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold tracking-tight leading-tight">
                    Intelligent Invoice <br />
                    <span className="text-savetrix-orange">Processing.</span>
                  </h1>
                  <p className="text-xl text-gray-500 max-w-2xl">
                    Upload your financial documents and let our AI extract every detail with surgical precision. 
                    Built for high-volume B2B operations.
                  </p>
                </div>

                <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-black/5 border border-gray-100">
                  <InvoiceUploader onUpload={handleUpload} isLoading={isLoading} />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-16"
              >
                <div className="space-y-8">
                  <button 
                    onClick={() => { setCurrentImage(null); setExtractedData(null); }}
                    className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-savetrix-orange transition-all"
                  >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                    New Extraction
                  </button>

                  <div className="relative bg-white rounded-[32px] shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-savetrix-orange/10 z-10">
                      {isLoading && <div className="h-full bg-savetrix-orange animate-scan absolute w-full" />}
                    </div>
                    
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <FileText className="text-savetrix-orange" size={20} />
                        <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Document Preview</span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                      </div>
                    </div>

                    <div className="aspect-[3/4] bg-white flex items-center justify-center overflow-hidden relative">
                      {currentMimeType === 'application/pdf' ? (
                        <div className="flex flex-col items-center gap-6 text-gray-300">
                          <FileText size={80} strokeWidth={1} />
                          <p className="font-bold uppercase tracking-widest text-xs">PDF Document</p>
                        </div>
                      ) : currentMimeType.includes('spreadsheet') || currentMimeType.includes('excel') || currentMimeType.includes('csv') ? (
                        <div className="flex flex-col items-center gap-6 text-gray-300">
                          <div className="relative">
                            <FileText size={80} strokeWidth={1} />
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
                              <Zap size={16} fill="currentColor" />
                            </div>
                          </div>
                          <p className="font-bold uppercase tracking-widest text-xs">Spreadsheet Data</p>
                        </div>
                      ) : (
                        <img src={currentImage || ''} alt="Invoice" className="w-full h-full object-contain" />
                      )}
                      
                      {isLoading && (
                        <div className="absolute inset-0 bg-savetrix-orange/5 backdrop-blur-[1px] flex flex-col items-center justify-center">
                          <div className="w-full h-1 bg-savetrix-orange shadow-[0_0_15px_rgba(232,101,26,0.5)] absolute animate-scan" />
                          <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
                            <Loader2 className="animate-spin text-savetrix-orange" size={20} />
                            <span className="font-bold text-sm uppercase tracking-widest">AI Reading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {extractedData && !isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {/* ChatAssistant moved to root */}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-12">
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-8 py-32">
                      <div className="relative">
                        <Loader2 size={64} className="animate-spin text-savetrix-orange opacity-20" />
                        <Loader2 size={64} className="animate-spin text-savetrix-orange absolute top-0 left-0" style={{ animationDuration: '3s' }} />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-bold tracking-tight">Analyzing Data Structure</p>
                        <p className="text-gray-400 font-medium">Gemini Vision is mapping financial fields...</p>
                      </div>
                    </div>
                  ) : extractedData && (
                    <div className="space-y-8">
                      <ExtractionForm 
                        data={extractedData} 
                        onChange={setExtractedData}
                        onConfirm={handleConfirm}
                        onExport={handleExport}
                      />
                      
                      <TimeSavedCard extractionTimeSeconds={extractionTime} />
                      
                      {hasExtractedOnce && (
                        <div className="pt-8">
                          <ROICalculator />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <ChatAssistant invoiceData={extractedData} />
    </div>
  );
}
