import React from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onUpload: (file: File, base64: string) => void;
  isLoading: boolean;
}

export const InvoiceUploader: React.FC<Props> = ({ onUpload, isLoading }) => {
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isLoading
  } as any);

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer
        flex flex-col items-center justify-center text-center space-y-4
        ${isDragActive ? 'border-savetrix-orange bg-orange-50' : 'border-gray-300 hover:border-savetrix-orange hover:bg-gray-50'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-savetrix-orange">
        <Upload size={32} />
      </div>
      <div>
        <p className="text-lg font-semibold">
          {isLoading ? 'Processing Document...' : 'Upload Invoice, Receipt or Spreadsheet'}
        </p>
        <p className="text-sm text-gray-500">
          Drag and drop your file here, or click to browse
        </p>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><FileText size={14} /> PDF</span>
        <span className="flex items-center gap-1"><FileText size={14} /> JPG / PNG</span>
        <span className="flex items-center gap-1"><FileText size={14} /> Excel / CSV</span>
      </div>
    </div>
  );
};
