function PricingSection() {
    const plans = [
      {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for small clubs and casual tournaments",
        features: [
          "Single tournament management",
          "Up to 16 players/teams",
          "Basic bracket system",
          "Email notifications",
          "Community support"
        ],
        buttonText: "Get Started",
        highlighted: false
      },
      {
        name: "Pro",
        price: "$29",
        period: "per month",
        description: "Ideal for clubs and regular tournament organizers",
        features: [
          "Multiple tournaments",
          "Up to 64 players/teams",
          "Advanced bracket systems",
          "Real-time scoring",
          "Player profiles",
          "Custom branding",
          "Priority support"
        ],
        buttonText: "Start Free Trial",
        highlighted: true
      },
      {
        name: "Enterprise",
        price: "$99",
        period: "per month",
        description: "For professional tournaments and organizations",
        features: [
          "Unlimited tournaments",
          "Unlimited players/teams",
          "All bracket systems",
          "Advanced analytics",
          "API access",
          "White-label solution",
          "Dedicated support",
          "Custom integrations"
        ],
        buttonText: "Contact Sales",
        highlighted: false
      }
    ];
  
    return (
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-red-600 font-semibold text-lg uppercase tracking-wider">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">Choose Your Plan</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the perfect plan for your tournament needs. All plans include our core features.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${
                  plan.highlighted 
                    ? 'bg-white border-2 border-red-500 relative' 
                    : 'bg-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 rounded-bl-lg font-semibold text-sm">
                    POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-end mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <button 
                    className={`w-full py-3 px-4 rounded-lg font-bold transition duration-300 ${
                      plan.highlighted 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
                <div className="bg-gray-50 p-8">
                  <p className="font-semibold text-gray-700 mb-4">Features include:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">Need a custom solution for your organization?</p>
            <a href="#contact" className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-md transition duration-300 shadow-md">
              Contact Our Sales Team
            </a>
          </div>
        </div>
      </section>
    );
  }
  
  export default PricingSection;