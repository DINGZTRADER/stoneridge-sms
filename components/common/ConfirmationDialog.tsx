import React from 'react';
import Button from '../Button';

interface ConfirmationDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50" aria-labelledby="confirmation-dialog-title" role="dialog" aria-modal="true">
      <div className="relative p-6 border w-full max-w-sm md:max-w-md shadow-lg rounded-md bg-white">
        <div className="mb-4">
          <h3 id="confirmation-dialog-title" className="text-xl font-bold text-gray-800">Confirm Action</h3>
        </div>
        <div className="mb-6 text-gray-700">
          <p>{message}</p>
        </div>
        <div className="flex justify-end space-x-3">
          <Button onClick={onCancel} variant="secondary">
            {cancelButtonText}
          </Button>
          <Button onClick={onConfirm} variant="danger">
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;