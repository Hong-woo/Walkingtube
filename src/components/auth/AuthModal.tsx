'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Mail, Lock, Loader2, LogIn } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // For signup, usually you need to confirm email, but for dev we might overlook or alert
                alert('가입 확인 이메일을 확인해주세요!');
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="relative p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isLogin ? 'Walkingtube 로그인' : '새 계정 만들기'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isLogin ? '여행의 순간을 공유해보세요' : 'Walkingtube와 함께하세요'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="이메일"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {isLogin ? '로그인' : '회원가입'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 font-semibold text-black hover:underline"
                        >
                            {isLogin ? '회원가입' : '로그인'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
