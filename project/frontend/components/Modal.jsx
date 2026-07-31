const Modal = ({ visible, title, children, onClose, actions }) => {
    if (!visible) return null;

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 id="modal-title">{title}</h3>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer la fenêtre">
                        ×
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {actions && <div className="modal-actions">{actions}</div>}
            </div>
        </div>
    );
};

export default Modal;
