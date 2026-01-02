import React from "react";
import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";

const TopBar = () => {
  return (
    <header className="w-full h-14 flex items-center justify-between px-4 md:px-6 border-b border-neutral-200 bg-blue-50">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-neutral-900" />
        </button>

        <NavLink
          to="/"
          className="text-lg font-semibold tracking-tight text-neutral-900"
        >
          MAIL
        </NavLink>
      </div>

      <input
        type="text"
        placeholder="Search…"
        className="hidden md:block w-56 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm
                   focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
      />
    </header>
  );
};

export default TopBar;
