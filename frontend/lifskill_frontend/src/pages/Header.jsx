import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <nav className="w-full bg-[#43A895] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/home">
          <img src="LifeSkill.png" alt="LifeSkill Icon" className="w-[160px] h-[50px] cursor-pointer" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center w-full md:max-w-[600px] px-3 py-1">
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 text-sm text-black rounded-l-full px-3 py-2 bg-white"
        />
        <button className="flex items-center justify-center bg-[#5A7FB3] h-[37px] w-[60px] rounded-r-full">
          <img src="Search.png" alt="Search Icon" className="w-[20px] h-[20px] object-contain" />
        </button>
      </div>

      {/* Login / Profile */}
      {user ? (
        <div className="flex items-center gap-3">
          <Link to="/tutorial">
            <button className="bg-[#E2C576] text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-[#C5A241] transition flex items-center gap-2">
              <img src="tutorial.png" alt="Tutorial Icon" className="w-5 h-5" /> Tutorial
            </button>
          </Link>
          <Link to="/create-post">
            <button className="bg-[#6E9DE0] text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-[#4772AD] transition">
              + Create Post
            </button>
          </Link>

          {/* User Info Dropdown */}
          <div className="relative w-fit" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((open) => !open)}
              className={`flex items-center bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 transition-colors w-50
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
              <div className="absolute left-0 top-full w-full bg-gray-500 rounded-b-2xl shadow-lg z-50 flex flex-col items-start overflow-hidden">
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
    </nav>
  );
}

export default Header;
