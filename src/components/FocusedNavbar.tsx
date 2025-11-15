import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button'; // Assuming you're using shadcn/ui
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/logo-black.png';

const FocusedNavbar = ({ homeUrl = '/', closeUrl = '/' }) => {
  // Default navigation handler if onNavigate isn't provided
  const navigate = useNavigate();
  const handleNavigation = (url) => {
    navigate(url);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={Logo} alt={'Logo'} className="h-8" onClick={() => handleNavigation(homeUrl)} />
          </div>

          <Button variant="ghost" size="icon" onClick={() => handleNavigation(closeUrl)} className="rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default FocusedNavbar;
