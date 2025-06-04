import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from './Header';
import { Heart, MessageCircle, Search as SearchIcon, Home } from 'lucide-react';
import { getApiUrl, getImageUrl } from '../config';

function Search() {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = searchParams.get('q');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(getApiUrl(`/search_post?q=${encodeURIComponent(query)}`), {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data = await response.json();
        console.log('Search results:', data);
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to perform search. Please try again.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
              <SearchIcon className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Search Error</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
            >
              <SearchIcon className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600">
            {loading ? 'Searching...' : `Found ${posts.length} results`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-teal-600"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && (!posts || posts.length === 0) && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
              <SearchIcon className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Results Found</h2>
            <p className="text-gray-600 mb-2 text-lg">
              We couldn't find any posts matching "{query}"
            </p>
            

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/"
                className="inline-flex items-center gap-2 bg-white text-teal-600 px-6 py-3 rounded-xl font-semibold border-2 border-teal-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
              <button 
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <SearchIcon className="w-5 h-5" />
                Try Another Search
              </button>
            </div>

          </div>
        )}

        {/* Search Results */}
        {!loading && posts && posts.length > 0 && (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="block group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Content */}
                      <div className="flex-1 space-y-6">
                        {/* Author Info */}
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              post.user && post.user.picture
                                ? (
                                    post.user.picture.startsWith('http')
                                      ? post.user.picture
                                      : getImageUrl(post.user.picture)
                                  )
                                : "/default-avatar.png"
                            }
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
                              {post.categories.map((category) => (
                                <span
                                  key={category.ID}
                                  className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                                >
                                  {category.categories_name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Post Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-rose-500">
                            <Heart className="w-4 h-4" />
                            <span className="font-medium">{post.like || 0} likes</span>
                          </div>
                          <div className="flex items-center gap-2 text-blue-500">
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
        )}
      </main>
    </div>
  );
}

export default Search; 