import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 4);
  let endPage = Math.min(totalPages, startPage + 9);

  if (endPage - startPage < 9) {
    startPage = Math.max(1, endPage - 9);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-4">
      <ul className="flex space-x-2">
        {currentPage > 1 && (
          <>
            <li>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                &lt;&lt;
              </button>
            </li>
            <li>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Previous
              </button>
            </li>
          </>
        )}
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`px-3 py-1 rounded ${
                currentPage === number
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {number}
            </button>
          </li>
        ))}
        {currentPage < totalPages && (
          <>
            <li>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
            </li>
            <li>
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                &gt;&gt;
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default React.memo(Pagination);
