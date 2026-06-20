import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-8 text-zinc-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-lg font-bold tracking-wider text-transparent">
              SEAPEDIA
            </span>
            <p className="text-xs text-zinc-500">
              Platform e-commerce multi-toko & multi-peran premium.
            </p>
          </div>
          <div className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} SEAPEDIA. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
