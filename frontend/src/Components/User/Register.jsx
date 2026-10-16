import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api';

const schema = yup.object({
  name: yup.string().max(30).required("Name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "At least 6 characters").required("Password is required"),
  confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success(data.message || "Registration successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-900 selection:bg-blue-500 selection:text-white">
      
      {/* Main Container Card */}
      <main className="w-full max-w-6xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden min-h-[680px] flex flex-col lg:flex-row">
        
        {/* Left Side: Form Section */}
        <section className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          
          {/* Top Header with Back Arrow */}
          <header className="flex items-center">
            <Link 
              to="/landing" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium text-sm sm:text-base group transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-slate-600 group-hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-medium">Back to home</span>
            </Link>
          </header>

          {/* Form Content Area */}
          <div className="my-auto py-6 max-w-md w-full mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Create account</h1>
              <p className="text-slate-500 text-sm sm:text-base font-normal">We’ll email you a verification link.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Name Input */}
              <div className="relative">
                <input 
                  type="text" 
                  id="name" 
                  {...register("name")}
                  placeholder=" "
                  className="peer w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm sm:text-base bg-transparent"
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-3.5 top-3 text-slate-500 text-sm sm:text-base transition-all pointer-events-none origin-[0] peer-focus:-translate-y-[1.3rem] peer-focus:scale-85 peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-translate-y-[1.3rem] peer-[:not(:placeholder-shown)]:scale-85 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5"
                >
                  Name
                </label>
                {errors.name && (
                  <p className="text-rose-600 text-xs font-medium mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email Input */}
              <div className="relative">
                <input 
                  type="email" 
                  id="email" 
                  {...register("email")}
                  placeholder=" "
                  className="peer w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm sm:text-base bg-transparent"
                />
                <label 
                  htmlFor="email" 
                  className="absolute left-3.5 top-3 text-slate-500 text-sm sm:text-base transition-all pointer-events-none origin-[0] peer-focus:-translate-y-[1.3rem] peer-focus:scale-85 peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-translate-y-[1.3rem] peer-[:not(:placeholder-shown)]:scale-85 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5"
                >
                  Email
                </label>
                {errors.email && (
                  <p className="text-rose-600 text-xs font-medium mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  {...register("password")}
                  placeholder="Password" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm sm:text-base pr-12 placeholder:text-slate-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="text-rose-600 text-xs font-medium mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirm" 
                  {...register("confirm")}
                  placeholder="Confirm Password" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-sm sm:text-base pr-12 placeholder:text-slate-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
                {errors.confirm && (
                  <p className="text-rose-600 text-xs font-medium mt-1">{errors.confirm.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm sm:text-base mt-4 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Register</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login Link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer Copyright */}
          <footer className="text-xs text-slate-400 text-center lg:text-left">
            &copy; {new Date().getFullYear()} ToyHaven, Inc. All rights reserved.
          </footer>
        </section>

        {/* Right Side: Abstract Blue Fluid Artwork Panel */}
        <section className="w-full lg:w-1/2 p-4 sm:p-6 bg-slate-100 flex items-center justify-center min-h-[320px] lg:min-h-full">
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner group">
            <img 
              src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop" 
              alt="Blue Fluid Abstract Art" 
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </section>

      </main>
    </div>
  );
}