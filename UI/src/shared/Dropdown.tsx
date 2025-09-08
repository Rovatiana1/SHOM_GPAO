// src/components/Dropdown.tsx
import React, { useState, useRef, useEffect, ReactNode, CSSProperties } from "react";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownProps {
  button: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  width?: string | number;
  showIcon?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  button,
  children,
  align = "right",
  width,
  showIcon = true,
  className = "",
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [autoWidth, setAutoWidth] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Fermer quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Ajuste la largeur automatiquement si aucune largeur définie
  useEffect(() => {
    if (open && !width && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setAutoWidth(buttonRect.width);
    }
  }, [open, width]);

  const dropdownStyle: CSSProperties = {
    width: width
      ? typeof width === "number"
        ? `${width}px`
        : width
      : autoWidth
      ? `${autoWidth}px`
      : undefined,
  };

  return (
    <div className={`relative inline-block`}>
      {/* Bouton du dropdown */}
      <div
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 cursor-pointer px-2 py-1 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition ${className}`}
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="flex-1">{button}</div>
        {showIcon && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-500 text-sm"
          >
            <FaChevronDown />
          </motion.span>
        )}
      </div>

      {/* Menu du dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className={`absolute mt-1 ${align === "right" ? "right-0" : "left-0"} bg-white border border-gray-200 rounded-lg shadow-lg z-50`}
            style={dropdownStyle}
            role="menu"
          >
            <div className="py-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
