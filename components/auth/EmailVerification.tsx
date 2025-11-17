import React, { useState, useEffect, useRef } from 'react';
import { LockIcon } from '../icons';
import { User } from '../../types';

interface EmailVerificationProps {
    onLogin: (user: User) => void;
    signUpData: {
        fullName: string;
        email: string;
        phone: string;
    }
}

const OTP_LENGTH = 6;

const EmailVerification: React.FC<EmailVerificationProps> = ({ onLogin, signUpData }) => {
    const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [simulatedOtp, setSimulatedOtp] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Simulate sending OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedOtp(generatedOtp);
        console.log(`OTP for ${signUpData.email}: ${generatedOtp}`); // For dev purposes
    }, [signUpData.email]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to next input
            if (value !== '' && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.join('') !== simulatedOtp) {
            setError('Invalid or expired verification code.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        const newUser: User = {
            ...signUpData,
            password: password,
            profilePicture: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(signUpData.fullName)}`,
        };

        const allUsers = JSON.parse(localStorage.getItem('pantane_users') || '{}');
        allUsers[newUser.email] = newUser;
        localStorage.setItem('pantane_users', JSON.stringify(allUsers));

        onLogin(newUser);
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-white font-semibold text-lg">Verify your email</h2>
                <p className="text-gray-400 text-sm">We've sent a 6-digit code to {signUpData.email}. The code is <span className="font-bold text-indigo-400">{simulatedOtp}</span> (for demo purposes).</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-400">Verification Code</label>
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-10 h-12 text-center text-lg font-semibold bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                                required
                            />
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-400">Create Password</label>
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
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-400">Confirm Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LockIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}

                <button type="submit" className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    Create Account
                </button>
            </form>
        </div>
    );
};

export default EmailVerification;
