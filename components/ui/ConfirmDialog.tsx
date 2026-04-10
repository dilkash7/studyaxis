'use client';

type ConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
};

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, message }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-700 text-lg mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition">Delete</button>
        </div>
      </div>
    </div>
  );
}