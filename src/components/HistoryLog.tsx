import React from 'react';
import { ExtractionRecord } from '../types';
import { Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface Props {
  records: ExtractionRecord[];
  onView: (record: ExtractionRecord) => void;
}

export const HistoryLog: React.FC<Props> = ({ records, onView }) => {
  if (records.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-bold flex items-center gap-2">
          <Clock size={18} className="text-gray-400" />
          Extraction History
        </h3>
      </div>
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {records.map((record) => (
          <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-100">
                <img src={record.imageUrl} alt="Invoice" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-sm">{record.data?.vendorName || 'Unknown Vendor'}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{new Date(record.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span className="font-medium">{record.data?.totalAmount} {record.data?.currency}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {record.status === 'confirmed' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded uppercase">
                  <CheckCircle size={10} /> Confirmed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded uppercase">
                  <AlertCircle size={10} /> Pending
                </span>
              )}
              <button 
                onClick={() => onView(record)}
                className="p-2 text-gray-400 hover:text-savetrix-orange hover:bg-orange-50 rounded-lg transition-all"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
