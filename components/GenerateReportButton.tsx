import React from 'react';

interface GenerateReportButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({ onClick, isLoading }) => {
  return (
    <div className="flex justify-center mb-6 animate-fade-in">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`relative w-full sm:w-auto px-8 py-4 text-white font-bold rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center gap-3 group overflow-hidden ${
          isLoading
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 cursor-not-allowed animate-pulse'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25'
        }`}
      >
        {/* Background Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Ripple Effect */}
        {!isLoading && (
          <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30 group-hover:animate-ping" />
        )}
        
        {isLoading ? (
          <>
            {/* Enhanced Loading Animation */}
            <div className="relative">
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {/* Outer Ring */}
              <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping" />
            </div>
            
            {/* Typing Effect Text */}
            <div className="flex items-center gap-2">
              <span className="relative z-10">Generating Report</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Report Icon */}
            <svg className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            
            <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-300">
              Generate Medical Report
            </span>
            
            {/* Arrow Icon */}
            <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
};