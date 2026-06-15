// ContextMenu.jsx
import { useEffect, useRef } from 'react';
// @ts-ignore
export const ContextMenu = ({ position, items, onClose }) => {
  const menuRef = useRef(null);

  // 点击外部关闭菜单
  useEffect(() => {
    // @ts-ignore
    const handleClickOutside = (e) => {
        // @ts-ignore
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000
      }}
    >
        {/* @ts-ignore */}
      {items.map((item, index) => (
        <div
          key={index}
          className="menu-item"
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};