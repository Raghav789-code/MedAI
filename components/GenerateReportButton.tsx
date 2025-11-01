import React from 'react';

interface GenerateReportButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({ onClick, isLoading }) => {
  return (
    <div className="flex justify-center mb-4">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="w-full sm:w-auto px-6 py-3 bg-brand-green-dark text-white font-semibold rounded-lg shadow-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating Report...</span>
          </>
        ) : (
          <span>Generate Doctor's Report</span>
        )}
      </button>
    </div>
  );
};