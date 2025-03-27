import React from 'react';
import { Pagination } from 'react-bootstrap';

const PaginationComponent = ({ currentPage, totalPages, handleClick }) => {
  return (
    <Pagination>
      {/* Previous Button */}
      <Pagination.Prev 
        onClick={() => handleClick(currentPage > 1 ? currentPage - 1 : 1)} 
        disabled={currentPage === 1}
      />

      {/* First Page */}
      <Pagination.Item 
        active={currentPage === 1} 
        onClick={() => handleClick(1)}
      >
        1
      </Pagination.Item>

      {/* Ellipsis before current page */}
      {currentPage > 3 && <Pagination.Ellipsis />}

      {/* Previous Page */}
      {currentPage > 2 && (
        <Pagination.Item 
          active={false} 
          onClick={() => handleClick(currentPage - 1)}
        >
          {currentPage - 1}
        </Pagination.Item>
      )}

      {/* Current Page */}
      {currentPage > 1 && currentPage < totalPages && (
        <Pagination.Item 
          active={true} 
          onClick={() => handleClick(currentPage)}
        >
          {currentPage}
        </Pagination.Item>
      )}

      {/* Next Page */}
      {currentPage < totalPages - 1 && (
        <Pagination.Item 
          active={false} 
          onClick={() => handleClick(currentPage + 1)}
        >
          {currentPage + 1}
        </Pagination.Item>
      )}

      {/* Ellipsis after current page */}
      {currentPage < totalPages - 2 && <Pagination.Ellipsis />}

      {/* Last Page */}
      {totalPages > 1 && (
        <Pagination.Item 
          active={currentPage === totalPages} 
          onClick={() => handleClick(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      )}

      {/* Next Button */}
      <Pagination.Next 
        onClick={() => handleClick(currentPage < totalPages ? currentPage + 1 : totalPages)} 
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );
};

export default PaginationComponent;
