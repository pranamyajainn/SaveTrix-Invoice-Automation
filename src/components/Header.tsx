import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-savetrix-orange rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-200">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-savetrix-charcoal">SaveTrix</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 leading-none">Consulting</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-semibold text-savetrix-orange">Automation</a>
          <a href="#" className="text-sm font-semibold text-gray-400 hover:text-savetrix-charcoal transition-colors">Reports</a>
          <a href="#" className="text-sm font-semibold text-gray-400 hover:text-savetrix-charcoal transition-colors">Clients</a>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold">Admin User</p>
              <p className="text-[10px] text-gray-400">SaveTrix Staff</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"></div>
          </div>
        </nav>
      </div>
    </header>
  );
};
