import { useEffect, useState, useRef } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';

function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for create post form
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ageRecommend, setAgeRecommend] = useState('0-5');
  const [categories, setCategories] = useState([]);
  
  // States for file upload and video link
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoLink, setVideoLink] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8080/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchCategories();
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
      const res = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error('Logout failed');
      }
      
      setUser(null);
      setIsDropdownOpen(false);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      // You might want to show an error message to the user here
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please select only JPG, JPEG, or PNG files');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset form function
  const resetForm = () => {
    setPostTitle('');
    setPostContent('');
    setSelectedCategories([]);
    setAgeRecommend('0-5');
    setVideoLink('');
    removeFile();
  };

  // Handle create post with file upload
  const handleCreatePost = async () => {
    try {
      // Validate required fields
      if (!postTitle.trim()) {
        alert('Please enter a post title');
        return;
      }
      if (!selectedFile && !videoLink.trim()) {
        alert('Please either upload an image or provide a video link');
        return;
      }
      const postData = {
        title: postTitle,
        content: postContent,
        categories: selectedCategories,
        recommend_age_range: ageRecommend,
        youtube_link: videoLink,
      };
      const formData = new FormData();
      formData.append('post', JSON.stringify(postData));
      if (selectedFile) {
        formData.append('picture', selectedFile);
      }
      const response = await fetch('http://localhost:8080/create_post', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create post: ${errorText}`);
      }
      const result = await response.json();
      console.log('Post created successfully:', result);
      // Reset form and close modal
      resetForm();
      setIsCreateModalOpen(false);
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    resetForm();
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <nav className="w-full bg-white shadow-sm px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-50">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="LifeSkill Icon" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-logo.png';
              }}
            />
            <span className="text-xl font-bold text-gray-700">Life Skill</span>
          </Link>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center w-full md:max-w-[600px] px-3 py-1">
          <input
            type="text"
            placeholder="Search what content you want..."
            className="flex-1 text-sm text-black shadow-sm rounded-l-full px-3 py-2 bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="flex items-center justify-center bg-[#3498db] hover:bg-[#2471a3] h-[37px] w-[60px] rounded-r-full transition-colors"
          >
            <img 
              src="/Search.png" 
              alt="Search Icon" 
              className="w-[20px] h-[20px] object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-search.png';
              }}
            />
          </button>
        </form>

        {/* Login / Profile */}
        {isLoading ? (
          <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <Link to="/tutorial">
              <button className="bg-[#f7dc6f] text-white font-semibold shadow-sm px-4 py-2 rounded-full text-sm hover:bg-[#C5A241] transition flex items-center gap-2">
                <img 
                  src="/tutorial.png" 
                  alt="Tutorial Icon" 
                  className="w-5 h-5"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-tutorial.png';
                  }}
                /> 
                Tutorial
              </button>
            </Link>
            
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
                    src={user.picture ? `http://localhost:8080/${user.picture}` : "/default-avatar.png"}
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <span className="text-base font-semibold">{user.username}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 ml-auto transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full w-48 bg-[#85929e] rounded-b-2xl shadow-xl z-50 flex flex-col items-start overflow-hidden">
                  <Link
                    to="/mypage"
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img 
                      src="/home.png" 
                      alt="home Icon" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-home.png';
                      }}
                    />
                    Home
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img 
                      src="/profile.png" 
                      alt="profile Icon" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-profile.png';
                      }}
                    />
                    Profile
                  </Link>
                  <Link
                    to="/postrequest"
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img 
                      src="/postre.png" 
                      alt="Post request Icon" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-post.png';
                      }}
                    />
                    Post Requests
                  </Link>
                  <Link
                    to="/contactus"
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img 
                      src="/contactus.png" 
                      alt="Contact us Icon" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-contact.png';
                      }}
                    />
                    Contact Us
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 !text-white hover:bg-gray-600 transition"
                  >
                    <img 
                      src="/logout.png" 
                      alt="logout Icon" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-logout.png';
                      }}
                    />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/login">
            <button className="bg-[#5A7FB3] hover:bg-[#147cd5] text-white px-4 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors">
              Login / Sign up
            </button>
          </Link>
        )}
      </nav>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
              <button 
                onClick={handleModalClose}
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
                className="w-full px-4 py-3 bg-gray-100 rounded-lg border-none shadow-sm outline-none text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* Rich Text Editor */}
            <div className="mb-6">
              {/* Toolbar */}
              <div className="bg-gray-900 rounded-t-lg p-2 flex items-center gap-1 text-white text-sm">
                <span className="text-xs mr-2">Markdown Editor</span>
              </div>
              
              {/* Text Area */}
              <textarea
                placeholder="Body text (optional)"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full h-24 px-4 py-3 bg-gray-800 text-white rounded-b-lg border-none outline-none resize-none placeholder-gray-400"
              />
            </div>

            {/* Categories */}
            <div className="mb-4">
              <div className="bg-gray-600 rounded-xl px-4 py-2 mb-3">
                <span className="text-white font-medium">Categories:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(category => (
                    <button
                      key={category.ID}
                      onClick={() => toggleCategory(category.ID)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        selectedCategories.includes(category.ID)
                          ? 'bg-[#43A895] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.categories_name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mb-4">
                <div className="flex items-center gap-4 mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-gray-300 text-gray-700 px-3 py-2 rounded-full text-sm hover:bg-gray-400 transition cursor-pointer flex items-center gap-2"
                  >
                    📎 Import files
                  </label>
                  <span className="text-xs text-gray-500">
                    ไฟล์ JPG, JPEG, PNG เท่านั้น
                  </span>
                  {/* Age Recommend */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Age Recommend</span>
                  <select
                    value={ageRecommend}
                    onChange={(e) => setAgeRecommend(e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-100 rounded text-center text-sm border-none outline-none"
                  >
                    <option value="0-5">0-5</option>
                    <option value="6-10">6-10</option>
                    <option value="11-15">11-15</option>
                    <option value="16-19">16-19</option>
                    <option value="20-99">20+</option>
                  </select>
                </div>

                </div>
                
                {/* File Preview */}
                {filePreview && (
                  <div className="relative inline-block">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  *โพสต์จะถูกอัปโหลดไปที่ระบบหลังจากเพิ่มรูป 1 รูป
                </div>
        
            </div>

            {/* Video Link Section */}
            <div className="mb-4">
              <input
                type="url"
                placeholder="Link Youtube Video (Optional)"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 rounded-lg border-none shadow-sm outline-none text-gray-700 placeholder-gray-500"
              />
              <span className="text-xs text-gray-500 block mt-1">
                *กรณีเป็นวิดีโอสามารถใส่ลิงค์ได้ตรงนี้
              </span>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                <Link to="/tutorial">
                  <button className="bg-[#f7dc6f] text-white px-4 py-2 shadow-sm rounded-full text-sm font-medium hover:bg-[#C5A241] transition flex items-center gap-1">
                    <img src="tutorial.png" alt="Tutorial Icon" className="w-5 h-5" /> Tutorial
                  </button>
                </Link>
                <button 
                  onClick={handleCreatePost}
                  className="bg-[#45b39d] text-white px-6 py-2 shadow-sm rounded-full text-sm font-medium hover:bg-[#359182] transition"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;