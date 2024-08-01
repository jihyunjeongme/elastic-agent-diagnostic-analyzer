export default function AgentState({ fleetMessage, fleetState, logLevel, message, state }) {
  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Agent State</h3>
      </div>
      <div className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Fleet Message</dt>
            <dd className="mt-1 text-sm text-gray-900">{fleetMessage}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fleet State</dt>
            <dd className="mt-1 text-sm text-gray-900">{fleetState}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Log Level</dt>
            <dd className="mt-1 text-sm text-gray-900">{logLevel}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Message</dt>
            <dd className="mt-1 text-sm text-gray-900">{message}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">State</dt>
            <dd className="mt-1 text-sm text-gray-900">{state}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
