export default function Footer() {
  return (
    <footer className="relative bg-[#1F6563] text-white pt-12 px-4">
      {/* Main content container */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-8 pb-24">
        {/* Logo and Social Icons */}
        <div className="flex flex-col gap-10">
          <img src="/Footer-logo.svg" alt="Footer Logo" className="w-30" />
          <div className="flex gap-5">
            <a href="#" className="bg-white rounded-full p-2 hover:scale-105 transition">
              <img src="/Whatsapp-icon.svg" alt="Whatsapp" className="w-5 h-5" />
            </a>
            <a href="#" className="bg-white rounded-full p-2 hover:scale-105 transition">
              <img src="/Instagram-icon.svg" alt="Instagram" className="w-5 h-5" />
            </a>
            <a href="#" className="bg-white rounded-full p-2 hover:scale-105 transition">
              <img src="/Facebook-icon.svg" alt="Facebook" className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Company Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Company</h2>
          <ul className="space-y-2">
            <li>
              <a href="/about" className="hover:underline hover:text-gray-300">About Us</a>
            </li>
            <li>
              <a href="/contact" className="hover:underline hover:text-gray-300">Contact Us</a>
            </li>
          </ul>
        </div>

        {/* Explore Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Explore</h2>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:underline hover:text-gray-300">Home</a>
            </li>
            <li>
              <a href="/pricing" className="hover:underline hover:text-gray-300">Pricing</a>
            </li>
            <li>
              <a href="/privacy" className="hover:underline hover:text-gray-300">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms" className="hover:underline hover:text-gray-300">Terms & Conditions</a>
            </li>
          </ul>
        </div>

        {/* Form Section */}
        <form className="w-full md:w-auto">
          <label htmlFor="footer-input" className="sr-only">Email or Mobile</label>
          <div className="flex rounded-full overflow-hidden bg-[#C3C3C3]">
            <input
              id="footer-input"
              type="text"
              placeholder="Your Email Id/ Mobile No."
              className="px-4 py-2 w-full text-black outline-none"
            />
            <button
              type="submit"
              className="bg-[#FFFFFF] text-[#1F6563] px-4 py-2 font-bold hover:bg-[#15514f] transition hover:text-white"
            >
              Signup/Login
            </button>
          </div>
        </form>
      </div>
    </footer>
  );
}
