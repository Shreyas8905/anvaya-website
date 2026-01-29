import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left: College & Department Info */}
          <div className="flex-1">
            <Link to="/" className="block">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                St. Joseph Engineering College
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Department of Computer Science & Engineering
              </p>
            </Link>
          </div>

          {/* Right: Logos */}
          <div className="flex items-center space-x-4">
            {/* Placeholder for logos - Replace with actual logo images */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold">
                SJEC
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center text-white font-bold">
                CSE
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                Anvaya
              </div>
            </div>
            
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold">
                SJEC
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center text-white font-bold">
                CSE
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                Anvaya
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
