import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import {
  ChevronDown,
  Bookmark,
  Heart,
  MessageCircle,
} from 'lucide-react';

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/user/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));

    fetch('http://localhost:8080/get_all_post', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-2">
        {/* Hero Section */}
        <div className="text-center mb-3 py-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
             Welcome to Life Skill Community
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Learn, Share & Master
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
            Life Skills Together

            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
             Join our community of learners sharing practical skills, tips, and experiences to help you thrive in everyday life.
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              สำรวจทักษะชีวิต
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all">
              เข้าร่วมชุมชน
            </button>
          </div> */}
        </div>

        {/* Filter Section */}
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
          <div className="text-sm text-gray-500">
            {Array.isArray(posts) ? posts.length : 0} posts
          </div>
        </div>

        {/* Error Handling Section */}
        {!user && (
          <div className="text-center text-red-500 mb-8">
            Please log in to view post.
          </div>
        )}
        {Array.isArray(posts) && posts.length === 0 && user && (
          <div className="text-center text-gray-500 mb-8">
            No posts found at this time.
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid gap-6">
          {Array.isArray(posts) && posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="block group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.avatar || 'https://via.placeholder.com/32'}
                          alt={post.username}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <div>
                          <span className="text-gray-900 font-semibold">{post.username}</span>
                          <div className="text-xs text-gray-500">Recently Posted</div>
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

                    {/* Image */}
                    {post.image && (
                      <div className="lg:w-80 flex-shrink-0">
                        <img
                          src={post.image}
                          alt="Post image"
                          className="w-full h-48 lg:h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm hover:shadow-md">
            See more posts
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;

