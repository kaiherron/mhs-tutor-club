import Image from "next/image";
import BookingForm from "./components/BookingForm";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.png"
                alt="Melrose Tutor Club Logo"
                width={50}
                height={50}
              />
              <span className="font-handwritten text-xl font-bold text-gray-800">Melrose Tutor Club</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                About
              </a>
              <a href="#booking" className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                Book Session
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                Contact
              </a>
            </div>
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center overflow-hidden">
        {/* Decorative banner background */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full bg-cover bg-center bg-no-repeat opacity-5 transform rotate-12 translate-x-1/4"
          style={{ backgroundImage: 'url(/banner.png)' }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-cover bg-center bg-no-repeat opacity-8 transform -rotate-6 -translate-x-1/4"
          style={{ backgroundImage: 'url(/banner.png)' }}
        ></div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Image
                src="/logo.png"
                alt="Melrose Tutor Club Logo"
                width={200}
                height={200}
                className="mx-auto lg:mx-0 mb-8"
                priority
              />
              <h1 className="font-handwritten text-5xl lg:text-7xl font-bold text-gray-800 mb-6">
                Welcome to Melrose Tutor Club
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Free personalized tutoring for high school students in Melrose, MA.
                Get the academic support you need to excel in your studies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#booking"
                  className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Book Free Session
                </a>
                <a
                  href="#contact"
                  className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Contact Us
                </a>
              </div>
            </div>
            <div className="flex-1 relative">
              <Image
                src="/banner.png"
                alt="Melrose Tutor Club Banner"
                width={500}
                height={400}
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-handwritten text-4xl font-bold text-gray-800 mb-4">
                Book Your Free Session
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                All tutoring sessions are completely free. Follow the simple steps below to book your appointment with the perfect tutor for your needs.
              </p>
            </div>
            <BookingForm />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-handwritten text-4xl font-bold text-gray-800 mb-8">
              About Our Club
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Melrose Tutor Club is dedicated to providing free, high-quality tutoring services
              to high school students in the Melrose community. Our experienced tutors are
              passionate about helping students achieve their academic goals and build confidence
              in their studies.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Expert Tutors</h3>
                <p className="text-gray-600">Qualified tutors with years of experience</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💯</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Free Service</h3>
                <p className="text-gray-600">All tutoring sessions are completely free</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Personalized</h3>
                <p className="text-gray-600">Tailored learning plans for each student</p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-handwritten text-4xl font-bold text-gray-800 mb-4">
              Contact Us
            </h2>
            <p className="text-lg text-gray-600">
              Get in touch with us for any questions or to learn more about our services
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src="https://media.licdn.com/dms/image/v2/D4E03AQHAtp9BPwAQtA/profile-displayphoto-crop_800_800/B4EZedygY.G4AI-/0/1750698953339?e=1760572800&v=beta&t=-uaeIikZ4JSJilg49q-Cn6QALZvvts-BNQXhG5VVo8s"
                  alt="Achraf Boukirou"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Achraf Boukirou</h3>
              <p className="text-gray-600">achraf.boukirou@melroseschools.com</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src="https://lh3.googleusercontent.com/a-/ALV-UjVjqs1PfBiAF-3RWD9Tpj8AbAi4bGvLXpipvcTGRZAkapjrT2o2=s128-p"
                  alt="Ritik Nayyar"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Ritik Nayyar</h3>
              <p className="text-gray-600">ritik.nayyar@melroseschools.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Image
                src="/logo.png"
                alt="Melrose Tutor Club Logo"
                width={120}
                height={120}
                className="mb-4"
              />
              <p className="text-gray-300">
                Providing free tutoring services to high school students in Melrose, MA.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#booking" className="hover:text-white transition-colors">Book Session</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Melrose Tutor Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
