import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, MessageCircle, Share } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:8080/user/me', {
          credentials: 'include',
        });
        setIsLoggedIn(res.ok);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setError(null);
        const response = await fetch(`http://localhost:8080/post/${id}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        setPost(data);
        if (isLoggedIn) {
          setLiked(data.has_liked);
          setBookmarked(data.has_bookmarked);
        }
        setComments(data.comments || []);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isLoggedIn]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/like_post/${id}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to like post');
      const data = await response.json();
      setLiked(!liked);
      setPost(prev => ({ ...prev, like: data.likes }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/post/${id}/bookmark`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to bookmark post');
      const data = await response.json();
      setBookmarked(data.bookmarked);
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:8080/post/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      const comment = await response.json();
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Post not found</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      {/* Main Content */}
      <div className="my-8 border-solid border-2 border-gray-300 rounded-lg max-w-2xl mx-auto bg-white">
        <div className="p-6">
          {/* Post Owner Details */}
          <div className="flex items-start space-x-3 mb-6">
            <img 
              src={post.user?.picture ? `http://localhost:8080/${post.user.picture}` : '/api/placeholder/40/40'} 
              alt="Post owner avatar" 
              className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{post.user?.username || 'Anonymous'}</h3>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">Post owner</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Share className="w-5 h-5" />
            </button>
          </div>

          {/* Post Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
          
          {/* Post Content */}
          <div className="mb-6">
            <p className="text-gray-700 mb-2">{post.content}</p>
          </div>

          {/* YouTube Video */}
          {post.youtube_link && (
            <div className="mb-6">
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(post.youtube_link)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {/* Post Image */}
          {post.picture && (
            <div className="mb-6">
              <img 
                src={`http://localhost:8080/uploads/${post.picture}`}
                alt="Post image"
                className="w-full rounded-lg bg-gray-200"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-2 ${liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 ${!isLoggedIn && 'cursor-not-allowed opacity-50'}`}
                title={!isLoggedIn ? "Please login to like posts" : ""}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{post.like}</span>
              </button>
              
              <button 
                className={`flex items-center space-x-2 text-gray-600 hover:text-blue-500 ${!isLoggedIn && 'cursor-not-allowed opacity-50'}`}
                title={!isLoggedIn ? "Please login to comment" : ""}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{comments.length}</span>
              </button>
              
              <button className="text-gray-600 hover:text-green-500">
                <Share className="w-5 h-5" />
              </button>
            </div>
            
            <button 
              onClick={handleBookmark}
              className={`${bookmarked ? 'text-yellow-500' : 'text-gray-600'} hover:text-yellow-500 ${!isLoggedIn && 'cursor-not-allowed opacity-50'}`}
              title={!isLoggedIn ? "Please login to bookmark posts" : ""}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Add Comment */}
          {isLoggedIn ? (
            <div className="py-4 border-b border-gray-200">
              <div className="flex space-x-3">
                <img 
                  src="/api/placeholder/32/32" 
                  alt="Your avatar" 
                  className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                </div>
                <button 
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 border-b border-gray-200 text-center">
              <p className="text-gray-600">
                Please <button onClick={() => navigate('/login')} className="text-blue-500 hover:underline">login</button> to comment on this post
              </p>
            </div>
          )}

          {/* Comments */}
          <div className="py-4">
            {comments.map((comment) => (
              <div key={comment.id} className="mb-6">
                <div className="flex space-x-3">
                  <img 
                    src={comment.user?.picture ? `http://localhost:8080/${comment.user.picture}` : '/api/placeholder/32/32'} 
                    alt={comment.user?.username || 'User'}
                    className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">{comment.user?.username || 'Anonymous'}</span>
                      <span className="text-gray-500 text-sm">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    {isLoggedIn && (
                      <button className="text-gray-500 text-sm hover:text-gray-700 flex items-center">
                        <span>Reply</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Post;