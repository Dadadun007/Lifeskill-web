import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.trim() === '' || password.trim() === '') {
      setIsError(true);
      return;
    }

    setIsError(false);

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        credentials: 'include', // 👈 important to receive cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (response.ok) {
        alert('You logined this website!');
        navigate('/mypage'); // redirect to your page after login
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsError(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#43A895]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-3 bg-white shadow-xl rounded-2xl p-6 w-screen max-w-xl"
      >
        <div className="flex justify-center items-center gap-x-2 mb-4">
          <img src="logo.png" alt="login image" className="w-[50px] h-[50px]" />
          <h1 className="text-3xl font-bold text-gray-800">Login</h1>
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="font-medium text-lg text-gray-700">
            Email
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-full border px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your email"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="font-medium text-lg text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-full border px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your password"
          />
        </div>

        {isError && (
          <div className="text-red-600 font-medium text-sm text-center">
            Login failed. Please check your credentials.
          </div>
        )}

        <div className="flex justify-center mt-2">
          <button
            type="submit"
            className="bg-[#82B6FF] text-white rounded-full py-2 font-semibold hover:bg-[#5880B0] transition duration-200 w-[100px]"
          >
            Login
          </button>
        </div>

        <div className="flex justify-center mt-4">
          <p className="text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
