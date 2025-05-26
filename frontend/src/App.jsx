function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
          ServeUp - Badminton Tournament
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Tailwind CSS is successfully installed and working! 🎉
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300">
            Get Started
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition duration-300">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;