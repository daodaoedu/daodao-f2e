import React, { useState, useRef, useEffect } from 'react';
import { MdMoreVert } from 'react-icons/md';

const ReportMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setOpen((prev) => !prev);

    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        ref={buttonRef}
        onClick={toggleMenu}
        className="w-6 h-6 text-basic-300 rounded-full flex items-center justify-center hover:bg-basic-100 focus:outline-none"
      >
        <MdMoreVert />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-20 bg-white border border-gray-200 rounded-md shadow-lg"
        >
          <button
            type="button"
            onClick={() => window.open('https://forms.gle/NkVbDWC3eXk4P4gv7', '_blank')}
            className="w-full text-left px-4 py-2 text-basic-500 hover:bg-basic-100 transition"
          >
            檢舉
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportMenu;
