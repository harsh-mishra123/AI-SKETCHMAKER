export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-white/10 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-16 h-16 border-4 border-t-transparent border-r-transparent border-b-purple-400 border-l-indigo-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      </div>
      <p className="mt-6 text-gray-200 font-medium">Generating your sketch...</p>
      <p className="text-sm text-gray-400 mt-1 animate-pulse-slow">This may take a few seconds</p>
    </div>
  );
}