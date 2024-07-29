export default function FileUploader() {
  return (
    <div className="mt-8">
      <label className="block text-sm font-medium text-gray-700">Upload Diagnostic Bundle</label>
      <input
        type="file"
        className="mt-1 block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-violet-50 file:text-violet-700
        hover:file:bg-violet-100"
      />
    </div>
  );
}
