'use client';

import React from 'react';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import { Toast as ToastType } from '@/hooks/useToast';

interface ToastContainerProps {
    toasts: ToastType[];
    onRemove: (id: string) => void;
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info
};

const colors = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
};

const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500'
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-50 space-y-2 max-w-sm">
            {toasts.map((toast) => {
                const Icon = icons[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 shadow-lg backdrop-blur-md animate-in slide-in-from-right ${colors[toast.type]}`}
                    >
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`} />
                        <p className="flex-1 text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => onRemove(toast.id)}
                            className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
