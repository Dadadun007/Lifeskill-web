import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    if (email.trim() === '' || password.trim() === '') {
      setIsError(true);
      setErrorMessage('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/login'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (response.ok) {
        // Get user data after successful login
        const userResponse = await fetch(getApiUrl('/user/me'), {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('user', JSON.stringify(userData));
          navigate('/mypage');
        }
      } else {
        setIsError(true);
        setErrorMessage('Invalid email or password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsError(true);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center ">
              <img src="logo.png" alt="login image" className="w-[100px] h-[100px] " />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Login</h1>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 font-medium">
                <Mail className="w-5 h-5 mr-2" />
                <span>Email</span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-700 font-medium">
                <Lock className="w-5 h-5 mr-2" />
                <span>Password</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {isError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-shake">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Don't have account?{' '}
                <a 
                  href="/register" 
                  className="text-blue-500 hover:text-blue-600 font-medium transition-colors hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>

            {/* Back to Main Menu */}
            <div className="text-center">
              <a 
                href="/" 
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors hover:underline"
              >
                Back to the Main Menu
              </a>
            </div>
          </div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-white/20 rounded-full blur-sm"></div>
        <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-white/15 rounded-full blur-sm"></div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Login;