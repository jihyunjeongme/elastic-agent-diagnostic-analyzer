import { useState } from "react";

export default function ConfigDisplay({ title, content }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden max-w-full">
      <button
        className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
      </button>
      {isExpanded && (
        <div className="max-w-full overflow-x-auto">
          <pre className="p-4 bg-white">
            <code>{content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
