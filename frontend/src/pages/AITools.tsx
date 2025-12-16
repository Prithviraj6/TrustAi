import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import {
    PaperAirplaneIcon,
    PaperClipIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    PlusIcon,
    ChatBubbleLeftIcon,
    ClipboardDocumentCheckIcon,
    TrashIcon,
    Bars2Icon,
    XMarkIcon,
    CameraIcon,
    FolderPlusIcon,
    CheckIcon,
    FolderIcon,
    ChevronDownIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { Transition, Listbox, Menu } from '@headlessui/react';
import { Fragment } from 'react';

import { downloadAnalysisPDF, downloadJSON, downloadMarkdown } from '../utils/reportGenerator';

import { useToast } from '../context/ToastContext';
import { useLoading } from '../context/LoadingContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { Project, AnalysisResult } from '../types';
import { useProjects } from '../context/ProjectContext';
import { aiService } from '../services/ai';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    trustScore?: number;
    status?: 'Trustworthy' | 'Neutral' | 'Risky';
}

interface Chat {
    id: string;
    title: string;
    messages: Message[];
}

export default function AITools() {
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();
    const { projects, addProject, updateProject } = useProjects();

    const [chats, setChats] = useState<Chat[]>([
        { id: '1', title: 'New Analysis', messages: [] }
    ]);
    const [activeChatId, setActiveChatId] = useState('1');
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);

    // Save to Project State
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const availableProjects = projects;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat.messages, isProcessing]);

    const createNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: 'New Analysis',
            messages: []
        };
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
        setShowHistory(false);
        setPreviewUrl(null);
        setUploadedFile(null);
        setInput('');
        showToast('info', 'New chat created');
    };

    const clearChat = () => {
        setChats(prev => prev.map(chat => {
            if (chat.id === activeChatId) {
                return { ...chat, messages: [] };
            }
            return chat;
        }));
        setPreviewUrl(null);
        setUploadedFile(null);
        showToast('info', 'Chat cleared');
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        showToast('success', 'Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        showLoading('Processing file...');
        let extractedText = '';

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
        setUploadedFile({ name: file.name, type: file.type });

        try {
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                extractedText = fullText;
            } else if (file.type.startsWith('image/')) {
                const result = await Tesseract.recognize(file, 'eng');
                extractedText = result.data.text;
            } else if (file.type === 'text/plain') {
                extractedText = await file.text();
            }

            setInput(prev => prev + (prev ? '\n\n' : '') + `[Extracted from ${file.name}]:\n${extractedText}`);
            showToast('success', 'File processed successfully');
        } catch (error) {
            console.error('Extraction failed:', error);
            showToast('error', 'Failed to extract text');
        } finally {
            setIsUploading(false);
            hideLoading();
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    const clearPreview = () => {
        setPreviewUrl(null);
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showToast('info', 'Preview cleared');
    };

    const generateAIResponse = async (textToAnalyze: string) => {
        setIsProcessing(true);

        try {
            const result = await aiService.analyzeText(textToAnalyze);

            // Capitalize first letter for status to match UI expectation
            const status = result.verdict.charAt(0).toUpperCase() + result.verdict.slice(1);

            const aiMessage: Message = {
                id: Date.now().toString(),
                role: 'ai',
                content: result.analysis_markdown,
                timestamp: new Date(),
                trustScore: result.score,
                status: status as 'Trustworthy' | 'Neutral' | 'Risky'
            };

            setChats(prev => prev.map(chat => {
                if (chat.id === activeChatId) {
                    return {
                        ...chat,
                        messages: [...chat.messages, aiMessage]
                    };
                }
                return chat;
            }));

            showToast('success', 'Analysis complete');
        } catch (error) {
            console.error('AI Analysis failed:', error);
            showToast('error', 'Failed to analyze text. Please try again.');

            // Add error message to chat
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'ai',
                content: "I apologize, but I encountered an error while analyzing the text. Please try again later.",
                timestamp: new Date(),
                trustScore: 0,
                status: 'Neutral'
            };

            setChats(prev => prev.map(chat => {
                if (chat.id === activeChatId) {
                    return {
                        ...chat,
                        messages: [...chat.messages, errorMessage]
                    };
                }
                return chat;
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isProcessing) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setChats(prev => prev.map(chat => {
            if (chat.id === activeChatId) {
                return {
                    ...chat,
                    title: chat.messages.length === 0 ? input.slice(0, 30) + '...' : chat.title,
                    messages: [...chat.messages, userMsg]
                };
            }
            return chat;
        }));

        setInput('');
        setPreviewUrl(null);
        setUploadedFile(null);

        // Use the input text or extracted text if available (logic needs to be robust)
        // For now, we are sending 'input' which contains the user message.
        // If file was uploaded, 'input' state was updated with extracted text.
        await generateAIResponse(input);
    };

    const regenerateResponse = async () => {
        const lastUserMsg = [...activeChat.messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) {
            // Remove last AI message if exists
            setChats(prev => prev.map(chat => {
                if (chat.id === activeChatId && chat.messages[chat.messages.length - 1].role === 'ai') {
                    return {
                        ...chat,
                        messages: chat.messages.slice(0, -1)
                    };
                }
                return chat;
            }));
            await generateAIResponse(lastUserMsg.content);
        }
    };

    const handleSaveToProject = () => {
        setIsSaveModalOpen(true);
    };

    const confirmSaveToProject = () => {
        if (isCreatingProject && !newProjectName.trim()) return;
        if (!isCreatingProject && !selectedProject) return;

        showLoading('Saving analysis to project...');

        // Simulate API call
        setTimeout(() => {
            hideLoading();
            setIsSaveModalOpen(false);

            const lastMessage = activeChat.messages[activeChat.messages.length - 1];
            const userMessage = activeChat.messages[activeChat.messages.length - 2]; // Assuming user message is before AI

            if (lastMessage.role === 'ai' && lastMessage.trustScore !== undefined) {
                const newAnalysis: AnalysisResult = {
                    id: Date.now().toString(),
                    content: userMessage?.content || 'No input content',
                    aiResponse: lastMessage.content,
                    trustScore: lastMessage.trustScore,
                    status: lastMessage.status || 'Neutral',
                    timestamp: new Date(),
                    type: uploadedFile ? (uploadedFile.type.includes('pdf') ? 'PDF' : uploadedFile.type.includes('image') ? 'Image' : 'Text') : 'Text',
                    fileName: uploadedFile?.name
                };

                if (isCreatingProject) {
                    const newProject: Project = {
                        id: Date.now().toString(),
                        name: newProjectName,
                        description: 'Created from AI Tools',
                        files: 1,
                        priority: 'Medium',
                        date: 'Just now',
                        trustScore: lastMessage.trustScore,
                        status: lastMessage.status || 'Neutral',
                        type: uploadedFile ? (uploadedFile.type.includes('pdf') ? 'PDF' : uploadedFile.type.includes('image') ? 'Image' : 'Text') : 'Text',
                        lastUpdated: new Date(),
                        created: new Date(),
                        category: 'General',
                        tags: [],
                        history: [newAnalysis],
                        documents: [],
                        notes: [],
                        activityLog: []
                    };
                    addProject(newProject);
                } else if (selectedProject) {
                    const updatedHistory = [...selectedProject.history, newAnalysis];
                    // Recalculate average trust score
                    const totalScore = selectedProject.trustScore * selectedProject.history.length + lastMessage.trustScore;
                    const newTrustScore = Math.round(totalScore / (selectedProject.history.length + 1));

                    updateProject(selectedProject.id, {
                        history: updatedHistory,
                        trustScore: newTrustScore,
                        lastUpdated: new Date(),
                        files: selectedProject.files + 1
                    });
                }
            }

            showToast('success', `Analysis saved to ${isCreatingProject ? newProjectName : selectedProject?.name}`);
            setNewProjectName('');
            setSelectedProject(null);
            setIsCreatingProject(false);
        }, 1000);
    };

    const handleDownload = (format: 'pdf' | 'json' | 'md') => {
        const lastAiMsg = [...activeChat.messages].reverse().find(m => m.role === 'ai');
        const lastUserMsg = [...activeChat.messages].reverse().find(m => m.role === 'user');

        if (!lastAiMsg) return;

        const analysisData: AnalysisResult = {
            id: lastAiMsg.id,
            content: lastUserMsg?.content || '',
            aiResponse: lastAiMsg.content,
            trustScore: lastAiMsg.trustScore || 0,
            status: lastAiMsg.status || 'Neutral',
            timestamp: lastAiMsg.timestamp,
            type: uploadedFile ? (uploadedFile.type.includes('pdf') ? 'PDF' : uploadedFile.type.includes('image') ? 'Image' : 'Text') : 'Text',
            fileName: uploadedFile?.name
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

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 relative">
            {/* Mobile History Backdrop */}
            {showHistory && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setShowHistory(false)}
                />
            )}

            {/* Chat History Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border 
                transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col 
                rounded-2xl lg:border lg:h-full shadow-xl lg:shadow-none
                ${showHistory ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between gap-2">
                    <Button
                        onClick={createNewChat}
                        className="flex-1"
                        icon={<PlusIcon className="w-5 h-5" />}
                    >
                        New Analysis
                    </Button>
                    <button
                        onClick={() => setShowHistory(false)}
                        className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {chats.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => {
                                setActiveChatId(chat.id);
                                setShowHistory(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${activeChatId === chat.id
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <ChatBubbleLeftIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate text-sm font-medium">{chat.title}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm w-full relative">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 border-b border-gray-200 dark:border-dark-border flex items-center gap-3 bg-white dark:bg-dark-card z-10">
                    <button
                        onClick={() => setShowHistory(true)}
                        className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <Bars2Icon className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {activeChat.title}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
                    {activeChat.messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8 animate-fade-in">
                            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                <DocumentTextIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Start a New Analysis</h3>
                            <p className="max-w-md text-gray-600 dark:text-gray-400">
                                Upload a document, take a photo, or paste text to analyze its trustworthiness using our advanced AI.
                            </p>
                        </div>
                    ) : (
                        activeChat.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
                            >
                                <div className={`max-w-[90%] sm:max-w-[80%] ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-primary-500/20'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl rounded-tl-sm shadow-sm'
                                    } p-4 group relative transition-all duration-200 hover:shadow-md`}>
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

                                    <button
                                        onClick={() => handleCopy(msg.content, msg.id)}
                                        className={`absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all ${copiedId === msg.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                        title="Copy message"
                                    >
                                        {copiedId === msg.id ? (
                                            <span className="text-xs font-bold text-green-300">Copied!</span>
                                        ) : (
                                            <ClipboardDocumentCheckIcon className="w-4 h-4 text-current" />
                                        )}
                                    </button>
                                </div>
                                <span className="text-xs text-gray-400 mt-1.5 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    )}
                    {isProcessing && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border z-20">


                    {/* Save to Project Button - Show when there is an AI response */}
                    {activeChat.messages.length > 0 && activeChat.messages.some(m => m.role === 'ai') && !isProcessing && (
                        <div className="flex justify-center mb-4 animate-fade-in gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={regenerateResponse}
                                icon={<ArrowPathIcon className="w-4 h-4" />}
                            >
                                Regenerate
                            </Button>

                            <Menu as="div" className="relative inline-block text-left">
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
                                    <Menu.Items className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 origin-bottom bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-dark-border focus:outline-none overflow-hidden z-30">
                                        <div className="p-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => handleDownload('pdf')}
                                                        className={`${active ? 'bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'} group flex w-full items-center rounded-lg px-2 py-2 text-sm`}
                                                    >
                                                        PDF Report
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => handleDownload('json')}
                                                        className={`${active ? 'bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'} group flex w-full items-center rounded-lg px-2 py-2 text-sm`}
                                                    >
                                                        JSON Data
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => handleDownload('md')}
                                                        className={`${active ? 'bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'} group flex w-full items-center rounded-lg px-2 py-2 text-sm`}
                                                    >
                                                        Markdown
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSaveToProject}
                                icon={<FolderPlusIcon className="w-4 h-4" />}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                            >
                                Save to Project
                            </Button>
                        </div>
                    )}

                    {/* Image Preview */}
                    {previewUrl && (
                        <div className="mb-4 relative inline-block animate-fade-in group">
                            <img
                                src={previewUrl}
                                alt="Upload preview"
                                className="h-32 w-auto rounded-xl border border-gray-200 dark:border-slate-700 object-cover shadow-sm"
                            />
                            <button
                                onClick={clearPreview}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-500 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shadow-sm">
                        {/* Hidden Inputs */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".pdf,.txt,.png,.jpg,.jpeg"
                        />
                        <input
                            type="file"
                            ref={cameraInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                        />

                        {/* Attachment Buttons */}
                        <div className="flex gap-1 pb-1">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || isProcessing}
                                className={`p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${isUploading ? 'animate-pulse' : ''}`}
                                title="Upload File"
                            >
                                {isUploading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperClipIcon className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                disabled={isUploading || isProcessing}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Take Photo"
                            >
                                <CameraIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={clearChat}
                                disabled={isProcessing}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Clear Chat"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Textarea */}
                        <textarea
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                    const target = e.target as HTMLTextAreaElement;
                                    setTimeout(() => { target.style.height = 'auto'; }, 0);
                                }
                            }}
                            placeholder="Type or paste text to analyze..."
                            className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-none focus:ring-0 focus:outline-none p-2 resize-none text-gray-900 dark:text-white placeholder:text-gray-400 font-normal leading-relaxed custom-scrollbar"
                            rows={1}
                            disabled={isProcessing}
                        />

                        {/* Send Button */}
                        <div className="pb-1">
                            <Button
                                onClick={sendMessage}
                                disabled={!input.trim() || isProcessing}
                                size="sm"
                                className="rounded-xl" // Added rounded-xl to match other buttons
                                isLoading={isProcessing}
                            >
                                {!isProcessing && <PaperAirplaneIcon className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            TrustAI can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>
            </div>
            {/* Save to Project Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
                        onClick={() => setIsSaveModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-2xl animate-scale-in overflow-hidden border border-gray-100 dark:border-dark-border">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <FolderPlusIcon className="w-5 h-5" />
                                </div>
                                Save Analysis
                            </h2>
                            <button
                                onClick={() => setIsSaveModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                                <button
                                    onClick={() => setIsCreatingProject(false)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isCreatingProject
                                        ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Existing Project
                                </button>
                                <button
                                    onClick={() => setIsCreatingProject(true)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isCreatingProject
                                        ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    New Project
                                </button>
                            </div>

                            {isCreatingProject ? (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        Project Name
                                    </label>
                                    <input
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="e.g., Q3 Contract Review"
                                        autoFocus
                                        className="block w-full rounded-xl border-2 border-primary-100 dark:border-slate-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:outline-none sm:text-sm py-3 px-4 transition-all duration-200 placeholder-gray-400 hover:border-primary-200 dark:hover:border-primary-800"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        Select Project
                                    </label>
                                    <Listbox value={selectedProject} onChange={setSelectedProject}>
                                        <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-xl border-2 border-primary-100 dark:border-slate-500 bg-white dark:bg-slate-800 py-3 pl-11 pr-10 text-left shadow-sm focus:outline-none focus:border-primary-500 sm:text-sm hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
                                                <span className={`block truncate ${selectedProject ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                                    {selectedProject ? selectedProject.name : 'Choose a project...'}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                    <FolderIcon className="h-5 w-5 text-primary-500" aria-hidden="true" />
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                    <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-dark-card py-1 text-base shadow-xl border border-gray-100 dark:border-dark-border ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {availableProjects.map((project) => (
                                                        <Listbox.Option
                                                            key={project.id}
                                                            className={({ active }) =>
                                                                `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${active ? 'bg-primary-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                                                }`
                                                            }
                                                            value={project}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-medium text-primary-600 dark:text-primary-400' : 'font-normal'}`}>
                                                                        {project.name}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsSaveModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmSaveToProject}
                                    disabled={isCreatingProject ? !newProjectName.trim() : !selectedProject}
                                    icon={<CheckIcon className="w-5 h-5" />}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
