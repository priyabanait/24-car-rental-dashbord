import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils';

export function Modal({ open, isOpen, onClose, children, className, title }) {
  const isModalOpen = open || isOpen;
  
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        <div className={cn(
          'relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto',
          className
        )}>
          {title && (
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

export function ModalTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
}

export function ModalContent({ children, className }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200 flex justify-end space-x-3', className)}>
      {children}
    </div>
  );
}