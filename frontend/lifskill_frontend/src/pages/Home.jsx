import { Link } from 'react-router-dom'

function Home() {
  const posts = [
    {
      id: 'post1',
      username: 'Username',
      topic: 'Topic',
      detail: 'detail',
      image: 'test.png',
      link: '/posts/1',
    },
    {
      id: 'post2',
      username: 'Username',
      topic: 'Topic',
      detail: 'detail',
      image: 'test.png',
      link: '/posts/2',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#2f2f2f] text-white font-sans w-full overflow-x-hidden">
      {/* Navbar */}
      <nav className="w-full bg-[#1b4c3f] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center">
          <img src="LifeSkill.png" alt="LifeSkill Icon" className="w-[140px] h-[50px]" />
        </div>

        {/* Search Bar */}
        <div className="flex items-center w-full md:max-w-[600px] px-3 py-1">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 text-sm text-black rounded-full px-2 py-2 bg-white "
          />
          <button className="flex items-center justify-center ml-2 bg-[#5A7FB3] h-[40px] w-[60px] rounded-full">
            <img src="Search.png" alt="Search Icon" className="w-[20px] h-[20px] object-contain" />
          </button>
        </div>

        {/* Login Button */}
        <Link to="/login">
          <button className="bg-[#1b8df2] text-white px-4 py-1.5 rounded-lg text-sm whitespace-nowrap">
            Login / Sign up
          </button>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 w-full max-w-[1400px] mx-auto">

        {/* Recommend */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-5 text-left">Recommend</h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-4 px-1">
              {posts.map((post) => (
                <Link key={post.id} to={post.link}>
                  <img
                    src={post.image}
                    alt={`img${post.id}`}
                    className="w-[250px] h-[140px] rounded-xl object-cover flex-shrink-0"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Filter */}
        <div className="flex justify-between flex-wrap items-center gap-4 text-sm mb-6 px-1">
          <span className="cursor-pointer">Most like ▼</span>
          <span className="cursor-pointer">Categories ▼</span>
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link key={post.id} to={post.link} className="block">
              <div className="bg-[#444] p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
                <div className="flex flex-col gap-1 text-sm flex-1 text-left">
                  <div>👤 {post.username}</div>
                  <div>{post.topic}</div>
                  <div>{post.detail}</div>
                  <div className="flex gap-3 text-xs pt-1">
                    <span>👁️ 12</span>
                    <span>💬 5</span>
                    <span>❤️ 35</span>
                  </div>
                </div>
                <img
                  src={post.image}
                  alt="post"
                  className="w-full md:w-[240px] h-[120px] object-cover rounded-lg"
                />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home
