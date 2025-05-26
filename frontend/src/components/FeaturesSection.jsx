import { useState, useEffect, useRef } from "react";

function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const sectionRef = useRef(null);

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

  const features = [
    {
      icon: (
        <svg
          className="w-14 h-14 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      title: "Tournament Management",
      description:
        "Create and manage tournaments with flexible bracket systems, round-robin formats, and custom rules.",
    },
    {
      icon: (
        <svg
          className="w-14 h-14 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Real-time Scoring",
      description:
        "Update scores in real-time and keep all participants and spectators informed with live updates.",
    },
    {
      icon: (
        <svg
          className="w-14 h-14 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Player Profiles",
      description:
        "Maintain detailed player profiles with statistics, match history, and performance analytics.",
    },
    {
      icon: (
        <svg
          className="w-14 h-14 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      title: "Notifications",
      description:
        "Automated notifications for match schedules, results, and tournament updates via email or mobile app.",
    },
    {
      icon: (
        <svg
          className="w-14 h-14 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      title: "Custom Tournament Settings",
      description:
        "Configure tournament rules, scoring systems, and match formats to suit your specific requirements.",
    },
    {
      icon: (
        <svg
          className="w-14 h-14 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: "Advanced Analytics",
      description:
        "Gain insights with comprehensive statistics, performance metrics, and tournament analytics dashboards.",
    },
    {
      icon: (
        <svg
          className="w-14 h-14 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Payment Integration",
      description:
        "Collect registration fees, manage payouts, and handle financial transactions securely within the platform.",
    },
    {
      icon: (
        <svg
          className="w-14 h-14 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Venue Management",
      description:
        "Organize court allocations, schedule matches efficiently, and optimize venue resources for maximum productivity.",
    },
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="flex items-center justify-center bg-gradient-to-b from-gray-50 to-white overflow-hidden"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="text-red-600 font-semibold text-lg uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-3">
            Powerful Tournament Tools
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to run successful badminton tournaments from
            start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-gray-100 h-full"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="p-5">
                <div
                  className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300 ${
                    hoveredFeature === index ? "bg-red-600" : "bg-red-100"
                  }`}
                >
                  <div
                    className={`transition-all duration-300 ${
                      hoveredFeature === index ? "text-white" : "text-red-600"
                    }`}
                  >
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div
                className={`h-1 w-full bg-gradient-to-r from-red-500 to-red-700 transform origin-left transition-transform duration-300 ${
                  hoveredFeature === index ? "scale-x-100" : "scale-x-0"
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* <div className="mt-10 text-center">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-red-100">
            <span className="px-4 py-2 text-red-700 font-medium text-sm">
              Trusted by over 500+ tournament organizers worldwide
            </span>
          </div>
        </div> */}
      </div>
    </section>
  );
}

export default FeaturesSection;
