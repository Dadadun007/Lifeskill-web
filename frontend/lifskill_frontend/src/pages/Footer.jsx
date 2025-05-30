import { useEffect, useState, useRef } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo + Description */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-1 mb-4">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center">
                    <img src="logo.png" alt="LifeSkill Icon" />
                  </div>
                  <span className="text-xl font-bold">Life Skill</span>
                </div>
                <p className="text-gray-400 max-w-md">
                  Empowering individuals with practical life skills through community-driven learning and sharing.
                </p>
              </div>

              {/* Empty column for spacing (optional) */}
              <div className="hidden md:block"></div>

              {/* Community block on the right */}
              <div className="md:col-start-4">
                <h3 className="font-semibold mb-4">Community</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/Register" className="hover:text-white transition-colors">Join us</a></li>
                  <li><a href="/Tutorial" className="hover:text-white transition-colors">Tutorial</a></li>
                  <li><a href="/Contactus" className="hover:text-white transition-colors">Contact us</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Life Skill. All rights reserved.</p>
            </div>
          </div>

    </footer>
  );
};

export default Footer;