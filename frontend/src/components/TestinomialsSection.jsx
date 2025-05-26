function TestimonialsSection() {
    const testimonials = [
      {
        quote: "ServeUp transformed how we run our club tournaments. The interface is intuitive and the bracket system is flawless.",
        author: "Sarah Johnson",
        role: "Badminton Club President",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg"
      },
      {
        quote: "As a tournament organizer, I've tried many platforms, but ServeUp stands out with its real-time updates and player management features.",
        author: "Michael Chen",
        role: "Regional Tournament Director",
        avatar: "https://randomuser.me/api/portraits/men/46.jpg"
      },
      {
        quote: "The analytics and statistics tracking have helped our players improve their game strategy. Highly recommended for serious clubs.",
        author: "Emma Rodriguez",
        role: "Professional Coach",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg"
      }
    ];
  
    return (
      <section id="tournaments" className="py-24 bg-gray-900 text-white relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-red-500 font-semibold text-lg uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">What Our Community Says</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied tournament organizers and players who trust ServeUp.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 p-8 rounded-xl shadow-xl relative">
                <div className="absolute -top-5 -left-5 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="mb-6">
                  <p className="italic text-gray-300 text-lg leading-relaxed">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-14 h-14 rounded-full mr-4 border-2 border-red-500"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.author}</h4>
                    <p className="text-red-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          <div className="mt-20 text-center">
            <h3 className="text-3xl font-bold mb-8">Ready to elevate your tournaments?</h3>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-md transition duration-300 shadow-lg transform hover:-translate-y-1 text-lg">
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    );
  }
  
  export default TestimonialsSection;