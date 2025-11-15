import React, { useEffect, useState } from 'react';
import { Home, ChevronRight, ChevronLeft, Bell, Building, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { FileTerminal, Briefcase, Users, Search, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import BackgroundImageLayout from '@/layouts/BackgroundImageLayout';
import JumpingCard from '@/components/MenuCard';
import { useGetCurrentUserMutation } from '@/services/apiService';
import { updateNavigation } from '@/slices/detailsSlice';
import SignWellWindow from '@/components/SignWellWindow';
import { showMessageToast } from '@/components/MessageToast';
import EzraSignModal from '@/components/SignWellWindow/EzraSignModal';
import AnnouncementsComponent from '@/components/Announcement';

export default function StudentLandingPage({ userDetails, navigation }: any) {
  const Announcements = useSelector((state: RootState) => state.announcements.announcements);
  const QuickActions = useSelector((state: RootState) => state.quickActions.quickActions);
  const authDetails = useSelector((state: RootState) => state.auth);
  const [signWellUrl, setSignWellUrl] = useState('');
  const [showSignWellWindow, setShowSignWellWindow] = useState(false);
  const [
    getCurrentUser,
    { isLoading: isLoadingCurrentUser, isSuccess: isSuccessCurrentUser, isError: isErrorCurrentUser, data: CurrentUser },
  ] = useGetCurrentUserMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const filteredNav = navigation.filter((item: any) => item.placementText === 'Bottom' || item.placementText === 'Top & Bottom');

  const getIcon = (title: any) => {
    const iconMap: any = {
      'My Residence': Home,
      'Offer Letters': FileText,
      '2024 Accomodations': Building,
      'My Applications': FileTerminal,
      'My Cases': Briefcase,
      'Check In': Users,
      'Student Search': Search,
    };
    const IconComponent = iconMap[title] || Home;
    return IconComponent;
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [currentSlide]);

  useEffect(() => {
    getCurrentUser({
      body: {
        entityName: 'ExternalLogon',
        requestName: 'RetrieveCurrentUser',
        inputParamters: {
          ExternalLogonId: authDetails.user.externalLogonId,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (isSuccessCurrentUser) {
      dispatch(updateNavigation(CurrentUser.navigation));
      // dispatch(updateProfileComplete(true));
      // dispatch(updateRequestResults(CurrentUser.requestResults));
    }
  }, [isSuccessCurrentUser]);

  const handlePrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? Announcements.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === Announcements.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleSignLease = (url: any) => {
    if (url.navigate === null || url.navigate === '') {
      showMessageToast(
        `Your lease is being prepared! You'll receive an email with the lease document shortly. You can also check back here in a few minutes to sign it directly.`
      );
      return;
    }
    setSignWellUrl(url.navigate);
    setShowSignWellWindow(true);
  };

  return (
    <BackgroundImageLayout data-testid="student-landing-layout">
      {/* Main Content */}
      <div className=" space-y-4 " data-testid="student-landing-main-content">
        {/* Welcome Section */}
        <div className="space-y-2 max-w-3xl" data-testid="student-landing-welcome-section">
          <h1 className="text-2xl font-bold" data-testid="student-landing-welcome-title">{`${userDetails.name} `}</h1>
        </div>

        {/* Dashboard Grid */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6" data-testid="student-landing-dashboard-grid">
          {/* Menu Items - Full width on mobile, left side on desktop */}
          <div
            className="w-full lg:w-[70%] bg-orange-100/50 content-center rounded-lg p-4 sm:p-6"
            data-testid="student-landing-menu-section"
          >
            {/* Mobile: 2x3 grid, Desktop: 4x2 grid */}
            <div className="flex flex-wrap justify-center items-stretch gap-3 sm:gap-4 lg:gap-6" data-testid="student-landing-menu-grid">
              {filteredNav.map((item: any, index: any) => {
                const IconComponent = getIcon(item.title);
                const isCheckingType = item.type === 'Viewing' ? true : false;
                const iSignLeaseType = item.type === 'SignLease' ? true : false;
                return (
                  <JumpingCard
                    key={index}
                    IconComponent={IconComponent}
                    title={item?.title}
                    subTitle={item?.subTitle}
                    onNavigate={() => (iSignLeaseType ? handleSignLease(item) : navigate(item.navigate))}
                    isCheckingType={isCheckingType}
                    iSignLeaseType={iSignLeaseType}
                    isTypeReset={false}
                    data-testid={`student-landing-menu-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Announcements - Below grid on mobile, right side on desktop */}
          {Announcements.length > 0 && (
            <div className="w-full lg:w-[30%]" data-testid="student-landing-announcements-section">
              <AnnouncementsComponent data-testid="student-landing-announcements-component" />
            </div>
          )}
        </div>
        {showSignWellWindow && (
          <SignWellWindow
            show={showSignWellWindow}
            url={signWellUrl}
            onClose={() => {
              setShowSignWellWindow(false);
              window.location.reload();
              // setSignWellUrl('');
              // setSignwellAction('');
            }}
            data-testid="student-landing-signwell-window"
          />

          //  <EzraSignModal
          //   show={showSignWellWindow}
          //     url={signWellUrl}
          //     onClose={() => {
          //       setShowSignWellWindow(false);
          //       window.location.reload();
          //       // setSignWellUrl('');
          //       // setSignwellAction('');
          //     }}
          // />
        )}
      </div>
    </BackgroundImageLayout>
  );
}
