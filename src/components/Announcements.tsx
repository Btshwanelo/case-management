import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import AnnoumnentImg from '@/assets/announcement-2.jpg';
interface Announcement {
  title: string;
  content: string;
}

const AnnouncementsComponent = () => {
  const announcements: Announcement[] = [];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    if (announcements.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === announcements.length - 1 ? 0 : prevIndex + 1));
    }, 10000); // 10 seconds

    return () => clearInterval(timer);
  }, [announcements.length]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? announcements.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === announcements.length - 1 ? 0 : prevIndex + 1));
  };

  if (announcements.length === 0) {
    return (
      <div className="w-full mx-auto bg-white rounded-md h-full">
        <img src={AnnoumnentImg} alt="NSFAS" className="rounded-md w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-4 rounded-md h-full">
      <Card className="w-full">
        <CardHeader>
          {/* <CardTitle className="text-xl font-semibold">
            Announcements
          </CardTitle> */}
        </CardHeader>
        <CardContent className="min-h-[150px] flex flex-col justify-between">
          <div key={currentIndex} className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-medium">{announcements[currentIndex].title}</h3>
            <p className="text-gray-600">{announcements[currentIndex].content}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" size="icon" className="border-gray-700" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-black font-semibold">
          {currentIndex + 1} of {announcements.length}
        </span>
        <Button variant="outline" size="icon" className="border-gray-700" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AnnouncementsComponent;
