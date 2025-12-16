import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    PaperAirplaneIcon,
    DocumentTextIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { downloadAnalysisPDF, downloadJSON, downloadMarkdown } from '../utils/reportGenerator';
import { aiService, type GuestAnalysisResult } from '../services/ai';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { AnalysisResult } from '../types';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    trustScore?: number;
    status?: 'Trustworthy' | 'Neutral' | 'Risky';
}

const MAX_CHARS = 5000;

export default function GuestAITools() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [remainingCredits, setRemainingCredits] = useState<number>(3);
    const [_error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);

    // Fetch initial credits
    useEffect(() => {
        aiService.getGuestCredits().then(data => {
            setRemainingCredits(data.remaining_credits);
        }).catch(() => {
            // Ignore errors, default to 3
        });
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || isProcessing || remainingCredits <= 0) return;

        setError(null);

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const textToAnalyze = input;
        setInput('');
        setIsProcessing(true);

        try {
            const result: GuestAnalysisResult = await aiService.analyzeTextGuest(textToAnalyze);

            const status = result.verdict.charAt(0).toUpperCase() + result.verdict.slice(1);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: result.analysis_markdown,
                timestamp: new Date(),
                trustScore: result.score,
                status: status as 'Trustworthy' | 'Neutral' | 'Risky'
            };

            setMessages(prev => [...prev, aiMessage]);
            setRemainingCredits(result.remaining_credits);
        } catch (err: any) {
            setError(err.message || 'Analysis failed');

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: err.message || "Analysis failed. Please try again.",
                timestamp: new Date(),
                status: 'Neutral'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    const handleDownload = (format: 'pdf' | 'json' | 'md') => {
        const lastAiMsg = [...messages].reverse().find(m => m.role === 'ai' && m.trustScore !== undefined);
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');

        if (!lastAiMsg) return;

        const analysisData: AnalysisResult = {
            id: lastAiMsg.id,
            content: lastUserMsg?.content || '',
            aiResponse: lastAiMsg.content,
            trustScore: lastAiMsg.trustScore || 0,
            status: lastAiMsg.status || 'Neutral',
            timestamp: lastAiMsg.timestamp,
            type: 'Text'
        };

        if (format === 'pdf') {
            downloadAnalysisPDF(analysisData);
        } else if (format === 'json') {
            downloadJSON(analysisData, `Analysis_${analysisData.id}`);
        } else if (format === 'md') {
            const mdContent = `# Analysis Report\n\n**Date:** ${new Date().toLocaleString()}\n**Score:** ${analysisData.trustScore}/100\n\n## AI Response\n${analysisData.aiResponse}\n\n## Input\n${analysisData.content}`;
            downloadMarkdown(mdContent, `Analysis_${analysisData.id}`);
        }
    };

    const charsRemaining = MAX_CHARS - input.length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-purple-50/50 dark:from-primary-900/10 dark:via-transparent dark:to-purple-900/10" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 dark:bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
            </div>

            {/* Header */}
            <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl h-14 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full flex items-center justify-between px-4 lg:px-6 z-30 shadow-lg shadow-black/5">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20 text-center leading-none">
                        T
                    </div>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        TrustAI
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    {/* Credits Badge */}
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${remainingCredits > 0
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                        <SparklesIcon className="w-4 h-4" />
                        {remainingCredits} / 3 free
                    </div>

                    <Link
                        to="/signup"
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                    >
                        Sign Up
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 pt-24 pb-8 px-4 max-w-4xl mx-auto min-h-screen flex flex-col">
                {/* Chat Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-xl overflow-hidden flex flex-col"
                >
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8">
                                <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                    <DocumentTextIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Try TrustAI for Free
                                </h3>
                                <p className="max-w-md text-gray-600 dark:text-gray-400 mb-6">
                                    Paste any text to analyze its trustworthiness. You have <strong>{remainingCredits}</strong> free analyses remaining today.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <LockClosedIcon className="w-4 h-4" />
                                    <span>Sign up for unlimited analyses & file uploads</span>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`max-w-[90%] ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-primary-500/20'
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl rounded-tl-sm shadow-sm'
                                        } p-4`}>
                                        <div className="prose dark:prose-invert max-w-none text-sm break-words">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>

                                        {msg.role === 'ai' && msg.trustScore !== undefined && (
                                            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium uppercase tracking-wider opacity-70">Trust Score</span>
                                                    <Badge variant={msg.status === 'Trustworthy' ? 'success' : msg.status === 'Risky' ? 'error' : 'warning'} size="sm">
                                                        {msg.trustScore}/100
                                                    </Badge>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${msg.status === 'Trustworthy' ? 'bg-green-500' :
                                                            msg.status === 'Risky' ? 'bg-red-500' : 'bg-yellow-500'
                                                            }`}
                                                        style={{ width: `${msg.trustScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1.5 px-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}

                        {isProcessing && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Download buttons after AI response */}
                    {messages.some(m => m.role === 'ai' && m.trustScore !== undefined) && !isProcessing && (
                        <div className="flex justify-center p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-slate-900/50">
                            <Menu as="div" className="relative">
                                <Menu.Button as={Fragment}>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                                    >
                                        Download Report
                                    </Button>
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-dark-border overflow-hidden z-30">
                                        <div className="p-1">
                                            {['pdf', 'json', 'md'].map((format) => (
                                                <Menu.Item key={format}>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => handleDownload(format as 'pdf' | 'json' | 'md')}
                                                            className={`${active ? 'bg-primary-50 dark:bg-slate-800 text-primary-600' : 'text-gray-700 dark:text-gray-200'} flex w-full items-center rounded-lg px-2 py-2 text-sm`}
                                                        >
                                                            {format.toUpperCase()} {format === 'pdf' ? 'Report' : format === 'json' ? 'Data' : 'File'}
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
                        {/* No credits warning */}
                        {remainingCredits <= 0 && (
                            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    You've used all free analyses today.{' '}
                                    <Link to="/signup" className="font-semibold underline">Sign up</Link> for unlimited access!
                                </p>
                            </div>
                        )}

                        <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-500 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shadow-sm">
                            <button
                                onClick={clearChat}
                                disabled={isProcessing || messages.length === 0}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Clear Chat"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>

                            <textarea
                                value={input}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_CHARS) {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder={remainingCredits > 0 ? "Paste text to analyze its trustworthiness..." : "Sign up for more analyses"}
                                className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-none focus:ring-0 focus:outline-none p-2 resize-none text-gray-900 dark:text-white placeholder:text-gray-400"
                                rows={1}
                                disabled={isProcessing || remainingCredits <= 0}
                            />

                            <div className="flex items-center gap-2 pb-1">
                                <span className={`text-xs ${charsRemaining < 500 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {charsRemaining}
                                </span>
                                <Button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isProcessing || remainingCredits <= 0}
                                    size="sm"
                                    className="rounded-xl"
                                    isLoading={isProcessing}
                                >
                                    {!isProcessing && <PaperAirplaneIcon className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-2">
                            TrustAI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </motion.div>

                {/* CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-6 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl text-white text-center shadow-xl"
                >
                    <h3 className="text-lg font-bold mb-2">Want More?</h3>
                    <p className="text-sm text-white/80 mb-4">
                        Sign up for unlimited analyses, file uploads, project organization, and more!
                    </p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-primary-700 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        Get Started Free
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
