import { useState, useEffect } from 'react';

function WhatsAppCommunity() {
  // You can add animation states here
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation effect that runs every few seconds
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      
      // Reset animation after it completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000); // 1 second animation duration
    }, 5000); // Animate every 5 seconds
    
    return () => clearInterval(animationInterval);
  }, []);
  
  // Replace this with your actual WhatsApp community link
  const whatsappLink = "https://whatsapp.com/channel/0029Va6M7QfFi8xi2jNbxu2T";
  
  const handleClick = () => {
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="fixed bottom-20 right-5 z-50">
      <button
        onClick={handleClick}
        className={`bg-green-500 hover:bg-green-600 text-white p-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isAnimating ? 'animate-pulse transform scale-110' : ''}`}
        aria-label="Join our WhatsApp community"
      >
        <div className="flex flex-col items-center">
          {/* WhatsApp Icon */}
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M20.4539 3.54639C18.2223 1.31484 15.2584 0.0625 12.0961 0.0625C5.57422 0.0625 0.25 5.38672 0.25 11.9086C0.25 14.0164 0.835937 16.0664 1.94531 17.8555L0.15625 24.0625L6.51172 22.3125C8.23047 23.3242 10.1445 23.8555 12.0961 23.8555C18.6172 23.8555 23.9414 18.5312 23.9414 12.0094C23.9414 8.84766 22.6855 5.77795 20.4539 3.54639ZM12.0961 21.8633C10.3398 21.8633 8.61719 21.3555 7.12891 20.3984L6.76953 20.1875L3.03516 21.2227L4.08984 17.5938L3.85156 17.2109C2.78906 15.6562 2.24219 13.8125 2.24219 11.9086C2.24219 6.48047 6.66797 2.05469 12.0961 2.05469C14.7109 2.05469 17.1641 3.10938 19.0078 4.95312C20.8516 6.79688 21.9414 9.25 21.9414 12.0094C21.9414 17.4375 17.5156 21.8633 12.0961 21.8633ZM17.5273 14.4219C17.2227 14.2695 15.7695 13.5547 15.4883 13.4492C15.207 13.3438 15 13.2891 14.793 13.5938C14.5859 13.8984 14.0195 14.5586 13.8359 14.7656C13.6523 14.9727 13.4688 15 13.1641 14.8477C12.8594 14.6953 11.9062 14.3711 10.7891 13.3672C9.91406 12.5859 9.32422 11.6328 9.14062 11.3281C8.95703 11.0234 9.12109 10.8516 9.27734 10.6914C9.41797 10.5508 9.58984 10.3242 9.74609 10.1406C9.90234 9.95703 9.95703 9.82422 10.0625 9.61719C10.168 9.41016 10.1133 9.22656 10.0352 9.07422C9.95703 8.92188 9.36719 7.46875 9.10547 6.85938C8.84375 6.26953 8.58203 6.35156 8.39844 6.35156C8.21484 6.35156 8.02344 6.32422 7.83984 6.32422C7.65625 6.32422 7.375 6.40234 7.09375 6.70703C6.8125 7.01172 6.04297 7.72656 6.04297 9.17969C6.04297 10.6328 7.11328 12.0312 7.26953 12.2383C7.42578 12.4453 9.32422 15.3633 12.2266 16.6289C12.9414 16.9336 13.5039 17.1133 13.9453 17.2461C14.6602 17.4688 15.3047 17.4414 15.8125 17.3633C16.3828 17.2734 17.5547 16.6289 17.8164 15.9141C18.0781 15.1992 18.0781 14.5898 18 14.4219C17.9219 14.2539 17.832 14.5742 17.5273 14.4219Z" />
          </svg>
          
          {/* Text */}
          <span className="text-xs font-bold mt-1">Join Our Channel</span>
        </div>
      </button>
    </div>
  );
}

export default WhatsAppCommunity;