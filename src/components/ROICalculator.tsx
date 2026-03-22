import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, DollarSign, Clock, IndianRupee } from 'lucide-react';

export const ROICalculator: React.FC = () => {
  const [invoicesPerWeek, setInvoicesPerWeek] = React.useState(40);
  const [manualMinutes, setManualMinutes] = React.useState(8);
  const [hourlyCost, setHourlyCost] = React.useState(300);

  const weeklyHoursSaved = (invoicesPerWeek * manualMinutes) / 60;
  const monthlyHoursSaved = weeklyHoursSaved * 4.33;
  const monthlySavings = monthlyHoursSaved * hourlyCost;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-savetrix-charcoal p-10 rounded-[40px] text-white shadow-2xl shadow-savetrix-orange/10 border border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-12 opacity-5">
        <TrendingUp size={200} />
      </div>

      <div className="relative z-10 space-y-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-savetrix-orange font-bold uppercase tracking-[0.2em] text-xs">
            <TrendingUp size={16} /> Business Impact Analysis
          </div>
          <h2 className="text-4xl font-bold tracking-tight">The Revelation.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Invoices / Week</label>
            <div className="relative">
              <input 
                type="number" 
                value={invoicesPerWeek}
                onChange={(e) => setInvoicesPerWeek(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold text-savetrix-orange focus:outline-none focus:border-savetrix-orange transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Minutes / Invoice</label>
            <div className="relative">
              <input 
                type="number" 
                value={manualMinutes}
                onChange={(e) => setManualMinutes(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold text-savetrix-orange focus:outline-none focus:border-savetrix-orange transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Staff Cost (₹/hr)</label>
            <div className="relative">
              <input 
                type="number" 
                value={hourlyCost}
                onChange={(e) => setHourlyCost(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold text-savetrix-orange focus:outline-none focus:border-savetrix-orange transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center space-y-4">
          <p className="text-2xl font-medium leading-relaxed">
            You save <span className="text-savetrix-orange font-bold">{weeklyHoursSaved.toFixed(1)} hours/week</span> · 
            <span className="text-savetrix-orange font-bold"> {monthlyHoursSaved.toFixed(1)} hours/month</span> · 
            approximately <span className="text-savetrix-orange font-bold">₹{Math.round(monthlySavings).toLocaleString()}</span> in staff time per month.
          </p>
        </div>

        <div className="pt-6">
          <p className="text-gray-500 text-sm font-medium italic">
            * Calculations based on real-time user inputs and industry standard efficiency metrics.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
