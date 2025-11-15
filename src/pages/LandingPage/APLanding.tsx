import React, { useEffect, useState } from 'react';
import { Home, ChevronRight, ChevronLeft, Bell, Building, FileText, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { FileTerminal, Briefcase, Users, Search, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import BackgroundImageLayout from '@/layouts/BackgroundImageLayout';
import JumpingCard from '@/components/MenuCard';
import AnnouncementsComponent from '@/components/Announcement';
import ProfileResetModal from '@/components/ProfileResetModal';

export default function APLandingPage({ userDetails, navigation }) {
  const Announcements = useSelector((state: RootState) => state.announcements.announcements);
  const [showResetModal, setShowResetModal] = useState(false);

  const navigate = useNavigate();

  const filteredNav = navigation.filter((item) => item.placementText === 'Bottom' || item.placementText === 'Top & Bottom');
  const appointmentCard = {
    navigate: '/appointment',
    title: 'Events',
    subTitle: null,
    type: 'Normal',
    icon: 'fa-solid fa-file-invoice',
    svgIcon: null,
    notification: 10,
    placement: 1095,
    placementText: 'Top & Bottom',
  };

  // const filteredNav = [
  //   ...navigation.filter((item) => item.placementText === 'Bottom' || item.placementText === 'Top & Bottom'),
  //   appointmentCard,
  // ];

  const getIcon = (title) => {
    const iconMap = {
      'My Residence': Home,
      'Offer Letters': FileText,
      '2024 Accomodations': Building,
      'My Applications': FileTerminal,
      'My Cases': Briefcase,
      'Check In': Users,
      'Student Search': Search,
      'Reset Profile': UserX,
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

  return (
    <BackgroundImageLayout data-testid="ap-landing-layout">
      {/* Main Content */}
      <div className=" space-y-4 " data-testid="ap-landing-main-content">
        {showResetModal && (
          <ProfileResetModal isOpen={showResetModal} onCancell={(e) => setShowResetModal(e)} data-testid="ap-landing-reset-modal" />
        )}

        {/* Welcome Section */}
        <div className="space-y-2 max-w-3xl" data-testid="ap-landing-welcome-section">
          <h1 className="text-2xl font-bold" data-testid="ap-landing-welcome-title">
            {userDetails.aPtype === 'Individual'
              ? `${userDetails.firstName != null ? userDetails.firstName : ''} ${userDetails.lastName != null ? userDetails.lastName : ''}`
              : userDetails.name}
          </h1>
        </div>
        {/* Dashboard Grid */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6" data-testid="ap-landing-dashboard-grid">
          {/* Menu Items */}
          <div className="w-full lg:w-[70%] content-center bg-orange-100/50 rounded-lg p-4 sm:p-6" data-testid="ap-landing-menu-section">
            {/* <h2 className="text-xl text-white font-bold mb-4">Menu Items</h2> */}
            <div className="flex flex-wrap justify-center items-stretch gap-3 sm:gap-4 lg:gap-6" data-testid="ap-landing-menu-grid">
              {filteredNav.map((item, index) => {
                const IconComponent = getIcon(item.title);
                const isTypeReset = item.type === 'Reset' ? true : false;
                return (
                  <JumpingCard
                    key={index}
                    IconComponent={IconComponent}
                    title={item?.title}
                    subTitle={item?.subTitle}
                    // onNavigate={() => navigate(item.navigate)}
                    onNavigate={() => (isTypeReset ? setShowResetModal(true) : navigate(item.navigate))}
                    isCheckingType={false}
                    iSignLeaseType={false}
                    isTypeReset={isTypeReset}
                    data-testid={`ap-landing-menu-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                );
              })}
            </div>
          </div>
          {/* Announcements */}
          {Announcements.length > 0 && (
            <div className="w-full lg:w-[30%]" data-testid="ap-landing-announcements-section">
              <AnnouncementsComponent data-testid="ap-landing-announcements-component" />
            </div>
          )}
        </div>
      </div>
    </BackgroundImageLayout>
  );
}
