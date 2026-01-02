import React from "react";

const items = [
  { label: "All" },
  { label: "Placements" },
  { label: "Examination" },
  { label: "Scholarship" },
  { label: "Admin" },
  { label: "Other" },
];

const SideBar = () => {
  return (
    <aside className="w-64 h-screen border-r border-neutral-200 bg-white p-4">
      <nav className="flex flex-col gap-1">
        {items.map(({ label }) => (
          <button
            key={label}
            className="px-3 py-2 rounded-md text-left text-sm text-neutral-900 hover:bg-neutral-100"
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SideBar;
