import { useState } from "react";
import { Link } from "react-router-dom";
import Header from './Header';

function Profile() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("profile.jpg");
  const [formData, setFormData] = useState({
    username: "Username",
    email: "test@gmail.com",
    age: "18",
    gender: "Male",
    talents: ["Art", "Cook"],
  });

  const allTalents = ["Art", "Cook", "Photography", "Coding"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
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

  const handleSave = () => {
    setIsPopupOpen(false);
    // ปกติจะส่งข้อมูลไป server ตรงนี้ แต่ตอนนี้ปิด popup อย่างเดียว
  };

  const handleCancel = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black font-sans w-full overflow-x-hidden relative">
      {/* Pop-up */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
            <div className="flex flex-col items-center gap-4">
              {/* รูปโปรไฟล์ */}
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
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
                        className="w-full border rounded-full px-4 py-2"
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
                        className="w-full border rounded-full px-4 py-2"
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
                            className="w-full border rounded-full px-4 py-2"
                        />
                        </div>
                        <div className="flex-1">
                        <label className="block text-sm font-semibold mb-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full border rounded-full px-4 py-2"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        </div>
                    </div>

                    {/* Talents แบบปุ่ม */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Talents</label>
                        <div className="flex flex-wrap gap-2">
                        {allTalents.map((talent) => (
                            <button
                            key={talent}
                            type="button"
                            onClick={() => handleTalentChange(talent)}
                            className={`px-4 py-2 rounded-full border 
                                ${formData.talents.includes(talent) 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-700'}
                            `}
                            >
                            {talent}
                            </button>
                        ))}
                        </div>
                    </div>
                    </div>

              {/* ปุ่ม Save/Cancel */}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleSave}
                  className="bg-[#43A895] hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

         <Header />

      {/* Profile Section */}
      <main className="flex-1 px-4 md:px-6 w-full max-w-screen-lg mx-auto mt-8">
        {/* User Info */}
        <section className="bg-white shadow-md rounded-xl p-6 mb-8 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h1 className="text-2xl font-bold">{formData.username}</h1>
              <p>Email : {formData.email}</p>
              <p>Age : {formData.age}</p>
              <p>Gender : {formData.gender}</p>
              <p>Talents : {formData.talents.map((t, i) => (
                <span key={i} className="bg-gray-200 rounded-full px-2 py-1 mx-1 text-sm">{t}</span>
              ))}</p>
            </div>
          </div>

          {/* ปุ่ม Edit และ Change Password */}
          <div className="absolute bottom-6 right-6 flex flex-col md:flex-row gap-2">
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-[#5A7FB3] hover:bg-[#476799] text-white px-6 py-2 rounded-full"
            >
              Edit Profile
            </button>
            <button className="bg-[#43A895] hover:bg-[#2e7b6b] text-white px-6 py-2 rounded-full">
              Change Password
            </button>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button className="px-4 py-2 rounded-full bg-blue-100 text-[#5A7FB3] font-semibold">
            Your Posts
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 font-semibold">
            Your Achievement
          </button>
        </div>

        {/* Your Posts */}
        <section className="flex flex-col gap-6">
          {/* Post 1 */}
          <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md p-4 relative">
            <div className="flex flex-col justify-between flex-1">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <img src="profile.jpg" alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  <h4 className="font-bold text-black text-sm">Username</h4>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Topic</h3>
                <p className="text-sm text-gray-600">detail</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">Approve</span>
                  <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">Art</span>
                </div>
              </div>
            </div>
            <button className="absolute top-2 right-2 text-red-500">🗑️</button>
            <img src="test.png" alt="Post" className="w-full md:w-40 h-32 object-cover rounded-lg mb-4 md:mb-0 md:ml-4" />
          </div>

          {/* Post 2 */}
          <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md p-4 relative">
            <div className="flex flex-col justify-between flex-1">
              <div className="flex items-center gap-2 mb-2">
                <img src="profile.jpg" alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                <h4 className="font-bold text-black text-sm">Username</h4>
              </div>
              <div>
                <h3 className="font-bold text-lg">Topic</h3>
                <p className="text-sm text-gray-600">detail</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">Waiting</span>
                </div>
              </div>
            </div>
            <img src="test.png" alt="Post" className="w-full md:w-40 h-32 object-cover rounded-lg mb-4 md:mb-0 md:ml-4" />
            <button className="absolute top-2 right-2 text-red-500">🗑️</button>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Profile;
