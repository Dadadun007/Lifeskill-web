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
  const [categories, setCategories] = useState([]); // State for categories
  const [sortOrder, setSortOrder] = useState('recent'); // State for sort order: 'recent' or 'mostlike'
  const [selectedCategory, setSelectedCategory] = useState(null); // State for selected category ID
  const [showCategories, setShowCategories] = useState(false); // State to toggle category dropdown

  // Define category color mapping
  const categoryColors = {
    "General": { bgColor: 'bg-gray-100', textColor: 'text-gray-800', darkBgColor: 'dark:bg-gray-700', darkTextColor: 'dark:text-gray-200' },
    "Mechanical": { bgColor: 'bg-red-100', textColor: 'text-red-800', darkBgColor: 'dark:bg-red-900', darkTextColor: 'dark:text-red-300' },
    "Finance": { bgColor: 'bg-green-100', textColor: 'text-green-800', darkBgColor: 'dark:bg-green-900', darkTextColor: 'dark:text-green-300' },
    "Manners": { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', darkBgColor: 'dark:bg-yellow-900', darkTextColor: 'dark:text-yellow-300' },
    "Cooking": { bgColor: 'bg-purple-100', textColor: 'text-purple-800', darkBgColor: 'dark:bg-purple-900', darkTextColor: 'dark:text-purple-300' },
    "Sport": { bgColor: 'bg-pink-100', textColor: 'text-pink-800', darkBgColor: 'dark:bg-pink-900', darkTextColor: 'dark:text-pink-300' },
    "Plant": { bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', darkBgColor: 'dark:bg-indigo-900', darkTextColor: 'dark:text-indigo-300' },
    "Health": { bgColor: 'bg-teal-100', textColor: 'text-teal-800', darkBgColor: 'dark:bg-teal-900', darkTextColor: 'dark:text-teal-300' },
    // Default color if category name is not in the map
    "default": { bgColor: 'bg-blue-100', textColor: 'text-blue-800', darkBgColor: 'dark:bg-blue-900', darkTextColor: 'dark:text-blue-300' },
  };

  useEffect(() => {
    // Check user authentication status
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

    // Fetch categories
    fetch('http://localhost:8080/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to fetch categories:', err));

  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect to fetch posts whenever sortOrder or selectedCategory changes
  useEffect(() => {
    let url = 'http://localhost:8080/filter_posts?';
    
    const params = new URLSearchParams();

    if (sortOrder && sortOrder !== 'recent') {
      params.append('sort', sortOrder);
    }
    
    // Explicitly check if selectedCategory is a number (i.e., a valid category ID)
    if (typeof selectedCategory === 'number') {
      params.append('category_id', selectedCategory.toString());
    }

    url += params.toString();

    console.log('Fetching posts with URL:', url);

    fetch(url, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        console.log('Received response status:', res.status);
        if (!res.ok) {
          console.error('Error fetching posts:', res.status, res.statusText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched posts data:', data);
        setPosts(data);
      })
      .catch((error) => {
        console.error('Error during fetch or processing:', error);
        setPosts([]); // Clear posts on error
      });

  }, [sortOrder, selectedCategory]); // Rerun when sortOrder or selectedCategory changes

  const handleCategoryClick = (categoryId) => {
    console.log('Category clicked, setting selectedCategory to:', categoryId);
    setSelectedCategory(categoryId);
    setShowCategories(false); // Close dropdown after selection
  };

  const handleSortClick = (order) => {
    setSortOrder(order);
  };

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
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-900">Post</h2>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-4 text-sm">
              {/* Sort by */}
              <div
                className={`flex items-center gap-2 cursor-pointer transition-colors ${sortOrder === 'recent' ? 'text-teal-600 hover:text-teal-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleSortClick('recent')}
              >
                <span>Recent</span>
              </div>
              <div
                className={`flex items-center gap-2 cursor-pointer transition-colors ${sortOrder === 'mostlike' ? 'text-teal-600 hover:text-teal-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleSortClick('mostlike')}
              >
                <span>Most Liked</span>
              </div>
              

              {/* Categories Dropdown */}
              <div className="relative">
                <div
                  className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCategories(!showCategories)}
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : 'rotate-0'}`} />
                </div>
                {showCategories && (

                  <div className="absolute z-50 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

                    <div className="py-1">
                       <div
                          key="all-categories"
                          className={`block px-4 py-2 text-sm cursor-pointer ${selectedCategory === null ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => handleCategoryClick(null)} // Select all categories
                        >
                          All Categories
                        </div>
                      {Array.isArray(categories) && categories.map((category) => (
                        <div
                          key={category.ID}
                          className={`block px-4 py-2 text-sm cursor-pointer ${selectedCategory === category.ID ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => handleCategoryClick(category.ID)}
                        >
                          {category.categories_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
          <div className="text-sm text-gray-500">
            {Array.isArray(posts) ? posts.length : 0} posts
          </div>
        </div>
        
        {/* Enhanced Login Reminder */}
        {!user && (
          <div className="relative mb-8">
            <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border border-teal-100 rounded-2xl p-8 text-center overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-full opacity-5">
                <div className="absolute top-4 left-4 w-8 h-8 bg-teal-400 rounded-full"></div>
                <div className="absolute top-8 right-8 w-6 h-6 bg-cyan-400 rounded-full"></div>
                <div className="absolute bottom-6 left-8 w-4 h-4 bg-blue-400 rounded-full"></div>
                <div className="absolute bottom-4 right-6 w-10 h-10 bg-teal-300 rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Join Our Community!
                </h3>
                
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                  Sign in to like posts, leave comments, and connect with fellow learners sharing life skills and experiences.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-xl font-semibold border-2 border-teal-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </Link>
                  
                  <span className="text-gray-400 hidden sm:block">or</span>
                  
                  <Link 
                    to="/register" 
                    className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-xl font-semibold border-2 border-teal-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </Link>
                </div>
                
                {/* Feature highlights */}
                <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    <span>Like & Save Posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span>Join Discussions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Share Your Skills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Posts Message */}
        {Array.isArray(posts) && posts.length === 0 && (
          <div className="text-center text-gray-500 mb-8">
            No posts found at this time.
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid gap-6">
          {Array.isArray(posts) && posts.map((post) => {
            console.log('Post CreatedAt value:', post.created_at);
            return (
            <Link key={post.id} to={`/posts/${post.id}`} className="block group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      {/* Author Info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={post.user?.picture ? `http://localhost:8080/${post.user.picture}` : 'https://via.placeholder.com/32'}
                          alt={post.user?.username || 'User'}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <div>
                          <span className="text-gray-900 font-semibold">{post.user?.username || 'Anonymous'}</span>
                          <div className="text-xs text-gray-500">Posted {new Date(post.created_at).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed line-clamp-3">
                          {post.content}
                        </p>
                        {/* Categories */}
                        {Array.isArray(post.categories) && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.categories.map((category) => {
                              const colors = categoryColors[category.categories_name] || categoryColors.default;
                              return (
                                <span
                                  key={category.ID}
                                  className={`${
                                    colors.bgColor
                                  } ${colors.textColor} ${colors.darkBgColor} ${colors.darkTextColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}
                                >
                                  {category.categories_name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Post Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-rose-500 hover:text-rose-600 cursor-pointer transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="font-medium">{post.like || 0} likes</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 hover:text-blue-600 cursor-pointer transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{post.comments?.length || 0} comments</span>
                        </div>
                      </div>
                    </div>

                    {/* Post Image */}
                    {post.picture && (
                      <div className="lg:w-80 flex-shrink-0">
                        <img
                          src={`http://localhost:8080/uploads/${post.picture}`}
                          alt="Post image"
                          className="w-full h-48 lg:h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
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