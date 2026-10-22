import React from 'react';
import { Globe } from 'lucide-react';
import { MoviesBoxLogo } from './MoviesBoxLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-zinc-950 text-zinc-500 py-12 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 mt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2.5">
          <MoviesBoxLogo className="w-6 h-6" />
          <span className="font-bebas text-xl tracking-wider text-white">
            <span className="text-red-600">MOVIES</span>BOX
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Questions? Browse movies and TV series in high definition with seamless playback.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-2">
            <p className="hover:text-zinc-300 cursor-pointer">FAQ</p>
            <p className="hover:text-zinc-300 cursor-pointer">Investor Relations</p>
            <p className="hover:text-zinc-300 cursor-pointer">Ways to Watch</p>
            <p className="hover:text-zinc-300 cursor-pointer">Corporate Information</p>
          </div>
          <div className="space-y-2">
            <p className="hover:text-zinc-300 cursor-pointer">Help Center</p>
            <p className="hover:text-zinc-300 cursor-pointer">Jobs</p>
            <p className="hover:text-zinc-300 cursor-pointer">Terms of Use</p>
            <p className="hover:text-zinc-300 cursor-pointer">Contact Us</p>
          </div>
          <div className="space-y-2">
            <p className="hover:text-zinc-300 cursor-pointer">Account</p>
            <p className="hover:text-zinc-300 cursor-pointer">Redeem Gift Cards</p>
            <p className="hover:text-zinc-300 cursor-pointer">Privacy Policy</p>
            <p className="hover:text-zinc-300 cursor-pointer">Speed Test</p>
          </div>
          <div className="space-y-2">
            <p className="hover:text-zinc-300 cursor-pointer">Media Center</p>
            <p className="hover:text-zinc-300 cursor-pointer">Buy Gift Cards</p>
            <p className="hover:text-zinc-300 cursor-pointer">Cookie Preferences</p>
            <p className="hover:text-zinc-300 cursor-pointer">Legal Notices</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs border-t border-zinc-900">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded w-fit">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <select className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>

          <p className="text-[11px] text-zinc-600 max-w-xl">
            MoviesBox does not store any files on its servers. All contents are provided by third-party services. © {new Date().getFullYear()} MoviesBox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
