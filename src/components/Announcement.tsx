import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AnnoumnentImg from '@/assets/students.jpg';

const AnnouncementsComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const announcements = useSelector((state: RootState) => state.announcements.announcements);

  const totalPages = Math.ceil(announcements.length / itemsPerPage);
  const currentAnnouncement = announcements[currentPage - 1];

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const isImageType = (documentType) => {
    const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    return imageTypes.includes(documentType?.toLowerCase());
  };

  const getImageSource = (announcement) => {
    if (announcement.documentAttachment && isImageType(announcement.documentType)) {
      return announcement.url;
    }
    // Default placeholder image for non-image documents
    return AnnoumnentImg;
  };

  const handleDownload = (url) => {
    // if (currentAnnouncement.documentAttachment && currentAnnouncement.PortalURL) {
    window.open(currentAnnouncement.url, '_blank');
    // }
  };

  return (
    <div className="mx-auto bg-white rounded-xl shadow-sm h-full border">
      {/* Header */}
      <div className="px-1 py-4 border-b mb-2 mx-3">
        <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
      </div>

      {/* Announcement Card */}
      {currentAnnouncement && (
        <div className="relative">
          {/* Image Section with Overlay */}
          <div className="relative px-1 h-36 overflow-hidden">
            <img
              src={getImageSource(currentAnnouncement)}
              alt={currentAnnouncement.documentTitle}
              className="w-full h-full rounded-lg object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 mx-1 rounded-lg bg-black bg-opacity-30"></div>

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
              {currentAnnouncement.documentAttachment && (
                <div>
                  <h3 className="text-2xl font-bold mb-2 leading-6">{currentAnnouncement.documentTitle}</h3>
                  {/* <p className="text-sm opacity-90">
                  Learn more about the closing d...
                </p> */}
                </div>
              )}

              {/* Download Button */}
              {currentAnnouncement.documentAttachment && currentAnnouncement.documentType === 'pdf' && (
                <div className="flex justify-start">
                  <button
                    onClick={() => handleDownload(currentAnnouncement.url)}
                    className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
                  >
                    <span className="text-sm">Download</span>
                    <Download size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="px-4 pt-2">
            <h4 className="font-semibold text-base text-[#414651] mb-2">{currentAnnouncement.title}</h4>
            <p className="text-[#535862] text-base leading-relaxed">{currentAnnouncement.content}</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-lg px-2 py-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-[#D5D7DA] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>

        <span className="text-sm text-[#414651] font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-[#D5D7DA] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} className="text-black font-medium" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementsComponent;
