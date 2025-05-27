import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { ChevronDown, Bookmark, Heart, MessageCircle } from 'lucide-react';

function Mypage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/get_my_post', {
      method: 'GET',
      credentials: 'include', // ต้องใช้เพื่อส่ง cookie JWT ไปด้วย
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data); // สมมุติ API ส่ง array ของ posts
      })
      .catch((err) => {
        console.error('Error fetching my posts:', err);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#EDEDED] text-white font-sans w-full overflow-x-hidden">
      <Header />

      <main className="flex-1 px-4 py-8 w-full max-w-[1400px] mx-auto">
        {/* Recommend */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold mb-5 text-left text-black ">Recommend</h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-4 px-1">
              {posts.map((post) => (
                <Link key={post.id} to={`/posts/${post.id}`}>
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={`img${post.id}`}
                    className="w-[250px] h-[140px] rounded-xl object-cover flex-shrink-0"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Filter */}
        <div className="flex justify-start items-center gap-4 text-sm mb-6 px-1 text-black">
          <div className="flex items-center gap-1 cursor-pointer text-gray-500 hover:text-gray-700">
            <span>Most like</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer text-gray-500 hover:text-gray-700">
            <span>Categories</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="block">
              <div className="bg-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.avatar || "/placeholder.svg"}
                      alt={post.username || "user"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-gray-700 font-medium">{post.username}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{post.topic}</h3>
                    <p className="text-gray-600">{post.detail}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="w-4 h-4" />
                      <span>{post.achievement || 0}</span>
                    </div>
                  </div>
                </div>

                <img
                  src={post.image || "/placeholder.svg"}
                  alt="Post image"
                  className="w-full md:w-[240px] h-[120px] object-cover rounded-xl"
                />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Mypage;