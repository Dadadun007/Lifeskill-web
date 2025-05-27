// import { Link, useNavigate } from 'react-router-dom';

import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, X, Bold, Italic, Underline, List, AlignLeft, ExternalLink, Image, MoreHorizontal } from 'lucide-react';
import Createpost from './Createpost';

function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Added state for popup form
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ageRecommend, setAgeRecommend] = useState('');

  const categories = ['Foods', 'Pets', 'Travel', 'Tech', 'Health', 'Education'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:8080/user/me', {
          credentials: 'include',
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();
        if (data?.username) setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err.message);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setIsDropdownOpen(false);
      // ใช้ navigate แทน window.location.href เพื่อ replace history
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Added functions for popup
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCreatePost = () => {
    // Handle post creation logic here
    console.log('Creating post:', { postTitle, postContent, selectedCategories, ageRecommend });
    setIsCreateModalOpen(false);
    // Reset form
    setPostTitle('');
    setPostContent('');
    setSelectedCategories([]);
    setAgeRecommend('');
  };

  return (
    <>
      <nav className="w-full bg-white shadow-sm px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/home">
            <img src="logo.png" alt="LifeSkill Icon" className="w-15 h-15 cursor-pointer" />
          </Link>
          <span className="text-xl font-bold text-gray-700">Life Skill</span>
        </div>
        

        {/* Search Bar */}
        <div className="flex items-center w-full md:max-w-[600px] px-3 py-1">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 text-sm text-black shadow-sm rounded-l-full px-3 py-2 bg-white"
          />
          <button className="flex items-center justify-center bg-[#3498db] hover:bg-[#2471a3] h-[37px] w-[60px] rounded-r-full">
            <img src="Search.png" alt="Search Icon" className="w-[20px] h-[20px] object-contain" />
          </button>
        </div>

        {/* Login / Profile */}
        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/tutorial">
              <button className="bg-[#f7dc6f] text-white font-semibold shadow-sm px-4 py-2 rounded-full text-sm hover:bg-[#C5A241] transition flex items-center gap-2">
                <img src="tutorial.png" alt="Tutorial Icon" className="w-5 h-5" /> Tutorial
              </button>
            </Link>
            
            {/* ปุ่ม Create Post */}
            <button className="bg-[#3498db] text-white font-semibold shadow-sm px-4 py-2 rounded-full text-sm hover:bg-[#2471a3] transition" onClick={() => setIsCreateModalOpen(true)}>
              + Create Post
            </button>
           

            {/* User Info Dropdown */}
            <div className="relative w-fit" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((open) => !open)}
                className={`flex items-center shadow-sm bg-[#85929e] px-4 py-2 text-white hover:bg-gray-600 transition-colors w-50
                  ${isDropdownOpen ? "rounded-t-2xl" : "rounded-full"}`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-base font-semibold">{user.username}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 ml-auto transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full w-full bg-[#85929e] rounded-b-2xl shadow-xl z-50 flex flex-col items-start overflow-hidden">
                  <Link
                    to="/"
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img src="home.png" alt="home Icon" className="w-5 h-5 object-contain" />
                    Home
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img src="profile.png" alt="profile Icon" className="w-5 h-5 object-contain" />
                    Profile
                  </Link>
                  <Link
                    to="/postrequest"
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img src="postre.png" alt="Post request Icon" className="w-5 h-5 object-contain" />
                    Post Requests
                  </Link>
                  <Link
                    to="/contactus"
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img src="contactus.png" alt="Contact usIcon" className="w-5 h-5 object-contain" />
                    Contact Us
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                  >
                    <img src="logout.png" alt="logout Icon" className="w-5 h-5 object-contain" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/login">
            <button className="bg-[#5A7FB3] hover:bg-[#147cd5] text-white px-4 py-1.5 rounded-lg text-sm whitespace-nowrap">
              Login / Sign up
            </button>
          </Link>
        )}

        {/* Modal Popup */}
        {isCreateModalOpen && (
          <Createpost onClose={() => setIsCreateModalOpen(false)} />
        )}
      </nav>

      {/* Added Create Post Modal Popup */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md relative shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <X size={24} />
              </button>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Title*"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none outline-none text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* Rich Text Editor */}
            <div className="mb-6">
              {/* Toolbar */}
              <div className="bg-gray-800 rounded-t-lg p-2 flex items-center gap-1 text-white text-sm">
                <span className="text-xs mr-2">Switch to Markdown Editor</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-700 rounded"><Bold size={16} /></button>
                  <button className="p-1 hover:bg-gray-700 rounded"><Italic size={16} /></button>
                  <button className="p-1 hover:bg-gray-700 rounded"><Underline size={16} /></button>
                  <button className="p-1 hover:bg-gray-700 rounded"><AlignLeft size={16} /></button>
                  <button className="p-1 hover:bg-gray-700 rounded"><List size={16} /></button>
                  <button className="p-1 hover:bg-gray-700 rounded"><ExternalLink size={16} /></button>
                  <button className="p-1 hover:bg-gray-700 rounded"><Image size={16} /></button>
                  <button className="p-1 hover:bg-gray-700 rounded"><MoreHorizontal size={16} /></button>
                </div>
              </div>
              
              {/* Text Area */}
              <textarea
                placeholder="Body"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full h-24 px-4 py-3 bg-gray-800 text-white rounded-b-lg border-none outline-none resize-none placeholder-gray-400"
              />
            </div>

            {/* Categories */}
            <div className="mb-4">
              <div className="bg-gray-400 rounded-full px-4 py-2 mb-3">
                <span className="text-white font-medium">Categories:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        selectedCategories.includes(category)
                          ? 'bg-[#43A895] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Import Files */}
                <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-400 transition">
                  Import files 📎
                </button>
                
                {/* Age Recommend */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Age Recommend</span>
                  <input
                    type="text"
                    placeholder="<10"
                    value={ageRecommend}
                    onChange={(e) => setAgeRecommend(e.target.value)}
                    className="w-12 px-2 py-1 bg-gray-100 rounded text-center text-xs border-none outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Tutorial Button */}
                <button className="bg-[#E2C576] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#C5A241] transition flex items-center gap-1">
                  💡 Tutorial
                </button>
                
                {/* Post Button */}
                <button 
                  onClick={handleCreatePost}
                  className="bg-[#43A895] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#359182] transition"
                >
                  Post
                </button>
              </div>
            </div>

            {/* File Info */}
            <div className="mt-3">
              <span className="text-xs text-gray-500">*ไฟล์จะถูกอัปโหลดไปที่ระบบ หลังจาก 1 files</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;