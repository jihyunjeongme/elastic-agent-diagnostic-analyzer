import React, { useState } from "react";

const EVENTS_PER_PAGE = 5;

const OpenEvents = ({ events }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedEvents = Object.entries(events).reduce((acc, [level, levelEvents]) => {
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    acc[level] = levelEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);
    return acc;
  }, {});

  const totalPages = Math.ceil(
    Math.max(...Object.values(events).map((levelEvents) => levelEvents.length)) / EVENTS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Open Events</h2>
      <div className="space-y-4">
        {Object.entries(paginatedEvents).map(([level, levelEvents]) => (
          <div key={level}>
            <h3 className="text-lg font-medium mb-2">{level}</h3>
            <ul className="space-y-2">
              {levelEvents.map((event, index) => (
                <li key={index} className="text-sm border-l-4 border-blue-500 pl-2">
                  <span className="font-medium">{event.time}:</span> {event.message}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-blue-500 text-white rounded mr-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-blue-500 text-white rounded ml-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OpenEvents;
