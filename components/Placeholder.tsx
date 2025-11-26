
import React from 'react';

const Placeholder: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full bg-card p-6 rounded-lg shadow">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2.25 2.25 0 00-2.242-2.242H6.814a2.25 2.25 0 00-2.242 2.242v1.5a2.25 2.25 0 002.242 2.242h10.372a2.25 2.25 0 002.242-2.242v-1.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9.75v1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12h1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12h1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.343 6.343l1.06 1.06" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.597 16.597l1.06 1.06" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.343 17.657l1.06-1.06" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.597 7.403l1.06-1.06" />
        </svg>

        <h3 className="mt-2 text-lg font-medium text-text-main">Feature Under Construction</h3>
        <p className="mt-1 text-sm text-text-light">
          This page is currently being developed. Check back soon for updates!
        </p>
      </div>
    </div>
  );
};

export default Placeholder;
