import React, { useState } from 'react';

interface SignUpProps {
    onSwitchToSignIn: () => void;
    onSignUpSubmit: (data: { fullName: string; email: string; phone: string; }) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn, onSignUpSubmit }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (fullName.trim().length < 3) {
            setError('Full name must be at least 3 characters.');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!validatePhone(phone)) {
            setError('Please enter a valid phone number.');
            return;
        }
        
        const allUsers = JSON.parse(localStorage.getItem('pantane_users') || '{}');
        if(allUsers[email]) {
            setError('An account with this email already exists.');
            return;
        }

        onSignUpSubmit({ fullName: fullName.trim(), email, phone });
    };

    return (
        <div>
            <p className="text-center text-gray-400 mb-6">Create your account</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-400">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                        placeholder="e.g., Ada Lovelace"
                        required
                        autoComplete="name"
                    />
                </div>
                 <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-400">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                        placeholder="user@example.com"
                        required
                        autoComplete="email"
                    />
                </div>
                 <div className="mb-6">
                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-400">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                        placeholder="+1 234 567 8900"
                        required
                        autoComplete="tel"
                    />
                </div>
                
                {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}
                
                <button type="submit" className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                    Continue
                </button>
            </form>
            
            <p className="text-center text-sm text-gray-400 mt-6">
                Already have an account?
                <button type="button" onClick={onSwitchToSignIn} className="font-medium text-indigo-400 hover:underline ml-1">
                    Log In
                </button>
            </p>
        </div>
    );
};

export default SignUp;
