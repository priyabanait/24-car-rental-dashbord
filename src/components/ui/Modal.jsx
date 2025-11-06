import { useState } from 'react';
import { cn } from '../../utils';

export function Modal({ open, onClose, children, className }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        <div className={cn(
          'relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto',
          className
        )}>
          {children}
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