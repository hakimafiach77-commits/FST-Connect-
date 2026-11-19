import React from 'react';

const SlidePanel = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <div className={`side-panel-overlay ${isOpen ? 'open' : ''}`} onClick={(e) => {
      if (e.target.classList.contains('side-panel-overlay')) onClose();
    }}>
      <div className="side-panel">
        <div className="side-panel-header">
          <h3 className="side-panel-title">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="side-panel-body">
          {children}
        </div>
        {footer && (
          <div className="side-panel-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlidePanel;
