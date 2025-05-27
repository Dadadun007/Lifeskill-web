import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { ChevronDown, Bookmark, Heart, MessageCircle } from 'lucide-react';

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ดึง user
    fetch('http://localhost:8080/user/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null); // ถ้าไม่ได้ login
      });

    // ดึงโพสต์ทั้งหมด
    fetch('http://localhost:8080/get_all_post', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setPosts([]); // ป้องกัน posts เป็น null
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#EDEDED] text-white font-sans w-full overflow-x-hidden">
      <Header />

      <main className="flex-1 px-4 py-8 w-full max-w-[1400px] mx-auto">
     
      <header className=" py-3 flex flex-col items-center gap-4 border-b border-gray-200">
        <img
          src="lifeskill2.png"
          alt="LifeSkill Logo"
          className="w-[500px] h-[70px] object-contain"
        />
        <p className="max-w-2xl text-center text-black px-4 text-sm md:text-base">
          LifeSkill พื้นที่แบ่งปันและแลกเปลี่ยน ทักษะการใช้ชีวิตขั้นพื้นฐาน สำหรับบุคคลทั่วไป ผ่านรูปแบบกระทู้ เพื่อให้ทุกคนเรียนรู้จากประสบการณ์จริง และช่วยกันเติมเต็มสิ่งที่ไม่มีใครเคยสอน
        </p>
      </header>
        {/* เพิ่มปุ่มสร้างโพสต์ถ้า login แล้ว */}

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
          {Array.isArray(posts) && posts.map((post) => (
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

export default Home;
