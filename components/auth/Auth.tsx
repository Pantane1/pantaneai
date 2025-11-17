import React, { useState } from 'react';
import { PantaneLogo } from '../icons';
import SignIn from './SignIn';
import SignUp from './SignUp';
import EmailVerification from './EmailVerification';
import { User } from '../../types';

interface AuthProps {
    onLogin: (user: User) => void;
}

type AuthMode = 'signin' | 'signup' | 'verify';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [authMode, setAuthMode] = useState<AuthMode>('signin');
    const [signUpData, setSignUpData] = useState<Partial<User>>({});

    const handleSwitchToSignUp = () => setAuthMode('signup');
    const handleSwitchToSignIn = () => setAuthMode('signin');

    const handleSignUpSubmit = (data: { fullName: string; email: string; phone: string; }) => {
        setSignUpData(data);
        setAuthMode('verify');
    };

    const renderContent = () => {
        switch (authMode) {
            case 'signup':
                return <SignUp onSwitchToSignIn={handleSwitchToSignIn} onSignUpSubmit={handleSignUpSubmit} />;
            case 'verify':
                return <EmailVerification onLogin={onLogin} signUpData={signUpData as { fullName: string; email: string; phone: string; }} />;
            case 'signin':
            default:
                return <SignIn onLogin={onLogin} onSwitchToSignUp={handleSwitchToSignUp} />;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <PantaneLogo className="w-20 h-20 mb-4" />
                    <h1 className="text-3xl font-bold text-white tracking-wider">Pantane AI</h1>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl shadow-indigo-500/10">
                    {renderContent()}
                </div>

                 <footer className="text-center p-4 mt-8 text-xs text-gray-500">
                    Created by Pantane — Innovator & Builder.
                </footer>
            </div>
        </div>
    );
};

export default Auth;
