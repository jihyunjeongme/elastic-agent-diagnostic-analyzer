export default function VersionInfo({ buildTime, commit, snapshot, version }) {
  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Version Information</h3>
      </div>
      <div className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Build Time</dt>
            <dd className="mt-1 text-sm text-gray-900">{buildTime}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Version</dt>
            <dd className="mt-1 text-sm text-gray-900">{version}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Snapshot</dt>
            <dd className="mt-1 text-sm text-gray-900">{snapshot.toString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commit</dt>
            <dd className="mt-1 text-sm text-gray-900">{commit}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
