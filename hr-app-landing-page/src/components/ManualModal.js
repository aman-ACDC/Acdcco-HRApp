import React from 'react';
import './ManualModal.css';

const ManualModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "primary" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-modal btn-cancel-modal" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-modal btn-confirm-modal btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualModal;
