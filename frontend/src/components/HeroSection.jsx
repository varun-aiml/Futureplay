function HeroSection() {
    return (
      <section id="home" className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 pt-24 pb-16 md:py-0 z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <div className="relative">
                <div className="absolute -left-4 -top-4 w-20 h-20 bg-red-600 rounded-full opacity-20"></div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  Elevate Your <span className="text-red-500">Badminton</span> Tournaments
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-xl">
                Professional tournament management platform designed for organizers who demand excellence.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-md transition duration-300 shadow-lg transform hover:-translate-y-1">
                  Create Tournament
                </button>
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 font-bold py-4 px-10 rounded-md transition duration-300 shadow-lg transform hover:-translate-y-1">
                  Explore Features
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -right-6 -bottom-6 w-64 h-64 bg-red-600 rounded-full opacity-20 blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-3 shadow-2xl">
                  <div className="bg-gradient-to-br from-red-600 to-red-800 p-1 rounded-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                      alt="Badminton Tournament" 
                      className="rounded-lg shadow-lg w-full"
                    />
                  </div>
                  <div className="absolute -bottom-5 right-10 bg-red-600 text-white py-3 px-6 rounded-lg shadow-xl">
                    <span className="font-bold">Next Tournament:</span> July 15, 2023
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#f7fafc" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
    );
  }
  
  export default HeroSection;