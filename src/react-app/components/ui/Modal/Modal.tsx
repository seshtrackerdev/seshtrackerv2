import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import "../../../styles/.css";

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: ModalSize;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  hideCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  overlayClassName?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
  returnFocusRef?: React.RefObject<HTMLElement>;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  footer,
  children,
  size = 'md',
  closeOnEsc = true,
  closeOnOverlayClick = true,
  hideCloseButton = false,
  className = '',
  contentClassName = '',
  overlayClassName = '',
  initialFocusRef,
  returnFocusRef,
  ariaLabelledBy,
  ariaDescribedBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const titleId = ariaLabelledBy || 'modal-title';
  const descriptionId = ariaDescribedBy || 'modal-description';

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement;

    // Focus the first focusable element, or initialFocusRef, or modal itself
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      // Return focus to element that had it before modal opened
      if (isOpen && returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else if (isOpen && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, initialFocusRef, returnFocusRef]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEsc]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalClasses = [
    'modal',
    `modal-${size}`,
    className,
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'modal-content',
    contentClassName,
  ].filter(Boolean).join(' ');

  const overlayClasses = [
    'modal-overlay',
    overlayClassName,
  ].filter(Boolean).join(' ');

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div
      className={overlayClasses}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className={modalClasses}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className={contentClasses}>
          {title && (
            <div className="modal-header">
              <h3 className="modal-title" id={titleId}>
                {title}
              </h3>
              {!hideCloseButton && (
                <button
                  type="button"
                  className="modal-close-button"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="modal-close-icon">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="modal-body" id={descriptionId}>
            {children}
          </div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default Modal; 
