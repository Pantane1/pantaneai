import React from 'react';
import { User } from '../types';
import { UserIcon } from './icons';

interface SettingsProps {
  user: User;
  isVoiceOutputEnabled: boolean;
  onToggleVoiceOutput: () => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
    <label htmlFor="toggle" className="flex items-center cursor-pointer">
        <div className="relative">
            <input id="toggle" type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="ml-3 text-gray-300 font-medium">{label}</div>
    </label>
);

const InfoField: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <p className="text-gray-200">{value}</p>
    </div>
);


const Settings: React.FC<SettingsProps> = ({ user, isVoiceOutputEnabled, onToggleVoiceOutput }) => {
  return (
    <div className="p-4 md:p-8 h-full flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
          <p className="text-gray-400">Manage your account and preferences.</p>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700/50 mb-6">
            <h3 className="text-xl font-semibold text-white mb-6">Account Information</h3>
            <div className="flex items-start space-x-6">
                 <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.fullName} className="w-full h-full rounded-full object-cover"/>
                    ) : (
                        <UserIcon className="w-10 h-10 text-gray-400"/>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full">
                    <InfoField label="Full Name" value={user.fullName} />
                    <InfoField label="Email Address" value={user.email} />
                    <InfoField label="Phone Number" value={user.phone} />
                </div>
            </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Voice Options</h3>
            <div className="flex items-center justify-between">
                <p className="text-gray-400">Automatically play voice responses for chat messages.</p>
                <ToggleSwitch
                    checked={isVoiceOutputEnabled}
                    onChange={onToggleVoiceOutput}
                    label={isVoiceOutputEnabled ? 'Enabled' : 'Disabled'}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
