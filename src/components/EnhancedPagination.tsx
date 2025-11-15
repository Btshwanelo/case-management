import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { MoreHorizontal } from 'lucide-react';

const EnhancedPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  setLoaderType = () => {
    console.log('pagination');
  }, // Optional loader type setter
}) => {
  // Show first page, last page, current page, and 1 page before and after current
  const getPageNumbers = () => {
    const delta = 1; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];

    // Always include page 1
    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Always include last page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add pages to final array with dots where needed
    let l = null;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          // If gap is 2, add the middle page
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          // If gap is larger than 2, add ellipsis
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page !== '...') {
      setLoaderType('pagination');
      onPageChange(page);
    }
  };

  return (
    <Pagination>
      <PaginationContent className="">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="cursor-pointer"
          />
        </PaginationItem>

        {getPageNumbers().map((pageNum, index) => (
          <PaginationItem key={`${pageNum}-${index}`}>
            {pageNum === '...' ? (
              <span className="px-4 py-2">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <PaginationLink onClick={() => handlePageChange(pageNum)} isActive={currentPage === pageNum} className="cursor-pointer">
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="cursor-pointer"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default EnhancedPagination;
