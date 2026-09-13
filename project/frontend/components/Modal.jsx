import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({ visible, title, children, onClose, actions }) => {
    const titleId = useId();
    const closeRef = useRef(null);

    useEffect(() => {
        if (!visible) return undefined;
        closeRef.current?.focus();
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [visible, onClose]);

    if (!visible) return null;
    return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onClose}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-header"><h3 id={titleId}>{title}</h3><button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Fermer la fenêtre"><X size={17} /></button></div><div className="modal-body">{children}</div>{actions && <div className="modal-actions">{actions}</div>}</div></div>;
};

export default Modal;
