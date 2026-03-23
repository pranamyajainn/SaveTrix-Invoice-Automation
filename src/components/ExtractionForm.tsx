import React from 'react';
import { InvoiceData, LineItem } from '../types';
import { AlertCircle, Download, Save } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { isNullLike, normalizeDate } from '../utils/dateUtils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  data: InvoiceData;
  onChange: (newData: InvoiceData) => void;
  onConfirm: () => void;
  onExport: () => void;
}

export const ExtractionForm: React.FC<Props> = ({ data, onChange, onConfirm, onExport }) => {
  const handleChange = (field: keyof InvoiceData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const newLineItems = [...data.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    onChange({ ...data, lineItems: newLineItems });
  };

  const isLowConfidence = (field: string) => (data.confidence?.[field] || 1) < 0.7;

  // Calculate overall confidence (mocked for UI if not provided, or averaged)
  const confidenceValues = data.confidence ? Object.values(data.confidence) : [0.98];
  const avgConfidence = Math.round((confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) * 100);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* Confidence Header */}
      <motion.div variants={item} className="flex items-center gap-8 bg-white p-8 rounded-[32px] shadow-2xl shadow-black/5 border border-gray-100">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * avgConfidence) / 100}
              strokeLinecap="round"
              className="text-savetrix-orange transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute text-xl font-bold tracking-tighter">{avgConfidence}%</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Extraction Confidence</h2>
          <p className="text-gray-400 font-medium">Our AI has mapped {Object.keys(data).length} data points with high surgical precision.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={item}>
          <FormField 
            label="Vendor Name" 
            value={data.vendorName} 
            onChange={(v) => handleChange('vendorName', v)}
            isWarning={isLowConfidence('vendorName')}
          />
        </motion.div>
        <motion.div variants={item}>
          <FormField 
            label="Invoice Number" 
            value={data.invoiceNumber} 
            onChange={(v) => handleChange('invoiceNumber', v)}
            isWarning={isLowConfidence('invoiceNumber')}
          />
        </motion.div>
        <motion.div variants={item}>
          <FormField 
            label="Invoice Date" 
            type="date"
            value={data.invoiceDate} 
            onChange={(v) => handleChange('invoiceDate', v)}
            isWarning={isLowConfidence('invoiceDate')}
          />
        </motion.div>
        <motion.div variants={item}>
          <FormField 
            label="Due Date" 
            type="date"
            value={data.dueDate} 
            onChange={(v) => handleChange('dueDate', v)}
            isWarning={isLowConfidence('dueDate')}
            isReceipt={data.isReceipt}
          />
        </motion.div>
        <motion.div variants={item}>
          <FormField 
            label="Currency" 
            value={data.currency} 
            onChange={(v) => handleChange('currency', v)}
            isWarning={isLowConfidence('currency')}
          />
        </motion.div>
        <motion.div variants={item}>
          <FormField 
            label="Payment Terms" 
            value={data.paymentTerms || ''} 
            onChange={(v) => handleChange('paymentTerms', v)}
            isReceipt={data.isReceipt}
          />
        </motion.div>
      </div>

      <motion.div variants={item} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Line Items</h3>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{(data.lineItems || []).length} Items Detected</span>
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 w-20">Qty</th>
                <th className="px-6 py-4 w-32">Unit Price</th>
                <th className="px-6 py-4 w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data.lineItems || []).map((item, idx) => (
                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      className={cn(
                        "w-full bg-transparent focus:ring-0 border-none p-1 font-medium text-savetrix-charcoal rounded",
                        isNullLike(item.description) && "bg-orange-50 ring-1 ring-orange-200"
                      )}
                      value={isNullLike(item.description) ? '' : item.description}
                      onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      className={cn(
                        "w-full bg-transparent focus:ring-0 border-none p-1 text-gray-500 rounded",
                        (!item.quantity || item.quantity === 0) && "bg-orange-50 ring-1 ring-orange-200"
                      )}
                      value={item.quantity || 0}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      className={cn(
                        "w-full bg-transparent focus:ring-0 border-none p-1 text-gray-500 rounded",
                        (!item.unitPrice || item.unitPrice === 0) && "bg-orange-50 ring-1 ring-orange-200"
                      )}
                      value={item.unitPrice || 0}
                      onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-savetrix-charcoal">
                    {(item.amount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-8 pt-8 border-t border-gray-100">
        <div className="flex justify-end">
          <div className="w-80 space-y-4">
            <div className="flex justify-between text-sm font-medium text-gray-400">
              <span>Subtotal</span>
              <span className="text-savetrix-charcoal">{(data.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-400">
              <span>Tax Amount</span>
              <span className="text-savetrix-charcoal">{(data.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-3xl font-bold text-savetrix-charcoal tracking-tighter pt-2 border-t border-gray-50">
              <span>Total</span>
              <span>{(data.totalAmount || 0).toFixed(2)} <span className="text-lg text-gray-300 ml-1">{data.currency || ''}</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onConfirm}
            className="w-full bg-savetrix-orange text-white py-6 rounded-[24px] font-bold text-xl shadow-2xl shadow-savetrix-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            Extract & Process <Save size={24} />
          </button>
          <button 
            onClick={onExport}
            className="w-full py-4 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-savetrix-orange transition-colors flex items-center justify-center gap-2"
          >
            <Download size={16} /> Download CSV Export
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  isWarning?: boolean;
  isReceipt?: boolean;
}

const FormField: React.FC<FieldProps> = ({ label, value, onChange, type = 'text', isWarning, isReceipt }) => {
  const [displayValue, setDisplayValue] = React.useState('');
  
  // Bug 2: Ensure date values are normalized to YYYY-MM-DD before display
  const normalizedValue = type === 'date' ? normalizeDate(value) : value;
  
  // Step 3: Null handling - if value is null-like, treat as empty string
  const safeValue = isNullLike(normalizedValue) ? '' : normalizedValue;
  const isMissing = isNullLike(normalizedValue);

  // Suppress warning for Due Date and Payment Terms if it's a receipt
  const isIrrelevantForReceipt = isReceipt && (label === 'Due Date' || label === 'Payment Terms');
  const shouldShowWarning = isIrrelevantForReceipt ? false : (isWarning || isMissing);
  const shouldShowMissingBadge = isIrrelevantForReceipt ? false : isMissing;

  // Typewriter effect
  React.useEffect(() => {
    // Bug 2: Disable typewriter for date inputs to ensure browser validation
    if (type === 'date') {
      setDisplayValue(String(safeValue || ''));
      return;
    }

    let i = 0;
    const target = String(safeValue || '');
    setDisplayValue('');
    const timer = setInterval(() => {
      if (i < target.length) {
        setDisplayValue(prev => prev + target.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [safeValue, type]);

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
        {label}
        {shouldShowWarning && <AlertCircle size={14} className={cn(isMissing ? "text-orange-400" : "text-savetrix-orange")} />}
      </label>
      <div className="relative group">
        <input 
          type={type}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isReceipt && label === 'Due Date' ? 'N/A - Receipt' : (type === 'date' ? '' : `Enter ${label}...`)}
          className={cn(
            "w-full px-6 py-4 rounded-2xl border text-lg font-bold transition-all outline-none",
            shouldShowMissingBadge
              ? "border-orange-300 bg-orange-50/30 text-savetrix-charcoal placeholder:text-orange-200"
              : (isWarning && !isReceipt) 
                ? "border-savetrix-orange/30 bg-savetrix-orange/[0.02] text-savetrix-orange animate-pulse-orange" 
                : "border-gray-100 bg-white text-savetrix-charcoal focus:border-savetrix-orange focus:shadow-xl focus:shadow-savetrix-orange/5"
          )}
        />
        {shouldShowMissingBadge && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-[10px] font-black text-orange-400 bg-orange-50 px-2 py-1 rounded uppercase tracking-widest">
              Manual Entry Req.
            </span>
          </div>
        )}
        {isWarning && !shouldShowMissingBadge && !isReceipt && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-[10px] font-black text-savetrix-orange bg-savetrix-orange/10 px-2 py-1 rounded uppercase tracking-widest">
              Low Confidence
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const FileText = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
