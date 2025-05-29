import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from './Header';

function Profile() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
const [passwordData, setPasswordData] = useState({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");
const [fieldErrors, setFieldErrors] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

const handlePasswordChange = (e) => {
  const { name, value } = e.target;
  setPasswordData((prev) => ({ ...prev, [name]: value }));
  setPasswordError("");
  setPasswordSuccess("");
  setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  if ((name === "newPassword" || name === "confirmPassword")) {
    if (
      (name === "newPassword" && value !== passwordData.confirmPassword && passwordData.confirmPassword !== "") ||
      (name === "confirmPassword" && value !== passwordData.newPassword && passwordData.newPassword !== "")
    ) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "New passwords do not match." }));
    } else {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  }
};

const handleChangePasswordSubmit = async () => {
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    setFieldErrors((prev) => ({ ...prev, confirmPassword: "New passwords do not match." }));
    return;
  }
  try {
    const res = await fetch("http://localhost:8080/user/change-password", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setPasswordSuccess(data.message || "Password changed successfully.");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setIsChangePasswordOpen(false), 2000);
    } else {
      if (data.error && data.error.includes("Old password is incorrect")) {
        setFieldErrors((prev) => ({ ...prev, oldPassword: "Old password is incorrect." }));
      } else {
        setPasswordError(data.error || "Failed to change password.");
      }
    }
  } catch {
    setPasswordError("Server error. Please try again.");
  }
};

  const [profileImage, setProfileImage] = useState("profile.jpg");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    age: "",
    gender: "",
    talents: [],
  });
  const [categories, setCategories] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [savedPosts, setSavedPosts] = useState([]); // mock ข้อมูล savedPosts
  const [categoriesScore, setCategoriesScore] = useState([
    { name: 'ART', color: 'bg-blue-300', score: 80 },
    { name: 'COOK', color: 'bg-pink-300', score: 20 },
    { name: 'MATH', color: 'bg-yellow-200', score: 10 },
  ]);

  // ฟังก์ชันสำหรับดึงโพสต์ของตัวเอง
  const fetchMyPosts = () => {
    fetch('http://localhost:8080/my-posts', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setMyPosts(Array.isArray(data) ? data : []);
        console.log("myPosts data:", data);
      })
      .catch(() => setMyPosts([]));
  };

  useEffect(() => {
    fetch('http://localhost:8080/user/me', { credentials: 'include' })
      .then(res => res.json())
      .then(user => {
        // ตรวจสอบ talents ว่าเป็น array ของ string หรือ object
        let talents = [];
        if (Array.isArray(user.talents) && typeof user.talents[0] === "string") {
          talents = user.talents;
        } else if (Array.isArray(user.ExpertCategories)) {
          talents = user.ExpertCategories.map(cat => cat.categories_name || cat.CategoriesName);
        }
        setFormData({
          username: user.username || "",
          email: user.email || "",
          age: user.age ? String(user.age) : "",
          gender: user.gender || user.sex || "",
          talents: talents,
        });
        if (user.picture) {
          let picPath = user.picture.replace(/^\.?\/?/, '');
          if (!picPath.startsWith('http')) {
            picPath = `http://localhost:8080/${picPath}`;
          }
          setProfileImage(picPath);
        } else {
          setProfileImage("/default-avatar.png"); // fallback
        }
        localStorage.setItem('user', JSON.stringify(user));
      })
      .catch(() => setProfileImage("/default-avatar.png"));
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => setCategories([]));
  }, []);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  // mock: สมมุติว่ามี savedPosts (ถ้ายังไม่มี endpoint จริง)
  useEffect(() => {
    if (activeTab === 'achievement') {
      // ตัวอย่าง mock ข้อมูล savedPosts
      setSavedPosts([
        {
          id: 999,
          title: 'Saved Post Example',
          content: 'This is a saved post.',
          status: 'approved',
          categories: [{ id: 1, categories_name: 'Life Skill' }],
          user: { username: 'OtherUser', picture: '' },
          picture: '',
        },
      ]);
    }
  }, [activeTab]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        profileFile: file,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTalentChange = (talent) => {
    setFormData((prev) => {
      const talents = prev.talents.includes(talent)
        ? prev.talents.filter((t) => t !== talent)
        : [...prev.talents, talent];
      return { ...prev, talents };
    });
  };

  const handleSave = async () => {
    setIsPopupOpen(false);
    // map talents (ชื่อ) เป็น id
    const expertCategoryIDs = formData.talents
      .map(name => {
        const cat = categories.find(c => c.categories_name === name);
        return cat ? cat.ID : null;
      })
      .filter(id => id !== null);
    const form = new FormData();
    form.append("username", formData.username);
    form.append("email", formData.email);
    form.append("age", Number(formData.age));
    form.append("gender", formData.gender);
    // ส่ง expertCategoryIDs ทีละอัน (array)
    expertCategoryIDs.forEach(id => form.append("expertCategoryIDs", id));
    if (formData.profileFile) {
      form.append("picture", formData.profileFile);
    }
    await fetch("http://localhost:8080/user/update", {
      method: "PUT",
      credentials: "include",
      body: form,
    });
    // ดึง user/me ใหม่หลัง save สำเร็จ
    fetch('http://localhost:8080/user/me', { credentials: 'include' })
      .then(res => res.json())
      .then(user => {
        let talents = [];
        if (Array.isArray(user.talents) && typeof user.talents[0] === "string") {
          talents = user.talents;
        } else if (Array.isArray(user.ExpertCategories)) {
          talents = user.ExpertCategories.map(cat => cat.categories_name || cat.CategoriesName);
        }
        setFormData({
          username: user.username || "",
          email: user.email || "",
          age: user.age ? String(user.age) : "",
          gender: user.gender || user.sex || "",
          talents: talents,
        });
        if (user.picture) {
          let picPath = user.picture.replace(/^\.?\/?/, '');
          if (!picPath.startsWith('http')) {
            picPath = `http://localhost:8080/${picPath}`;
          }
          setProfileImage(picPath);
        } else {
          setProfileImage("/default-avatar.png");
        }
        localStorage.setItem('user', JSON.stringify(user));
      })
      .catch(() => setProfileImage("/default-avatar.png"));
  };

  const handleCancel = () => {
    setIsPopupOpen(false);
  };

  const handleDeletePost = async (postId) => {
    setPostToDelete(postId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      const res = await fetch(`http://localhost:8080/delete_posts/${postToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        fetchMyPosts();
        setIsDeleteConfirmOpen(false);
        setPostToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete post.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post. Please try again.');
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setPostToDelete(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black font-sans w-full overflow-x-hidden relative">
      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Delete Post</h2>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-colors"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-150 md-1 relative shadow-lg overflow-y-auto" style={{ maxHeight: '90vh' }}>
             <h2 className="text-xl font-bold mb-2 text-center">Edit Profile</h2>
            <div className="flex flex-col items-center gap-4">
              {/* รูปโปรไฟล์ */}
              <div className="relative flex flex-col items-center">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="profile-upload"
                  className="mt-2 bg-white shadow-sm px-2 rounded-lg text-gray-900 text-sm cursor-pointer hover:underline"
                  style={{ color: "#888" }}
                >
                  Upload Profile
                </label>
              </div>

              {/* ฟอร์ม */}
              <div className="w-full space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Username</label>
                        <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg border-none shadow-sm outline-none text-gray-800 placeholder-gray-800"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Email</label>
                        <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                         className="w-full px-3 py-2 bg-gray-100 rounded-lg  shadow-sm outline-none text-gray-800 "
                        />
                    </div>

                    {/* Age + Gender ข้างกัน */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                        <label className="block text-sm font-semibold mb-1">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gray-100 rounded-lg shadow-sm outline-none text-gray-800 "
                        />
                        </div>
                        <div className="flex-1">
                        <label className="block text-sm font-semibold mb-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                             className="w-full px-3 py-2 bg-gray-100 rounded-lg shadow-sm outline-none text-gray-800 "
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        </div>
                    </div>

                    {/* Talents แบบปุ่ม */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Talents</label>
                        <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                            key={cat.ID}
                            type="button"
                            onClick={() => handleTalentChange(cat.categories_name)}
                            className={`px-2 py-1 rounded-2xl  
                                ${formData.talents.includes(cat.categories_name) 
                                ? 'bg-[#5dade2] text-white shadow-sm' 
                                : 'bg-gray-200 text-gray-700'}
                            `}
                            >
                            {cat.categories_name}
                            </button>
                        ))}
                        </div>
                    </div>
                    </div>

              {/* ปุ่ม Save/Cancel */}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleSave}
                  className="bg-[#2ecc71] shadow-sm hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-400 shadow-sm hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Pop-up Change Password */}
        {isChangePasswordOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-5 text-center">Change Password</h2>
              <div className="space-y-3">
                <div className="mb-2">
                <label className="block text-sm font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg border-none shadow-sm outline-none text-gray-800 placeholder-gray-800"
                />
                {fieldErrors.oldPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.oldPassword}</p>}
                </div>
                <div className="mb-2">
                <label className="block text-sm font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg border-none shadow-sm outline-none text-gray-800 placeholder-gray-800"
                />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm New Password"
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg border-none shadow-sm outline-none text-gray-800 placeholder-gray-800"
                />
                {fieldErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
                {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
                {passwordSuccess && <p className="text-green-500 text-sm text-center">{passwordSuccess}</p>}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={handleChangePasswordSubmit}
                  className="bg-[#43A895] hover:bg-[#2e7b6b] shadow-sm text-white px-4 py-2 rounded-full"
                >
                  Confirm
                </button>
                 <button
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="bg-gray-400 hover:bg-gray-500 shadow-sm text-white px-4 py-2 rounded-full"
                >
                  Cancel
                </button>                                
              </div>
            </div>
          </div>
        )}

         <Header onPostCreated={fetchMyPosts} />

      {/* Profile Section */}
      <main className="flex-1 px-4 md:px-6 w-full max-w-screen-lg mx-auto mt-8">
        {/* User Info */}
       <section className="bg-white shadow-md rounded-xl p-6 mb-8">
  <div className="flex flex-col md:flex-row items-center gap-6">
    <img
      src={profileImage}
      alt="Profile"
      className="w-32 h-32 rounded-full object-cover"
    />
    <div className="flex-1 space-y-2 text-center md:text-left">
      <h1 className="text-2xl font-bold">{formData.username}</h1>
      <p>Email : {formData.email}</p>
      <p>Age : {formData.age}</p>
      <p>Gender : {formData.gender}</p>
      <p>
        Talents :
        {formData.talents.map((t, i) => (
          <span
            key={i}
            className="bg-gray-200 rounded-full px-2 py-1 mx-1 text-sm inline-block"
          >
            {t}
          </span>
        ))}
      </p>
    </div>
  </div>

  {/* ปุ่ม Edit และ Change Password */}
  <div className="flex flex-col md:flex-row gap-2 mt-2 justify-center md:justify-end">
    <button
      onClick={() => setIsPopupOpen(true)}
      className="bg-[#3498db] hover:bg-[#476799] shadow-sm text-white px-6 py-2 rounded-full"
    >
      Edit Profile
    </button>
    <button
      onClick={() => setIsChangePasswordOpen(true)}
      className="bg-[#43A895] hover:bg-[#2e7b6b] shadow-sm text-white px-5 py-2 rounded-full"
    >
      Change Password
    </button>
  </div>
</section>


        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-full font-semibold ${activeTab === 'posts' ? 'bg-blue-100 text-[#2980b9]' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('posts')}
          >
            Your Posts
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold ${activeTab === 'achievement' ? 'bg-blue-100 text-[#2980b9]' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setActiveTab('achievement')}
          >
            Your Achievement
          </button>
        </div>

        {/* Your Posts หรือ Your Achievement */}
        {activeTab === 'posts' ? (
          <section className="bg-[#f2f3f4] rounded-xl shadow-md p-6 min-h-[300px]">
            {Array.isArray(myPosts) && myPosts.length === 0 ? (
              <div className="text-center text-gray-500">No posts</div>
            ) : (
              Array.isArray(myPosts) && myPosts.map((post, idx) => (
                <div key={post.id || idx} className="flex flex-col md:flex-row bg-white rounded-lg shadow-md p-4 relative">
                  <div className="flex flex-col justify-between flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={
                          post.user && post.user.picture
                            ? (
                                post.user.picture.startsWith('http')
                                  ? post.user.picture
                                  : post.user.picture.includes('uploads/profile_pictures/')
                                    ? "http://localhost:8080/" + post.user.picture.replace(/^\.?\/?/, '')
                                    : "http://localhost:8080/uploads/profile_pictures/" + encodeURIComponent(post.user.picture)
                              )
                            : "/default-avatar.png"
                        }
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={e => {e.target.onerror=null; e.target.src='/default-avatar.png';}}
                      />
                      <h4 className="font-bold text-black text-lg ">{post.user && post.user.username ? post.user.username : "Unknown"}</h4>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="bg-[#e74c3c] rounded-full px-3 ml-2 shadow-sm text-white hover:bg-red-700 text-sm"
                        title="Delete Post"
                      >
                        delete
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{post.title || "No Title"}</h3>
                      <p className="text-sm text-gray-600">{post.content || "No Content"}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${post.status === 'approved' ? 'bg-green-200 text-green-800' : post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-200 text-red-800'}`}>{post.status}</span>
                        {post.categories && post.categories.length > 0 && post.categories.some(cat => cat.categoriesName || cat.categories_name) ?
                          post.categories.map((cat, i) =>
                            (cat.categoriesName || cat.categories_name) ? (
                              <span key={cat.id || i} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                {cat.categoriesName || cat.categories_name}
                              </span>
                            ) : null
                          )
                          : <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">No Category</span>
                        }
                      </div>
                    </div>
                  </div>
                  {post.picture ? (
                    <img
                      src={
                        post.picture.startsWith('http')
                          ? post.picture
                          : post.picture.startsWith('/')
                            ? "http://localhost:8080" + post.picture
                            : "http://localhost:8080/uploads/" + encodeURIComponent(post.picture)
                      }
                      alt="Post"
                      className="w-full md:w-40 h-32 object-cover rounded-lg mb-4 md:mb-0 md:ml-4"
                      onError={e => {e.target.onerror=null; e.target.src='/default-avatar.png';}}
                    />
                  ) : null}
                </div>
              ))
            )}
          </section>
        ) : (
          <section className="bg-white rounded-xl shadow-md p-6 min-h-[300px]">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="font-semibold text-xl ">Categories</span>
              <span className="font-semibold text-xl "> Your Score</span>
            </div>
            <div className="space-y-4">
              {categoriesScore.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between bg-gray-200 rounded-2xl shadow-sm px-4 py-3">
                  <span className={`px-4 py-2 rounded-full text-white font-bold text-md ${cat.color}`}>{cat.name}</span>
                  <div className="flex flex-col justify-center items-center h-full">
                    <span className="bg-green-200 text-green-800 font-bold px-4 py-1 rounded-full text-md shadow">{cat.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Profile;