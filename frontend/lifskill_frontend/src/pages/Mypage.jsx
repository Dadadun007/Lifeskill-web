import { useEffect, useState } from 'react';
import { ChevronDown, Bookmark, Heart, MessageCircle, User, Search, Bell, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Mypage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/my-posts', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => {
        console.error('Error fetching my posts:', err);
        setPosts([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-1">
        <div className="text-center mb-12 py-12">
      <div className="mb-2 py-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight text-left">
          Recommended
        </h1>
        <div className="relative">
            <div className="flex overflow-x-auto gap-4 px-1">
              {Array.isArray(posts) && posts.map((post) => (
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
      </div>
     
    </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-900">Post</h2>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 cursor-pointer text-teal-600 hover:text-teal-700 font-medium">
                <span>Most Liked</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700">
                <span>Categories</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">{Array.isArray(posts) ? posts.length : 0} posts</div>
        </div>

        <div className="grid gap-6">
          {Array.isArray(posts) && posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="block group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.avatar || "/default-avatar.png"}
                          alt={post.username}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <div>
                          <span className="text-gray-900 font-semibold">{post.username}</span>
                          <div className="text-xs text-gray-500">recently</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-tight">
                          {post.topic}
                        </h3>
                        <p className="text-gray-600 leading-relaxed line-clamp-2">
                          {post.detail}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-rose-500 hover:text-rose-600 cursor-pointer transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="font-medium">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 hover:text-blue-600 cursor-pointer transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{post.comments_count}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-500 hover:text-amber-600 cursor-pointer transition-colors">
                          <Bookmark className="w-4 h-4" />
                          <span className="font-medium">{post.achievement}</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-80 flex-shrink-0">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post image"
                        className="w-full h-48 lg:h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Mypage;
