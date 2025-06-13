export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Tailwind CSS Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this styled correctly, Tailwind CSS is working!
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-500 h-16 rounded"></div>
          <div className="bg-green-500 h-16 rounded"></div>
          <div className="bg-purple-500 h-16 rounded"></div>
        </div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
} 