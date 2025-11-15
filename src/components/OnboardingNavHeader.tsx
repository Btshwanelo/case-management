import React, { useState } from 'react';
import { UserPen, LogOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Logo from '@/assets/logo-black.png';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '@/slices/authSlice';
import ProfileResetModal from './ProfileResetModal';

interface NavHeaderProps {
  showCompleteLater?: boolean;
  hideReset?: boolean;
  logoAlt?: string;
  logoHeight?: string;
  children?: React.ReactNode;
  className?: string;
}

const OnboardingNavHeader = ({
  showCompleteLater = true,
  hideReset = false,
  logoAlt = 'Logo',
  logoHeight = 'h-8',
  children,
  className = '',
}: NavHeaderProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleCompleteLater = () => {
    dispatch(clearAuthData());
    navigate('/login');
  };
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <nav className={`md:block border-b bg-white border-orange-500 shadow-sm ${className}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <img src={Logo} alt={logoAlt} className={logoHeight} />
        {children}
        <div className="flex items-center gap-3">
          {!hideReset && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                    size="sm"
                    onClick={() => setShowResetModal(true)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    <span className="font-medium">Reset Profile</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>I'm not a landlord, I'm a student</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {showCompleteLater && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200"
              onClick={handleCompleteLater}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              <span className="font-medium">Complete Later</span>
            </Button>
          )}
        </div>
      </div>

      {showResetModal && (
        <ProfileResetModal isOpen={showResetModal} onCancell={(e) => setShowResetModal(e)} onOpenChange={(e) => setShowResetModal(false)} />
      )}
    </nav>
  );
};

export default OnboardingNavHeader;
