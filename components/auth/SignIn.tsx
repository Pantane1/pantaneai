import React, { useState } from 'react';
import { UserIcon, LockIcon, GoogleIcon } from '../icons';
import { User } from '../../types';

interface SignInProps {
    onLogin: (user: User) => void;
    onSwitchToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onLogin, onSwitchToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const allUsers = JSON.parse(localStorage.getItem('pantane_users') || '{}');
        const user = allUsers[email];

        if (!user || user.password !== password) {
            setError('Invalid email or password.');
            return;
        }

        onLogin(user);
    };

    const handleGoogleLogin = () => {
        const googleUser: User = {
            email: 'google.user@example.com',
            fullName: 'Google User',
            phone: '123-456-7890',
            profilePicture: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent('Google User')}`,
        };
        const allUsers = JSON.parse(localStorage.getItem('pantane_users') || '{}');
        
        if (!allUsers[googleUser.email]) {
            allUsers[googleUser.email] = googleUser;
            localStorage.setItem('pantane_users', JSON.stringify(allUsers));
        }

        onLogin(allUsers[googleUser.email]);
    };

    return (
        <div>
            <p className="text-center text-gray-400 mb-6">Sign in to continue</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-400">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                            placeholder="user@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-400">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LockIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                </div>
                
                {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}
                
                <button type="submit" className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    Enter Hub
                </button>
            </form>
            
            <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                <GoogleIcon className="w-5 h-5 mr-3" />
                Sign in with Google
            </button>
            
            <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?
                <button type="button" onClick={onSwitchToSignUp} className="font-medium text-indigo-400 hover:underline ml-1">
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default SignIn;
