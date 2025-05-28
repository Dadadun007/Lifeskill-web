import { useState, useEffect } from "react";
import { X, Upload, ChevronDown,} from "lucide-react";



function Createpost({ isOpen, onClose }) {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ageRecommend, setAgeRecommend] = useState('0-5');
  const [categories, setCategories] = useState([]);

  // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8080/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    if (isOpen) fetchCategories(); // fetch only when modal is open
  }, [isOpen]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCreatePost = () => {
    console.log('Creating post:', { postTitle, postContent, selectedCategories, ageRecommend });
    onClose();
    setPostTitle('');
    setPostContent('');
    setSelectedCategories([]);
    setAgeRecommend('0-5');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-10 w-full max-w-2xl relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <X />
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
          <RichTextEditor
            value={postContent}
            onChange={setPostContent}
            style={{ minHeight: 180, marginBottom: 20 }}
          />
        </div>

        {/* Categories */}
        <div className="mb-4">
          <div className="bg-gray-400 rounded-full px-4 py-3 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Categories :</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
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

        {/* Footer */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-400 transition flex items-center gap-1">
                Import files
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Age Recommend</span>
                <select
                  value={ageRecommend}
                  onChange={(e) => setAgeRecommend(e.target.value)}
                  className="w-24 px-2 py-1 bg-gray-100 rounded text-center text-xs border-none outline-none"
                >
                  <option value="0-5">0-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-15">11-15</option>
                  <option value="16-19">16-19</option>
                  <option value="20+">20+</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-[#E2C576] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#C5A241] transition flex items-center gap-1">
                💡 Tutorial
              </button>
              <button
                onClick={handleCreatePost}
                className="bg-[#43A895] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#359182] transition"
              >
                Post
              </button>
            </div>
          </div>
          <div className="text-left mt-2">
            <span className="text-xs text-gray-500">*โพสต์ต้องการเพิ่มรูปหรือคลิปอย่างน้อย 1 files</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Createpost;
