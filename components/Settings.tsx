import React from 'react';

interface SettingsProps {
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


const Settings: React.FC<SettingsProps> = ({ isVoiceOutputEnabled, onToggleVoiceOutput }) => {
  return (
    <div className="p-4 md:p-8 h-full flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
          <p className="text-gray-400">Customize your Pantane AI Hub experience.</p>
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