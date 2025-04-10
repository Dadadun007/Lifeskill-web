import { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email.trim() === '' || password.trim() === '') {
      setIsError(true);
    } else {
      setIsError(false);
      console.log('Email:', email);
      console.log('Password:', password);
      // TODO: connect to backend API
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#373737]">
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
            Please fill in both fields.
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
