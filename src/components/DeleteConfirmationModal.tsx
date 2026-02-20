"use client";

import { Loader2, AlertTriangle } from "lucide-react";

export default function DeleteConfirmationModal({
  title,
  message,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">

          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            {title}
          </h2>

        </div>

        {/* Warning message */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={loading}
            className="
              px-4 py-2
              rounded-xl
              bg-gray-100
              hover:bg-gray-200
              text-gray-700
              transition
            "
          >
            Cancel
          </button>

          {/* Delete */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className="
              px-4 py-2
              rounded-xl
              bg-red-600
              hover:bg-red-700
              text-white
              flex items-center gap-2
              transition
            "
          >

            {loading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}

            Delete

          </button>

        </div>

      </div>

    </div>

  );

}
