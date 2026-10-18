import { useEffect, type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="nx-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="nx-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-desc' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nx-modal__header">
          <div>
            <h2 id="modal-title" className="nx-modal__title">
              {title}
            </h2>
            {description && (
              <p id="modal-desc" className="nx-modal__desc">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="nx-modal__close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="nx-modal__body">{children}</div>

        {footer && <div className="nx-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
