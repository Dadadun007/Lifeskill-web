import { useEffect, useState } from 'react';
import { ChevronDown, Bookmark, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Mypage() {
  const [posts, setPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('recent');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [userAge, setUserAge] = useState(null);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
    "default": { bgColor: 'bg-blue-100', textColor: 'text-blue-800', darkBgColor: 'dark:bg-blue-900', darkTextColor: 'dark:text-blue-300' },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingRecommended(true);
        
        // Fetch user data to get age
        const userRes = await fetch('http://localhost:8080/user/me', {
          credentials: 'include',
        });
        const userData = await userRes.json();
        setUserAge(userData.age);

        // Fetch categories
        const categoriesRes = await fetch('http://localhost:8080/categories', {
          credentials: 'include',
        });
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setCategories([]);
      } finally {
        setIsLoadingRecommended(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRecommended = async () => {
      if (userAge !== null && userAge > 0) {
        setIsLoadingRecommended(true);
        try {
          console.log(`Fetching recommended posts for age: ${userAge}`);
          const recommendedRes = await fetch(`http://localhost:8080/recommend_posts_by_age?age=${userAge}`, {
            credentials: 'include',
          });
          const recommendedData = await recommendedRes.json();
          setRecommendedPosts(recommendedData || []);
        } catch (err) {
          console.error('Error fetching recommended posts:', err);
          setRecommendedPosts([]);
        } finally {
          setIsLoadingRecommended(false);
        }
      } else if (userAge !== null && userAge === 0) {
         // User age is 0, no need to fetch recommended posts
         setIsLoadingRecommended(false); // Stop loading indicator if age is 0
         setRecommendedPosts([]); // Ensure it's empty
         console.log('User age is 0, skipping recommended posts fetch.');
      }
       // If userAge is still null, wait for the first effect to set it
    };

    fetchRecommended();

  }, [userAge]); // Rerun when userAge changes

  useEffect(() => {
    const fetchAllPosts = async () => {
      setIsLoadingPosts(true);
      try {
        let url = 'http://localhost:8080/filter_posts?';
        const params = new URLSearchParams();

        if (sortOrder && sortOrder !== 'recent') {
          params.append('sort', sortOrder);
        }

        if (typeof selectedCategory === 'number') {
          params.append('category_id', selectedCategory.toString());
        }

        // Add pagination parameters
        params.append('limit', '10');
        params.append('offset', '0');

        url += params.toString();

        console.log('Fetching ALL posts with URL:', url);

        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        console.log('Received response status for ALL posts:', res.status);
        if (!res.ok) {
          console.error('Error fetching ALL posts:', res.status, res.statusText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('Fetched ALL posts data:', data);
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setTotalPosts(data.total || 0);
        setOffset(10); // Reset offset for next load

      } catch (error) {
        console.error('Error during fetch or processing ALL posts:', error);
        setPosts([]);
        setTotalPosts(0);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchAllPosts();

  }, [sortOrder, selectedCategory]);

  const loadMorePosts = () => {
    if (isLoadingMore || !Array.isArray(posts) || posts.length >= totalPosts) return;

    setIsLoadingMore(true);
    let url = 'http://localhost:8080/filter_posts?';
    
    const params = new URLSearchParams();

    if (sortOrder && sortOrder !== 'recent') {
      params.append('sort', sortOrder);
    }
    
    if (typeof selectedCategory === 'number') {
      params.append('category_id', selectedCategory.toString());
    }

    params.append('limit', '10');
    params.append('offset', offset.toString());

    url += params.toString();

    fetch(url, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Ensure data.posts is an array before spreading
        const newPosts = Array.isArray(data.posts) ? data.posts : [];
        setPosts(prevPosts => [...(Array.isArray(prevPosts) ? prevPosts : []), ...newPosts]);
        setOffset(prevOffset => prevOffset + 10);
        setIsLoadingMore(false);
      })
      .catch((error) => {
        console.error('Error loading more posts:', error);
        setIsLoadingMore(false);
      });
  };

  const handleSortClick = (order) => {
    setSortOrder(order);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategories(false);
  };

  if (isLoadingRecommended && isLoadingPosts && (!Array.isArray(recommendedPosts) || recommendedPosts.length === 0) && (!Array.isArray(posts) || posts.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <style>{`
        .beautiful-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(20, 184, 166, 0.3) transparent;
        }
        
        .beautiful-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        
        .beautiful-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.8);
          border-radius: 10px;
          margin: 0 20px;
        }
        
        .beautiful-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.6), rgba(6, 182, 212, 0.8));
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
        }
        
        .beautiful-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.8), rgba(6, 182, 212, 1));
          box-shadow: 
            inset 0 0 0 1px rgba(255, 255, 255, 0.5),
            0 2px 8px rgba(20, 184, 166, 0.3);
        }
        
        .beautiful-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, rgba(13, 148, 136, 0.9), rgba(8, 145, 178, 1));
        }
        
        .beautiful-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        @media (max-width: 768px) {
          .beautiful-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
        }
      `}</style>
      
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-2">
        {/* Hero Section with Recommended Posts */}
        <div className="text-center mb-12 py-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            Recommended for Your Age
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Personalized
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
              Life Skills
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover life skills tailored to your age group and interests.
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-6 text-left">Recommended for You</h2>

          {/* Content within Recommended Section */}
          <div className="relative bg-white rounded-2xl shadow-xl p-6">
             {isLoadingRecommended ? (
                <div className="flex items-center justify-center py-8">
                   <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                </div>
             ) : userAge === null || userAge === 0 ? (
                <div className="text-center text-gray-600 py-8">
                  <p>Update your profile with your age to see personalized recommendations!</p>
                   {/* Optional: Add a link to the profile page if you have one */}
                   {/* <Link to="/profile" className="text-teal-600 hover:underline">Update Profile</Link> */}
                </div>
             ) : Array.isArray(recommendedPosts) && recommendedPosts.length > 0 ? (
                <div className="flex overflow-x-auto gap-6 px-1 pb-4 snap-x snap-mandatory beautiful-scrollbar">
                  {recommendedPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="flex-none w-[300px] snap-start"
                    >
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group">
                        {post.picture && (
                          <div className="h-40 overflow-hidden">
                            <img
                              src={`http://localhost:8080/uploads/${post.picture}`}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {Array.isArray(post.categories) && post.categories.map((cat, i) => {
                              const colors = categoryColors[cat.categories_name] || categoryColors.default;
                              return (
                                <span
                                  key={cat.id || i}
                                  className={`${colors.bgColor} ${colors.textColor} text-xs font-medium px-2 py-0.5 rounded-full`}
                                >
                                  {cat.categories_name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
             ) : ( // userAge > 0 but no recommended posts found
                <div className="w-full text-center text-gray-500 py-8">
                  No recommended posts found for your age group.
                </div>
             )}
          </div>
        </div>

        {/* Main Posts Feed Filter Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
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
                        onClick={() => handleCategoryClick(null)}
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

        {/* No Posts Message (for main feed) */}
        {Array.isArray(posts) && posts.length === 0 && !isLoadingPosts && (
          <div className="text-center text-gray-500 mb-8">
            No posts found matching your criteria.
          </div>
        )}

        {/* Posts Grid (Main Feed) */}
        <div className="grid gap-6">
          {Array.isArray(posts) && posts.map((post) => (
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
                            {post.categories.map((category, i) => {
                              const colors = categoryColors[category.categories_name] || categoryColors.default;
                              return (
                                <span
                                  key={category.ID || i}
                                  className={`${colors.bgColor} ${colors.textColor} ${colors.darkBgColor} ${colors.darkTextColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}
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
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          {Array.isArray(posts) && posts.length < totalPosts && (
            <button 
              onClick={loadMorePosts}
              disabled={isLoadingMore}
              className={`bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm hover:shadow-md ${
                isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                'See more posts'
              )}
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  
  );
}

export default Mypage;