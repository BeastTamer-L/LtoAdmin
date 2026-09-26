import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import {CircleUserRound, Lock, Eye, EyeOff, CircleAlert} from "lucide-react";
import Logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext';


export default function Login() {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [loginError, setLoginError] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const navigate = useNavigate();
   const { login } = useAuth();

   const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError(false);
        setIsSubmitting(true);

        try {
            await login(username.trim(), password);
            navigate("/dashboard");
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

   return (
       <div className="w-full h-screen flex justify-center items-center bg-[#0F2744]">
           <div className="w-full max-w-[400px] bg-white p-8 rounded-lg shadow-md">
               <div className="flex justify-center mb-4">
                   <img src={Logo} alt="Logo" className="w-[100px] h-[100px]" />
               </div>
               <h2 className="text-2xl font-extrabold mb-8 text-center">Traffi<span className="text-[#ED6704]">Cam</span></h2>
               <form onSubmit={handleLogin}>
                   <div className="mb-4 relative">
                       <CircleUserRound
                           className="text-[#7E8998] absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5"
                       />
                       <input
                           className="w-full h-[55px] bg-[#F0F4F8] border border-[#E2E8F0] rounded-[10px] pl-[56px] pr-5 text-[#718096] placeholder-[#718096] focus:outline-none focus:ring-0"
                           id="email"
                           type="email"
                           placeholder="Email"
                           value={username}
                           onChange={(e) => {
                           setUsername(e.target.value);
                           setLoginError(false);
                           }}
                       />
                   </div>
                   <div className="relative">
                       <Lock
                           className="text-[#7E8998] absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5"
                       />
                       <input
                           className="w-full h-[55px] bg-[#F0F4F8] border border-[#E2E8F0] rounded-[10px] pl-[56px] pr-14 text-[#718096] placeholder-[#718096] focus:outline-none focus:ring-0"
                           id="password"
                           type={showPassword ? 'text' : 'password'}
                           placeholder="Password"
                           value={password}
                           onChange={(e) => {
                           setPassword(e.target.value);
                           setLoginError(false);
                           }}
                       />
                       <button type="button"
                       className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5"
                       onClick={() => setShowPassword(!showPassword)}
                       >
                        {showPassword ? <EyeOff className="text-[#7E8998] w-5 h-5" /> : <Eye className="text-[#7E8998] w-5 h-5" />}
                       </button>
                   </div>
                    { loginError && (
                       <div className='flex gap-2 items-center mt-2'>
                           <CircleAlert className='text-[#CC2B2B] w-3 h-3' />
                           <span className="block text-[#CC2B2B] text-xs">
                               Incorrect username or password.
                           </span>
                       </div>
                       )}
                   <div className="w-full block mb-[70px] text-sm text-[#0F2744] cursor-pointer hover:underline mt-4 block">
                       <p className='text-end'>Forgot Password?</p>
                   </div>
                   <div className="flex items-center justify-between">
                       <button
                           className="w-full bg-[#0F2744] hover:bg-[#0F2744]/80 text-white font-bold py-4 px-4 rounded-2xl   focus:outline-none focus:shadow-outline transition duration-300 ease-in-out active:scale-[0.98]"
                           type="submit"
                           disabled={isSubmitting}
                       >
                           {isSubmitting ? 'Signing In...' : 'Sign In'}
                       </button>
                   </div>
               </form>
           </div>

       </div>
   );
}