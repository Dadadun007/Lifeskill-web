import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, MessageCircle, Share } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { getApiUrl, getImageUrl } from '../config';

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to get correct user picture URL
const getUserPictureUrl = (picture) => {
  if (!picture) return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  if (picture.startsWith('http')) return picture;
  return getImageUrl(picture);
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
  const [currentUser, setCurrentUser] = useState(null);
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(getApiUrl('/user/me'), {
          credentials: 'include',
        });
        if (res.ok) {
          const userData = await res.json();
          setIsLoggedIn(true);
          setCurrentUser(userData);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setError(null);
        const response = await fetch(getApiUrl(`/post/${id}`), {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        console.log('Post data:', data);
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
      const response = await fetch(getApiUrl(`/like_post/${id}`), {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to like post');
      const data = await response.json();
      setLiked(!liked);
      setPost(prev => ({ ...prev, like: data.like })); // Update to use 'like' instead of 'likes'
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
      const response = await fetch(getApiUrl(`/achieve_post/${id}`), {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to achieve post');
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error('Error achieving post:', error);
    }
  };

  // Helper function to add comment to the nested structure
  const addCommentToStructure = (comments, newComment, parentId = null) => {
    if (!parentId) {
      // Top-level comment
      return [newComment, ...comments];
    }
    
    // Reply to a comment - find parent and add to its replies
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newComment]
        };
      }
      // Check nested replies recursively
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addCommentToStructure(comment.replies, newComment, parentId)
        };
      }
      return comment;
    });
  };

  const handleAddComment = async (parentId = null) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const content = parentId ? replyText : newComment;
    if (!content.trim()) return;

    try {
      const response = await fetch(getApiUrl(`/post/${id}/comment`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(parentId ? { content, parent_id: parentId } : { content }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const comment = await response.json();
      
      // Use the nested comments structure to properly place the new comment
      const nestedComments = groupComments(comments);
      const updatedNestedComments = addCommentToStructure(nestedComments, comment, parentId);
      
      // Convert back to flat structure for storage
      const flattenComments = (comments) => {
        let flat = [];
        comments.forEach(comment => {
          flat.push(comment);
          if (comment.replies && comment.replies.length > 0) {
            flat.push(...flattenComments(comment.replies));
          }
        });
        return flat;
      };
      
      setComments(flattenComments(updatedNestedComments));
      
      if (parentId) {
        setReplyText('');
        setReplyToCommentId(null);
      } else {
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const groupComments = (comments) => {
    // Sort comments by created_at ascending (oldest first)
    const sorted = [...comments].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const map = {};
    sorted.forEach(comment => {
      map[comment.id] = { ...comment, replies: [] };
    });
    const roots = [];
    sorted.forEach(comment => {
      // parent_id can be null or undefined for top-level
      if (comment.parent_id !== null && comment.parent_id !== undefined) {
        if (map[comment.parent_id]) {
          map[comment.parent_id].replies.push(map[comment.id]);
        }
      } else {
        roots.push(map[comment.id]);
      }
    });
    return roots;
  };
  
  const nestedComments = groupComments(comments);

  // Updated renderComments to show 'Replying to ...' and improve reply layout
  const renderComments = (comments, level = 0, parentUsername = null) => (
    comments.map(comment => (
      <div key={comment.id} className={`mb-6 ${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <img
              src={getUserPictureUrl(comment.user?.picture)}
              alt={comment.user?.username || 'User'}
              className={`${level > 0 ? 'w-7 h-7' : 'w-9 h-9'} rounded-full bg-gray-300 ring-2 ring-white shadow-sm`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`rounded-2xl px-4 py-3 ${level > 0 ? 'bg-blue-50 border border-blue-100 relative' : 'bg-gray-50'}`}
                 style={level > 0 ? { boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)' } : {}}>
              {level > 0 && parentUsername && (
                <div className="text-xs text-blue-500 font-semibold mb-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Replying to <span className="ml-1 font-bold">{parentUsername}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 mb-1">
                <span className={`font-semibold ${level > 0 ? 'text-sm text-gray-800' : 'text-gray-900'}`}>{comment.user?.username || 'Anonymous'}</span>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p className={`text-gray-700 leading-relaxed ${level > 0 ? 'text-sm' : ''}`}>{comment.content}</p>
            </div>
            <div className="flex items-center mt-2 space-x-4">
              {isLoggedIn && (
                <button
                  className="text-gray-500 text-xs font-medium hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1"
                  onClick={() => setReplyToCommentId(comment.id)}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Reply</span>
                </button>
              )}
              {comment.replies && comment.replies.length > 0 && (
                <span className="text-gray-400 text-xs">
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>
            {replyToCommentId === comment.id && (
              <div className="mt-4 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-start space-x-3">
                  <img
                    src={getUserPictureUrl(currentUser?.picture)}
                    alt="Your avatar"
                    className="w-7 h-7 rounded-full bg-gray-300 flex-shrink-0 ring-2 ring-white shadow-sm"
                  />
                  <div className="flex-1">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.user?.username || 'Anonymous'}...`}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment(comment.id))}
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">Press Enter to reply, Shift + Enter for new line</span>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                          onClick={() => { setReplyToCommentId(null); setReplyText(''); }}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          onClick={() => handleAddComment(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Render replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 to-transparent ml-3"></div>
                <div className="pl-6">
                  {renderComments(comment.replies, level + 1, comment.user?.username)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ))
  );

  // Share handler
  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: post?.title || 'Check out this post!',
      text: post?.content || '',
      url: shareUrl,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }, () => {
        alert('Failed to copy link.');
      });
    } else {
      // fallback for very old browsers
      window.prompt('Copy this link:', shareUrl);
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
              src={getUserPictureUrl(post.user?.picture)} 
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
            <button className="text-gray-400 hover:text-gray-600" onClick={handleShare} title="Share this post">
              <Share className="w-5 h-5" />
            </button>
          </div>

          {/* Post Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
          
          {/* Post Content */}
          <div className="mb-6">
            <p className="text-gray-700 mb-2">{post.content}</p>
          </div>

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

          {/* YouTube Video */}
          {post.youtube_link && (
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Video : </h2>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-2 ${liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 ${!isLoggedIn && 'cursor-not-allowed opacity-50'}`}
                title={!isLoggedIn ? "Please login to like posts" : ""}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{post.like || 0}</span>
              </button>
              
              <button 
                className={`flex items-center space-x-2 text-gray-600 hover:text-blue-500 ${!isLoggedIn && 'cursor-not-allowed opacity-50'}`}
                title={!isLoggedIn ? "Please login to comment" : ""}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments?.length || 0}</span>
              </button>
              
              <button className="text-gray-600 hover:text-green-500" onClick={handleShare} title="Share this post">
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
            <div className="py-6 border-b border-gray-200">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex space-x-3">
                  <img 
                    src={getUserPictureUrl(currentUser?.picture)} 
                    alt="Your avatar" 
                    className="w-9 h-9 rounded-full bg-gray-300 flex-shrink-0 ring-2 ring-white shadow-sm"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent resize-none"
                      rows="3"
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">
                        Press Enter to post, Shift + Enter for new line
                      </span>
                      <button 
                        onClick={() => handleAddComment()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                        disabled={!newComment.trim()}
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 border-b border-gray-200">
              <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="mb-3">
                  <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-3">Join the conversation!</p>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-blue-500 hover:text-blue-600 font-medium hover:underline transition-colors duration-200"
                >
                  Sign in to comment
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="py-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Comments ({comments.length})
              </h3>
              <p className="text-sm text-gray-500">
                Share your thoughts and engage with the community
              </p>
            </div>
            
            {nestedComments.length > 0 ? (
              <div className="space-y-1">
                {renderComments(nestedComments)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
                <p className="text-gray-500">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Post;