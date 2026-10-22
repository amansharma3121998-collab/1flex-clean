import React, { useState } from 'react';
import { Plus, X, User, Check, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types/media';

interface WhoIsWatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhoIsWatchingModal: React.FC<WhoIsWatchingModalProps> = ({ isOpen, onClose }) => {
  const { profiles, currentProfile, selectProfile, addProfile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [isKid, setIsKid] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      addProfile(newProfileName.trim(), isKid);
      setNewProfileName('');
      setIsKid(false);
      setIsAdding(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider">
            WHO'S WATCHING?
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Choose your profile to resume watching and access your personalized list.
          </p>
        </div>

        {isAdding ? (
          <form
            onSubmit={handleCreate}
            className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl space-y-4 text-left"
          >
            <h3 className="text-lg font-bold text-white">Add New Profile</h3>
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Profile Name
              </label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-black/70 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                autoFocus
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={isKid}
                onChange={(e) => setIsKid(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-zinc-800 border-zinc-700"
              />
              <span className="text-xs text-zinc-300">
                Kids Profile (Shows age-appropriate movies & cartoons)
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow"
              >
                Create Profile
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {profiles.map((p) => {
              const isSelected = currentProfile?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    selectProfile(p);
                    onClose();
                  }}
                  className="group flex flex-col items-center cursor-pointer space-y-3"
                >
                  <div
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-800 border-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(229,9,20,0.5)] ${
                      isSelected ? 'border-red-600 ring-4 ring-red-600/30' : 'border-zinc-700 group-hover:border-white'
                    }`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-semibold text-zinc-300 group-hover:text-white transition-colors">
                      {p.name}
                    </p>
                    {p.isKid && (
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                        Kids
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Profile Tile */}
            {profiles.length < 5 && (
              <div
                onClick={() => setIsAdding(true)}
                className="group flex flex-col items-center cursor-pointer space-y-3"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-zinc-700 group-hover:border-white group-hover:bg-zinc-900/60 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                  <Plus className="w-10 h-10 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-zinc-400 group-hover:text-white transition-colors">
                  Add Profile
                </p>
              </div>
            )}
          </div>
        )}

        <div className="pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white uppercase tracking-widest font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
