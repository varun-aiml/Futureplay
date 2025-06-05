import { useState, useEffect, useRef } from "react";
import { getTopTournaments } from "../services/tournamentService";
import { format } from "date-fns";
import { Link } from "react-router-dom";

function UpcomingTournaments() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [currentUpcomingIndex, setCurrentUpcomingIndex] = useState(0);
  const [currentCompletedIndex, setCurrentCompletedIndex] = useState(0);
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const upcomingCarouselRef = useRef(null);
  const completedCarouselRef = useRef(null);
  const sectionRef = useRef(null);

  // Fetch tournaments from API
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        const response = await getTopTournaments();
        setTournaments(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
        setError("Failed to load tournaments");
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Filter tournaments by status
  const upcomingTournaments = tournaments.filter(tournament => 
    tournament.status === 'Upcoming'
  );
  
  const completedTournaments = tournaments.filter(tournament => 
    tournament.status === 'Completed'
  );

  // Adjust section height to match viewport
  useEffect(() => {
    const adjustHeight = () => {
      if (sectionRef.current) {
        sectionRef.current.style.minHeight = `${window.innerHeight}px`;
      }
    };

    adjustHeight();
    window.addEventListener("resize", adjustHeight);

    return () => window.removeEventListener("resize", adjustHeight);
  }, []);

  // Auto scroll functionality for upcoming tournaments
  useEffect(() => {
    if (upcomingTournaments.length === 0) return;
    
    const interval = setInterval(() => {
      if (activeTab === "upcoming") {
        nextUpcomingSlide();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUpcomingIndex, activeTab, upcomingTournaments]);

  // Auto scroll functionality for completed tournaments
  useEffect(() => {
    if (completedTournaments.length === 0) return;
    
    const interval = setInterval(() => {
      if (activeTab === "completed") {
        nextCompletedSlide();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentCompletedIndex, activeTab, completedTournaments]);

  const nextUpcomingSlide = () => {
    if (upcomingTournaments.length <= 1) return;
    
    setCurrentUpcomingIndex((prevIndex) =>
      prevIndex === upcomingTournaments.length - 1 ? 0 : prevIndex + 1
    );

    if (upcomingCarouselRef.current) {
      const scrollAmount = upcomingCarouselRef.current.offsetWidth;
      upcomingCarouselRef.current.scrollTo({
        left:
          ((currentUpcomingIndex + 1) % upcomingTournaments.length) *
          scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // ... other navigation functions remain the same
  const prevUpcomingSlide = () => {
    if (upcomingTournaments.length <= 1) return;
    
    setCurrentUpcomingIndex((prevIndex) =>
      prevIndex === 0 ? upcomingTournaments.length - 1 : prevIndex - 1
    );

    if (upcomingCarouselRef.current) {
      const scrollAmount = upcomingCarouselRef.current.offsetWidth;
      upcomingCarouselRef.current.scrollTo({
        left:
          (currentUpcomingIndex === 0
            ? upcomingTournaments.length - 1
            : currentUpcomingIndex - 1) * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const nextCompletedSlide = () => {
    if (completedTournaments.length <= 1) return;
    
    setCurrentCompletedIndex((prevIndex) =>
      prevIndex === completedTournaments.length - 1 ? 0 : prevIndex + 1
    );

    if (completedCarouselRef.current) {
      const scrollAmount = completedCarouselRef.current.offsetWidth;
      completedCarouselRef.current.scrollTo({
        left:
          ((currentCompletedIndex + 1) % completedTournaments.length) *
          scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const prevCompletedSlide = () => {
    if (completedTournaments.length <= 1) return;
    
    setCurrentCompletedIndex((prevIndex) =>
      prevIndex === 0 ? completedTournaments.length - 1 : prevIndex - 1
    );

    if (completedCarouselRef.current) {
      const scrollAmount = completedCarouselRef.current.offsetWidth;
      completedCarouselRef.current.scrollTo({
        left:
          (currentCompletedIndex === 0
            ? completedTournaments.length - 1
            : currentCompletedIndex - 1) * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      console.log("Error parsing date:", error);
      return dateString; // Return the original string if parsing fails
    }
  };

  return (
    <section
      id="upcoming-tournaments"
      ref={sectionRef}
      className="flex items-center justify-center bg-gradient-to-b from-white to-gray-50 overflow-hidden min-h-screen"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="text-red-600 font-semibold text-lg uppercase tracking-wider">
            Tournaments
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">
            Badminton Events
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover upcoming tournaments to participate in and review past
            events.
          </p>
        </div>

        {/* Tournament Type Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-gray-200 rounded-full p-1 shadow-md">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === "upcoming"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-gray-300"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeTab === "completed"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-gray-300"
              }`}
            >
              Completed
            </button>
            <Link
              to="/tournaments"
              className="px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 bg-transparent text-gray-700 hover:bg-gray-300"
            >
              View All
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Upcoming Tournaments Section */}
            <div
              className={`transition-opacity duration-500 ${
                activeTab === "upcoming" ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              {upcomingTournaments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No upcoming tournaments found.</p>
                </div>
              ) : (
                <div className="relative max-w-5xl mx-auto">
                  {/* Left Arrow */}
                  {upcomingTournaments.length > 1 && (
                    <button
                      onClick={prevUpcomingSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
                      aria-label="Previous tournament"
                    >
                      <svg
                        className="w-5 h-5 text-gray-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Carousel Container */}
                  <div
                    ref={upcomingCarouselRef}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {upcomingTournaments.map((tournament) => (
                      <div
                        key={tournament._id}
                        className="min-w-full snap-center px-4"
                      >
                        {/* Updated card design for portrait posters */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-gray-100 flex flex-col md:flex-row h-auto md:h-[450px]">
                          <div className="relative md:w-[40%] h-[300px] md:h-auto">
                            <img
                              src={tournament.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                              alt={tournament.name}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x450?text=Error+Loading+Image';
                              }}
                            />
                            <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-lg font-medium text-sm">
                              Registration Open
                            </div>
                          </div>
                          <div className="p-6 md:p-8 md:w-[60%] flex flex-col justify-between">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
                                {tournament.name}
                              </h3>
                              <div className="space-y-3">
                                <div className="flex items-center">
                                  <div className="bg-red-100 p-2 rounded-full mr-3">
                                    <svg
                                      className="w-5 h-5 text-red-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-gray-700 text-base">
                                    {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <div className="bg-red-100 p-2 rounded-full mr-3">
                                    <svg
                                      className="w-5 h-5 text-red-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-gray-700 text-base line-clamp-1">
                                    {tournament.location}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6">
                              <div className="bg-gray-50 p-4 rounded-lg mb-5 border-l-4 border-red-500">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="bg-green-100 p-1.5 rounded-full mr-2">
                                      <svg
                                        className="w-4 h-4 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      Registration closes soon
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-red-600">
                                    Limited spots
                                  </span>
                                </div>
                              </div>

                              <button className="w-full py-3 px-4 rounded-lg font-bold text-sm transition duration-300 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg">
                                Register Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  {upcomingTournaments.length > 1 && (
                    <button
                      onClick={nextUpcomingSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
                      aria-label="Next tournament"
                    >
                      <svg
                        className="w-5 h-5 text-gray-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Dots Indicator */}
              {upcomingTournaments.length > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {upcomingTournaments.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentUpcomingIndex(index);
                        if (upcomingCarouselRef.current) {
                          const scrollAmount =
                            upcomingCarouselRef.current.offsetWidth;
                          upcomingCarouselRef.current.scrollTo({
                            left: index * scrollAmount,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className={`transition-all duration-300 ${
                        currentUpcomingIndex === index
                          ? "bg-red-600 w-6 h-2 rounded-full"
                          : "bg-gray-300 w-2 h-2 rounded-full hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tournaments Section - Similar changes as above */}
            <div
              className={`transition-opacity duration-500 ${
                activeTab === "completed" ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              {completedTournaments.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No completed tournaments found.</p>
                </div>
              ) : (
                <div className="relative max-w-5xl mx-auto">
                  {/* Left Arrow */}
                  {completedTournaments.length > 1 && (
                    <button
                      onClick={prevCompletedSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
                      aria-label="Previous tournament"
                    >
                      <svg
                        className="w-5 h-5 text-gray-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Carousel Container */}
                  <div
                    ref={completedCarouselRef}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {completedTournaments.map((tournament) => (
                      <div
                        key={tournament._id}
                        className="min-w-full snap-center px-4"
                      >
                        {/* Updated card design for portrait posters */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-gray-100 flex flex-col md:flex-row h-auto md:h-[450px]">
                          <div className="relative md:w-[40%] h-[300px] md:h-auto">
                            <img
                              src={tournament.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                              alt={tournament.name}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x450?text=Error+Loading+Image';
                              }}
                            />
                            <div className="absolute top-0 right-0 bg-gray-800 text-white px-3 py-1 rounded-bl-lg font-medium text-sm">
                              Completed
                            </div>
                          </div>
                          <div className="p-6 md:p-8 md:w-[60%] flex flex-col justify-between">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
                                {tournament.name}
                              </h3>
                              <div className="space-y-3">
                                <div className="flex items-center">
                                  <div className="bg-gray-100 p-2 rounded-full mr-3">
                                    <svg
                                      className="w-5 h-5 text-gray-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-gray-700 text-base">
                                    {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <div className="bg-gray-100 p-2 rounded-full mr-3">
                                    <svg
                                      className="w-5 h-5 text-gray-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-gray-700 text-base line-clamp-1">
                                    {tournament.location}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6">
                              <h4 className="text-gray-800 font-medium text-base mb-3">
                                Tournament Results
                              </h4>
                              <div className="flex items-center mb-3 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                                  <svg
                                    className="w-4 h-4 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-sm">
                                    Winner
                                  </span>
                                  <p className="text-gray-900 font-bold text-base">
                                    Team Eagles
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center mb-5 bg-gray-100 p-3 rounded-lg border-l-4 border-gray-400">
                                <div className="bg-gray-200 p-2 rounded-full mr-3">
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-sm">
                                    Runner-up
                                  </span>
                                  <p className="text-gray-900 font-bold text-base">
                                    Team Hawks
                                  </p>
                                </div>
                              </div>

                              <button className="w-full py-3 px-4 rounded-lg font-bold text-sm transition duration-300 bg-gray-800 hover:bg-gray-900 text-white shadow-md hover:shadow-lg">
                                View Full Results
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Arrow */}
                  {completedTournaments.length > 1 && (
                    <button
                      onClick={nextCompletedSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
                      aria-label="Next tournament"
                    >
                      <svg
                        className="w-5 h-5 text-gray-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Dots Indicator */}
              {completedTournaments.length > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {completedTournaments.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentCompletedIndex(index);
                        if (completedCarouselRef.current) {
                          const scrollAmount =
                            completedCarouselRef.current.offsetWidth;
                          completedCarouselRef.current.scrollTo({
                            left: index * scrollAmount,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className={`transition-all duration-300 ${
                        currentCompletedIndex === index
                          ? "bg-gray-700 w-6 h-2 rounded-full"
                          : "bg-gray-300 w-2 h-2 rounded-full hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default UpcomingTournaments;