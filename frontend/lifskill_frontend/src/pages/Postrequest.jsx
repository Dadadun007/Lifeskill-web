import React, { useState, useEffect } from 'react';
import { Search, User, X, Check } from 'lucide-react';
import Header from './Header';


const PostRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState(undefined); // undefined = loading
  const [isApproving, setIsApproving] = useState(false); // สำหรับกัน double click
  const [currentUserId, setCurrentUserId] = useState(null);

  // โหลดโพสต์ pending ของ user อื่น (ที่ status = 'pending')
  useEffect(() => {
    fetch('http://localhost:8080/request_post', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // Filter out posts created by the current user
        const filteredData = Array.isArray(data) ? data.filter(post => post.user?.id !== currentUserId) : [];
        setRequests(filteredData);
      })
      .catch(() => setRequests([]));
  }, [currentUserId]);

  // โหลด user id ปัจจุบัน
  useEffect(() => {
    fetch('http://localhost:8080/user/me', { credentials: 'include' })
      .then(res => res.json())
      .then(user => setCurrentUserId(user.id || user.ID))
      .catch(() => setCurrentUserId(null));
  }, []);

  // Debug log
  useEffect(() => {
    console.log('currentUserId:', currentUserId);
    console.log('requests:', requests);
    if (Array.isArray(requests)) {
      requests.forEach((req, i) => {
        console.log(`Request[${i}] user:`, req.user, 'user.id:', req.user?.id, 'user.ID:', req.user?.ID, 'user.Id:', req.user?.Id, 'user.userid:', req.user?.userid);
      });
    }
  }, [currentUserId, requests]);

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
        console.log('Approve response:', data);
        // อัปเดตจำนวน approve และ status ในโพสต์นั้นทันที
        setRequests(prev =>
          prev.map(req =>
            req.id === id
              ? { ...req, current_approvals: data.current_approvals, status: data.status }
              : req
          ).filter(req => req.status === 'pending') // Remove approved posts
        );
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

  // Helper: นับจำนวน approve ของแต่ละโพสต์ (ถ้ามี field current_approvals ใน request)
  const getApprovalCount = (request) => {
    // ถ้า backend ส่ง current_approvals หรือ approvalsCount หรือ approvals เป็น array
    if (typeof request.current_approvals === 'number') return request.current_approvals;
    if (typeof request.approvalsCount === 'number') return request.approvalsCount;
    if (Array.isArray(request.approvals)) return request.approvals.length;
    return 0;
  };

  // Filter: render loading ถ้ายังไม่รู้ currentUserId, แสดงโพสต์ทั้งหมด (ไม่ filter user id)
  if (currentUserId === null) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  const filteredRequests = Array.isArray(requests)
    ? requests.filter(req => req.status === 'pending') // Only show pending posts
    : [];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Post Requests</h1>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Requests for Approve ({filteredRequests.length})
          </h2>
        </div>
        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center text-gray-500">No pending posts to approve.</div>
          ) : (
            filteredRequests.map((request, idx) => (
              <div
                key={request.id || idx}
                onClick={() => handleSelectRequest(request.id)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={
                            request.user && request.user.picture
                              ? (
                                  request.user.picture.startsWith('http')
                                    ? request.user.picture
                                    : request.user.picture.includes('uploads/profile_pictures/')
                                      ? "http://localhost:8080/" + request.user.picture.replace(/^\.?\/?/, '')
                                      : "http://localhost:8080/uploads/profile_pictures/" + encodeURIComponent(request.user.picture)
                                )
                              : "/default-avatar.png"
                          }
                          alt="Profile"
                          className="w-6 h-6 rounded-full object-cover"
                          onError={e => {e.target.onerror=null; e.target.src='/default-avatar.png';}}
                        />
                      </div>
                      <span className="font-medium text-gray-700">{request.user?.username || 'Unknown'}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{request.title}</h3>
                    <p className="text-gray-600 mb-3 whitespace-pre-line">
                      {request.content.length > 250
                        ? request.content.slice(0, 250) + '...'
                        : request.content}
                    </p>
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
                    {/* UX: Approve button with count */}
                    <div className="mb-2">
                      {(() => {
                        const count = getApprovalCount(request);
                        const isApproved = request.status === 'approved' || count >= 3;
                        return (
                          <button
                            onClick={e => { e.stopPropagation(); handleApprove(request.id); }}
                            disabled={isApproved || isApproving}
                            className={`px-4 py-1 rounded-full font-semibold text-sm transition-all shadow-sm 
                              ${isApproved ? 'bg-green-400 text-white cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-600 text-white'}
                              ${isApproving ? 'opacity-50' : ''}`}
                          >
                            {isApproved ? `Approved` : `Click for  Approve count : ${count}/3`}
                          </button>
                        );
                      })()}
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      selectedRequest.user && selectedRequest.user.picture
                        ? (
                            selectedRequest.user.picture.startsWith('http')
                              ? selectedRequest.user.picture
                              : selectedRequest.user.picture.includes('uploads/profile_pictures/')
                                ? "http://localhost:8080/" + selectedRequest.user.picture.replace(/^\.?\/?/, '')
                                : "http://localhost:8080/uploads/profile_pictures/" + encodeURIComponent(selectedRequest.user.picture)
                          )
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={e => {e.target.onerror=null; e.target.src='/default-avatar.png';}}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedRequest.user?.username || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500">Posted {new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Title and Content */}
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">{selectedRequest.title}</h4>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedRequest.content}</p>
                </div>
              </div>

              {/* Categories and Approval Status */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-sm font-medium text-gray-700">Categories:</span>
                {Array.isArray(selectedRequest.categories) && selectedRequest.categories.length > 0 ? (
                  selectedRequest.categories.map((cat, i) => (
                    <span key={cat.id || i} className="px-3 py-1 rounded-full text-white text-sm bg-blue-500">
                      {cat.categoriesName || cat.categories_name}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 rounded-full text-white text-sm bg-gray-400">No Category</span>
                )}
                
                {/* Approval Status Badge */}
                <div className="ml-auto">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    getApprovalCount(selectedRequest) >= 3 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getApprovalCount(selectedRequest) >= 3 
                      ? '✓ Fully Approved' 
                      : `${getApprovalCount(selectedRequest)}/3 Approvals`}
                  </span>
                </div>
              </div>

              {/* Image Section */}
              {selectedRequest.picture && (
                <div className="mb-6">
                  <img
                    src={selectedRequest.picture.startsWith('http') 
                      ? selectedRequest.picture 
                      : `http://localhost:8080/uploads/${selectedRequest.picture}`}
                    alt="Post"
                    className="w-full h-64 object-cover rounded-xl shadow-sm"
                    onError={e => {e.target.onerror=null; e.target.src='/default-profile.png';}}
                  />
                </div>
              )}

              {/* YouTube Link if exists */}
              {selectedRequest.youtube_link && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Related Video:</h5>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={selectedRequest.youtube_link.replace('watch?v=', 'embed/')}
                      className="w-full h-64 rounded-xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Age Range if exists */}
              {selectedRequest.recommend_age_range && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Age Range:</h5>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {selectedRequest.recommend_age_range}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => handleUnapprove(selectedRequest.id)}
                  className={`flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors ${
                    isApproving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isApproving}
                >
                  <X className="w-5 h-5" />
                  <span>Unapprove</span>
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className={`flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors ${
                    isApproving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isApproving || getApprovalCount(selectedRequest) >= 3}
                >
                  {isApproving ? (
                    <>
                      <Check className="w-5 h-5 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Approve ({getApprovalCount(selectedRequest)}/3)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostRequests;