import React, { useState } from 'react';

interface UploadSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const UploadSection: React.FC<UploadSectionProps> = ({ title, description, icon }) => {
  const [files, setFiles] = useState<{ name: string; size: string; date: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Added explicit type casting (f: any) to handle File objects from FileList and resolve unknown property errors
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: any) => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        date: new Date().toLocaleDateString()
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 p-8 flex flex-col gap-6 hover:border-emerald-500/30 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-outfit font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); /* Simple Drop Sim */ }}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 hover:border-white/10 bg-white/5'
        }`}
      >
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleUpload}
          multiple
        />
        <svg className="w-8 h-8 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click or drag to upload</span>
        <span className="text-[10px] text-slate-600 mt-1 uppercase">PDF, DOCX, TXT (Max 10MB)</span>
      </div>

      {files.length > 0 && (
        <div className="space-y-3 mt-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 group/file">
              <div className="flex items-center gap-3 min-w-0">
                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{file.size} • {file.date}</p>
                </div>
              </div>
              <button 
                onClick={() => removeFile(idx)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-file-hover:opacity-100"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BrandLLM: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6 lg:p-10 animate-in fade-in duration-700">
      <div className="flex flex-col mb-12">
        <h2 className="text-4xl font-outfit font-bold text-white tracking-tight">
          Brand <span className="text-emerald-400">LLM</span>
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Configure the core knowledge and constraints of your AI Scout. Uploaded documents are processed into our vector engine to ensure the Message Builder aligns with your corporate standards and testing methodologies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <UploadSection 
          title="Compliance" 
          description="Legal disclaimers, gambling regulations, and financial disclosure requirements."
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <UploadSection 
          title="Brand Guidelines" 
          description="Tone of voice, stylistic preferences, emoji usage policies, and brand identity."
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          }
        />
        <UploadSection 
          title="Testing Guidelines" 
          description="Methodologies for statistical analysis and performance validation protocols."
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.346a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.168 1.168a2 2 0 00.556 3.212 9.035 9.035 0 007.146 0 2 2 0 00.556-3.212l-1.168-1.168z" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default BrandLLM;