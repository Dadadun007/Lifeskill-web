import React, { useState, useEffect } from 'react';
import { Search, User, X, Check } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const PostRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState(undefined); // undefined = loading
  const [isApproving, setIsApproving] = useState(false); // สำหรับกัน double click
  const [currentUserId, setCurrentUserId] = useState(null);

  // โหลดโพสต์ pending ของ user อื่น (ที่ status = 'pending')
  useEffect(() => {
    fetch('http://localhost:8080/request_post', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  }, []);

  // โหลด user id ปัจจุบัน
  useEffect(() => {
    fetch('http://localhost:8080/user/me', { credentials: 'include' })
      .then(res => res.json())
      .then(user => setCurrentUserId(user.id || user.ID))
      .catch(() => setCurrentUserId(null));
  }, []);

  // เมื่อคลิกดูรายละเอียด ให้ดึงข้อมูลจาก backend (optional)
  const handleSelectRequest = (id) => {
    fetch(`http://localhost:8080/get_post_by_id/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSelectedRequest(data))
      .catch(() => setSelectedRequest(null));
  };

  // กด Approve
  const handleApprove = (id) => {
    if (isApproving) return; // กัน double click
    setIsApproving(true);
    fetch(`http://localhost:8080/approve_post/${id}`, {
      method: 'PUT',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setRequests(requests.filter(req => req.id !== id));
        setSelectedRequest(null);
        alert(data.message || 'Approved!');
      })
      .catch(() => {
        alert('Approve failed');
      })
      .finally(() => setIsApproving(false));
  };

  // Unapprove (ลบออกจาก list เฉยๆ)
  const handleUnapprove = (id) => {
    if (isApproving) return; // กัน double click
    setIsApproving(true);
    setRequests(requests.filter(req => req.id !== id));
    setSelectedRequest(null);
    setTimeout(() => setIsApproving(false), 500); // กันกดรัว
  };

  // Filter robust: render loading ถ้ายังไม่รู้ currentUserId, filter โพสต์ตัวเองออก
  if (currentUserId === null) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }
  const filteredRequests = Array.isArray(requests)
    ? requests.filter(req => {
        const postUserId = req.user?.id ?? req.user?.ID ?? req.user?.Id ?? req.user?.userid ?? null;
        return postUserId !== null && String(postUserId) !== String(currentUserId);
      })
    : [];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Post Requests</h1>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Requests for Approve ({Array.isArray(requests) ? requests.length : 0})
          </h2>
        </div>
        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center text-gray-500">No pending posts to approve.</div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => handleSelectRequest(request.id)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-700">{request.user?.username || 'Unknown'}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{request.title}</h3>
                    <p className="text-gray-600 mb-3 whitespace-pre-line">{request.content}</p>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm text-gray-500">Categories:</span>
                      {Array.isArray(request.categories) && request.categories.length > 0 ? (
                        request.categories.map((cat, i) => (
                          <span key={cat.id || i} className="px-3 py-1 rounded-full text-white text-sm bg-blue-400 mr-1">
                            {cat.categoriesName || cat.categories_name}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 rounded-full text-white text-sm bg-gray-400">No Category</span>
                      )}
                    </div>
                    <span className="text-blue-600 font-medium">see more details</span>
                  </div>
                  <div className="ml-4">
                    {request.picture && (
                      <img
                        src={request.picture.startsWith('http') ? request.picture : `http://localhost:8080/uploads/${request.picture}`}
                        alt="Post"
                        className="w-24 h-16 bg-gray-200 rounded-lg object-cover"
                        onError={e => {e.target.onerror=null; e.target.src='/default-profile.png';}}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Post requests</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">{selectedRequest.user?.username || 'Unknown'}</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{selectedRequest.title}</h4>
              <p className="text-gray-600 mb-4 whitespace-pre-line">{selectedRequest.content}</p>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-sm text-gray-500">Categories:</span>
                {Array.isArray(selectedRequest.categories) && selectedRequest.categories.length > 0 ? (
                  selectedRequest.categories.map((cat, i) => (
                    <span key={cat.id || i} className="px-3 py-1 rounded-full text-white text-sm bg-blue-400 mr-1">
                      {cat.categoriesName || cat.categories_name}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 rounded-full text-white text-sm bg-gray-400">No Category</span>
                )}
              </div>
              {/* Image */}
              {selectedRequest.picture && (
                <div className="mb-6">
                  <img
                    src={selectedRequest.picture.startsWith('http') ? selectedRequest.picture : `http://localhost:8080/uploads/${selectedRequest.picture}`}
                    alt="Post"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={e => {e.target.onerror=null; e.target.src='/default-profile.png';}}
                  />
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUnapprove(selectedRequest.id)}
                  className={`flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${isApproving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isApproving}
                >
                  <X className="w-4 h-4" />
                  <span>Unapprove</span>
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className={`flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${isApproving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <>
                      <Check className="w-4 h-4 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PostRequests;