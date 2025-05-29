import { useEffect, useState, useRef } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Createpost from './Createpost';

function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ageRecommend, setAgeRecommend] = useState("0-5");

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
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      if (!postTitle.trim()) {
        alert("Please enter a post title");
        return;
      }
      if (!selectedFile && !videoLink.trim()) {
        alert("Please either upload an image or provide a video link");
        return;
      }
      const postData = {
        title: postTitle,
        content: postContent,
        categories: selectedCategories.join(","),
        age_recommend: ageRecommend,
        video_link: videoLink,
      };
      const formData = new FormData();
      formData.append("post", JSON.stringify(postData));
      if (selectedFile) {
        formData.append("picture", selectedFile);
      }
      const response = await fetch("http://localhost:8080/create_post", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create post: ${errorText}`);
      }
      alert("Post created successfully!");
      setIsCreateModalOpen(false);
      setPostTitle("");
      setPostContent("");
      setSelectedFile(null);
      setFilePreview(null);
      setVideoLink("");
      setSelectedCategories([]);
      setAgeRecommend("0-5");
    } catch (error) {
      alert("Failed to create post. Please try again.");
      console.error(error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Please select only JPG, JPEG, or PNG files");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <nav className="w-full bg-white shadow-sm px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img src="logo.png" alt="LifeSkill Icon" className="w-15 h-15 cursor-pointer" />
          </Link>
          <span className="text-xl font-bold text-gray-700">Life Skill</span>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center w-full md:max-w-[600px] px-3 py-1">
          <input
            type="text"
            placeholder="Search what content you want..."
            className="flex-1 text-sm text-black shadow-sm rounded-l-full px-3 py-2 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="flex items-center justify-center bg-[#3498db] hover:bg-[#2471a3] h-[37px] w-[60px] rounded-r-full"
          >
            <img src="Search.png" alt="Search Icon" className="w-[20px] h-[20px] object-contain" />
          </button>
        </form>

        {/* Login / Profile */}
        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/tutorial">
              <button className="bg-[#f7dc6f] text-white font-semibold shadow-sm px-4 py-2 rounded-full text-sm hover:bg-[#C5A241] transition flex items-center gap-2">
                <img src="tutorial.png" alt="Tutorial Icon" className="w-5 h-5" /> Tutorial
              </button>
            </Link>
            
            {/* Create Post Button */}
            <button 
              className="bg-[#3498db] text-white font-semibold shadow-sm px-4 py-2 rounded-full text-sm hover:bg-[#2471a3] transition" 
              onClick={() => setIsCreateModalOpen(true)}
            >
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
                    to="/mypage"
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

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div style={{position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <form style={{background: "white", padding: 24, borderRadius: 12, minWidth: 350, maxWidth: 500}} onSubmit={handleCreatePost}>
            <h2 style={{fontWeight: "bold", fontSize: 20, marginBottom: 12}}>Create Post</h2>
            <input type="text" placeholder="Title" value={postTitle} onChange={e => setPostTitle(e.target.value)} style={{width: "100%", marginBottom: 8}} />
            <textarea placeholder="Content" value={postContent} onChange={e => setPostContent(e.target.value)} style={{width: "100%", marginBottom: 8}} />
            <input type="text" placeholder="Video Link (optional)" value={videoLink} onChange={e => setVideoLink(e.target.value)} style={{width: "100%", marginBottom: 8}} />
            <input type="text" placeholder="Categories (comma separated)" value={selectedCategories.join(",")} onChange={e => setSelectedCategories(e.target.value.split(","))} style={{width: "100%", marginBottom: 8}} />
            <select value={ageRecommend} onChange={e => setAgeRecommend(e.target.value)} style={{width: "100%", marginBottom: 8}}>
              <option value="0-5">0-5</option>
              <option value="6-12">6-12</option>
              <option value="13-18">13-18</option>
              <option value="18+">18+</option>
            </select>
            <div style={{display: "flex", justifyContent: "flex-end", gap: 8}}>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{background: "#ccc", border: "none", padding: "6px 16px", borderRadius: 6}}>Cancel</button>
              <button type="submit" style={{background: "#3498db", color: "white", border: "none", padding: "6px 16px", borderRadius: 6}}>Post</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Header;