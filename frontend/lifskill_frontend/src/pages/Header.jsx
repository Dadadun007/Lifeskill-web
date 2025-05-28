import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import Createpost from './Createpost';

// Add DefaultAvatar component
const DefaultAvatar = ({ username, size = 24 }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = [
      '#3498db', // Blue
      '#2ecc71', // Green
      '#e74c3c', // Red
      '#f1c40f', // Yellow
      '#9b59b6', // Purple
      '#1abc9c', // Turquoise
      '#e67e22', // Orange
      '#34495e', // Dark Blue
    ];
    
    // Use the username to consistently generate the same color for the same user
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: getRandomColor(username),
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.4}px`,
        fontWeight: 'bold',
      }}
    >
      {getInitials(username)}
    </div>
  );
};

function Header() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ageRecommend, setAgeRecommend] = useState('');
  const [categories, setCategories] = useState([]); // 👈 ใช้ state จาก API
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:8080/user/me', { credentials: 'include' });
        if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
        const data = await res.json();
        if (data?.username) {
          console.log('User data received:', data);
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err.message);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Fetch categories from backend
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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCreatePost = async () => {
    try {
      const res = await fetch('http://localhost:8080/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          categories: selectedCategories,
          ageRecommend,
        }),
      });

      if (!res.ok) throw new Error(`Create post failed: ${await res.text()}`);
      const data = await res.json();
      console.log('Post created successfully:', data);

      setIsCreateModalOpen(false);
      setPostTitle('');
      setPostContent('');
      setSelectedCategories([]);
      setAgeRecommend('');
    } catch (error) {
      console.error('Error creating post:', error.message);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file); // 'image' = field name ที่ backend คาดหวัง

  try {
    setUploading(true);
    const res = await fetch('http://localhost:8080/post/image', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    console.log('Uploaded image:', data);

    alert('Upload success ✅');
    // คุณอาจเก็บ URL ที่ได้กลับมาใน state ไว้แนบกับ post ก็ได้
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Upload failed ❌');
  } finally {
    setUploading(false);
  }
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

        {/* Search */}
        <div className="flex items-center w-full md:max-w-[600px] px-3 py-1">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 text-sm text-black shadow-sm rounded-l-full px-3 py-2 bg-white"
          />
          <button className="flex items-center justify-center bg-[#3498db] hover:bg-[#2471a3] h-[37px] w-[60px] rounded-r-full">
            <img src="Search.png" alt="Search Icon" className="w-[20px] h-[20px]" />
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
            <button
              className="bg-[#3498db] text-white font-semibold shadow-sm px-4 py-2 rounded-full text-sm hover:bg-[#2471a3] transition"
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Create Post
            </button>
            <div className="relative w-fit" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((open) => !open)}
                className={`flex items-center shadow-sm bg-[#85929e] px-4 py-2 text-white hover:bg-gray-600 transition-colors w-50 ${isDropdownOpen ? "rounded-t-2xl" : "rounded-full"}`}
              >
                <div className="flex items-center gap-2">
                  {user.picture ? (
                    <img
                      src={`http://localhost:8080/${user.picture}`}
                      alt="User Avatar"
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentNode.appendChild(
                          <DefaultAvatar username={user.username} size={24} />
                        );
                      }}
                    />
                  ) : (
                    <DefaultAvatar username={user.username} size={24} />
                  )}
                  <span className="text-base font-semibold">{user.username}</span>
                </div>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full w-full bg-[#85929e] rounded-b-2xl shadow-xl z-50 flex flex-col items-start">
                  <Link to="/" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 text-white hover:bg-gray-600 transition w-full">Home</Link>
                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 text-white hover:bg-gray-600 transition w-full">Profile</Link>
                  <Link to="/postrequest" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 text-white hover:bg-gray-600 transition w-full">Post Requests</Link>
                  <Link to="/contactus" onClick={() => setIsDropdownOpen(false)} className="px-4 py-3 text-white hover:bg-gray-600 transition w-full">Contact Us</Link>
                  <button onClick={handleLogout} className="px-4 py-3 text-white hover:bg-gray-600 transition w-full">Log out</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/login">
            <button className="bg-[#5A7FB3] hover:bg-[#147cd5] text-white px-4 py-1.5 rounded-lg text-sm">
              Login / Sign up
            </button>
          </Link>
        )}
      </nav>

      {/* Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-150 relative shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Post</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                <X size={24} />
              </button>
            </div>

            {/* Form Fields */}
            <input
              type="text"
              placeholder="Title*"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full shadow-sm mb-4 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 placeholder-gray-500"
            />
             <div className="mb-6">
                <div className=" bg-gray-900 rounded-t-lg shadow-sm p-2 flex items-center gap-1 text-white text-sm">
                  <span className="text-xs mr-2">Markdown Editor</span>
                </div>
                <textarea
                  placeholder="Body text (optional)"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full h-24 shadow-sm px-4 py-3 bg-gray-800 text-white rounded-b-lg resize-none"
                />
              </div>

            {/* Dynamic Categories */}
            <div className="mb-4">
              <div className="bg-gray-600 rounded-full px-4 py-2 mb-3">
                <span className="text-white font-medium">Categories:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categories.map(category => (
                    <button
                      key={category.ID}
                      onClick={() => toggleCategory(category.categories_name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        selectedCategories.includes(category.categories_name)
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

            {/* Footer Actions */}
           <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative mb-1">
                <button
                  className="bg-blue-100 shadow-sm text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Import files 📎'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-gray-800 text-sm">Age Recommend</span>
                <select
                  value={ageRecommend}
                  onChange={(e) => setAgeRecommend(e.target.value)}
                  className="px-1 py-1 bg-gray-100 rounded text-xs"
                >
                  <option value="0-5">0-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-15">11-15</option>
                  <option value="16-19">16-19</option>
                  <option value="20+">20+</option>
                </select>
              </div>
            
            </div>
              <div className="text-xs text-gray-500">*โพสต์จะถูกอัปโหลดไปที่ระบบหลังจากเพิ่มรูปอย่างน้อย 1 รูป</div>

            {/* เดี๋ยวแก้ตัวแปรdatabase */}
            <input
              type="text"
              placeholder="link video"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 shadow-sm rounded-lg text-gray-700 placeholder-gray-500"
            />

          
            <div className="text-xs text-gray-500"> *สำหรับใส่ลิงค์วิดีโอ youtube (ถ้ามี) </div>

            
            <div className="flex justify-end gap-2">
              <Link to="/tutorial">
                <button className="bg-[#f7dc6f] shadow-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#C5A241]">Tutorial</button>
              </Link>
              <button
                onClick={handleCreatePost}
                className="bg-[#45b39d] shadow-sm text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#359182]"
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
