import { useState } from "react"

import {X,Bold,Italic,Underline,Type,Paperclip,List,ListOrdered,Link,Undo,Table,MoreHorizontal,Upload,ChevronDown,} from "lucide-react"

function Createpost({ isOpen, onClose }) {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Foods', 'Pets']);
  const [ageRecommend, setAgeRecommend] = useState('<10');
  const [fileCount, setFileCount] = useState(1);
  const categories = ['Foods', 'Pets', 'Travel', 'Tech', 'Health', 'Education', 'Sports', 'Art'];

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
    // Reset form
    setPostTitle('');
    setPostContent('');
    setSelectedCategories(['Foods', 'Pets']);
    setAgeRecommend('<10');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-10 w-full max-w-2xl relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &#10005;
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

        {/* Mantine Rich Text Editor */}
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
              {categories.slice(0, 8).map(category => (
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Import Files */}
            <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-400 transition flex items-center gap-1">
              Import files
            </button>
            
            {/* Age Recommend */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Age Recommend</span>
              <input
                type="text"
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
        <div className="text-left">
          <span className="text-xs text-gray-500">*ไฟล์จะถูกอัปโหลดไปที่ระบบ หลังจาก {fileCount} files</span>
        </div>
      </div>
    </div>
  );
}

export default Createpost;