import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center mt-4 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        Previous
      </button>
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
          >
            1
          </button>
          {startPage > 2 && <span className="px-4 py-2">...</span>}
        </>
      )}
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-4 py-2 border border-gray-300 rounded-md text-sm ${
            currentPage === number ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50"
          }`}
        >
          {number}
        </button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-4 py-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
