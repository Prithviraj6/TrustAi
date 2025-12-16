import { useState, useRef, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { filesService } from '../services/files';
import {
    ArrowLeftIcon, EllipsisVerticalIcon, PencilIcon, ShareIcon, TrashIcon, DocumentDuplicateIcon,
    ArrowTopRightOnSquareIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, PhotoIcon, DocumentIcon,
    PaperAirplaneIcon, PaperClipIcon, CameraIcon, XMarkIcon, PlusIcon, CheckIcon, ClockIcon, TagIcon,
    ArrowDownTrayIcon, ClipboardDocumentIcon, ArrowPathIcon, SparklesIcon, DocumentPlusIcon, ArrowUpTrayIcon, EyeIcon
} from '@heroicons/react/24/outline';
import { Menu, Tab, Transition, Dialog } from '@headlessui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { aiService } from '../services/ai';
import type { Project, Note, AnalysisResult } from '../types';
import { downloadProjectPDF, downloadAnalysisPDF, downloadJSON } from '../utils/reportGenerator';
import { projectsService } from '../services/projects';
import { messagesService } from '../services/messages';

// --- SAFE MARKDOWN WRAPPER ---
// Prevents app crash if markdown parsing fails
const SafeMarkdown = ({ content }: { content: string | null | undefined }) => {
    if (!content) return null;
    try {
        return (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {String(content)}
            </ReactMarkdown>
        );
    } catch (e) {
        console.error("Markdown Render Error:", e);
        return <p className="whitespace-pre-wrap">{String(content)}</p>;
    }
};

export default function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { updateProject, deleteProject } = useProjects();
    const { showToast } = useToast();
    const [project, setProject] = useState<Project | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [chatInput, setChatInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [newNote, setNewNote] = useState('');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [viewingNote, setViewingNote] = useState<Note | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isFetchingProject, setIsFetchingProject] = useState(true);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<any[]>([]);
    const [messages, setMessages] = useState<AnalysisResult[]>([]);

    // Simple cache key for this project
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    useEffect(() => {
        if (!id) return;

        // Check if we have cached data for this project
        const cacheKey = `project_${id}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
            try {
                const { project: cachedProject, files: cachedFiles, messages: cachedMessages, timestamp } = JSON.parse(cachedData);
                const isStale = Date.now() - timestamp > CACHE_TTL;

                if (!isStale && cachedProject && cachedFiles && cachedMessages) {
                    // Use cached data (restore Date objects)
                    const restoredProject = {
                        ...cachedProject,
                        lastUpdated: new Date(cachedProject.lastUpdated),
                        created: new Date(cachedProject.created),
                        history: (cachedProject.history || []).map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })),
                        documents: (cachedProject.documents || []).map((d: any) => ({ ...d, addedAt: new Date(d.addedAt) })),
                        notes: (cachedProject.notes || []).map((n: any) => ({ ...n, createdAt: new Date(n.createdAt), updatedAt: new Date(n.updatedAt) })),
                        activityLog: cachedProject.activityLog || [],
                        tags: cachedProject.tags || []
                    };
                    setProject(restoredProject);
                    setTitleInput(restoredProject.name);
                    setFiles(cachedFiles || []);
                    setMessages(cachedMessages || []);
                    setIsFetchingProject(false);
                    return;
                }
            } catch (e) {
                // Invalid cache, fetch fresh
                sessionStorage.removeItem(cacheKey);
            }
        }

        // Fetch fresh data
        setIsFetchingProject(true);
        projectsService.getProject(id)
            .then((data: any) => {
                // Start of transformation
                const fetchedProject: Project = {
                    ...data,
                    id: data._id || data.id,
                    lastUpdated: new Date(data.lastUpdated),
                    created: new Date(data.created),
                    history: (data.history || []).map((h: any) => ({
                        ...h,
                        timestamp: new Date(h.timestamp)
                    })),
                    documents: (data.documents || []).map((d: any) => ({
                        ...d,
                        addedAt: d.addedAt ? new Date(d.addedAt) : new Date()
                    })),
                    notes: (data.notes || []).map((n: any) => ({
                        ...n,
                        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
                        updatedAt: n.updatedAt ? new Date(n.updatedAt) : new Date()
                    })),
                    activityLog: data.activityLog || [],
                    tags: data.tags || []
                };
                // End of transformation

                setProject(fetchedProject);
                setTitleInput(fetchedProject.name);

                // Fetch files separately
                return Promise.all([
                    filesService.getProjectFiles(id),
                    messagesService.getMessages(id),
                    Promise.resolve(fetchedProject)
                ]);
            })
            .then(([fetchedFiles, fetchedMessages, fetchedProject]: [any[], any[], Project]) => {
                const mappedFiles = fetchedFiles.map((f: any) => ({
                    id: f.id,
                    name: f.filename,
                    type: f.mimetype.includes('pdf') ? 'PDF' : f.mimetype.includes('image') ? 'Image' : 'Text',
                    size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
                    addedAt: f.created_at,
                    url: filesService.getFileUrl(f.id)
                }));
                setFiles(mappedFiles);
                setMessages(fetchedMessages);

                // Cache the data
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify({
                        project: fetchedProject,
                        files: mappedFiles,
                        messages: fetchedMessages,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    // SessionStorage might be full, ignore
                }
            })
            .catch((err: any) => {
                console.error("Failed to fetch project:", err);
                showToast('error', 'Failed to load project');
            })
            .finally(() => {
                setIsFetchingProject(false);
            });
    }, [id, showToast]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeTab]);

    if (isFetchingProject && !project) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading Project...</p>
        </div>
    );

    if (!project && !isFetchingProject) return (
        <div className="p-10 text-center">
            <h2 className="text-xl font-bold">Project Not Found</h2>
            <Button onClick={() => navigate('/dashboard/projects')} className="mt-4">Back to Dashboard</Button>
        </div>
    );

    // --- SAFETIES ---
    const safeDate = (d: any) => {
        try { if (!d) return ""; return new Date(d).toLocaleDateString(); } catch (e) { return ""; }
    };
    const safeTime = (d: any) => {
        try { if (!d) return ""; return new Date(d).toLocaleTimeString(); } catch (e) { return ""; }
    };

    // --- HANDLERS ---
    const handleTitleSave = () => {
        if (project && titleInput.trim()) {
            updateProject(project.id, { name: titleInput });
            setProject(prev => prev ? { ...prev, name: titleInput } : null);
            setIsEditingTitle(false);
            showToast('success', 'Project renamed');
        }
    };

    const handleDeleteProject = () => {
        if (project && confirm('Delete project?')) {
            deleteProject(project.id);
            navigate('/dashboard/projects');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !project) return;

        setIsUploading(true);
        try {
            if (activeTab === 1) { // Docs
                const uploadedFile = await filesService.uploadFile(project.id, file);

                // Create document object from response
                const newDoc: any = {
                    id: uploadedFile.id,
                    name: uploadedFile.filename,
                    type: uploadedFile.mimetype.includes('pdf') ? 'PDF' : uploadedFile.mimetype.includes('image') ? 'Image' : 'Text',
                    size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                    addedAt: new Date(),
                    url: filesService.getFileUrl(uploadedFile.id)
                };

                setFiles(prev => [newDoc, ...prev]);
                // Update file count in project
                setProject(prev => prev ? { ...prev, files: (prev.files || 0) + 1 } : null);

                showToast('success', 'File uploaded successfully');
            } else { // Chat
                // For chat, we might want to upload it too, or just keep it local for preview until sent?
                // Usually chat attachments are uploaded when sent or immediately. 
                // Let's upload immediately to get a URL/ID for the analysis context.
                const uploadedFile = await filesService.uploadFile(project.id, file);
                setPreviewUrl(filesService.getFileUrl(uploadedFile.id));
                showToast('success', 'File attached');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showToast('error', 'Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if ((!chatInput.trim() && !previewUrl) || !project) return;
        setIsProcessing(true);
        setIsUnlocking(true);
        try {
            // 1. Send User Message
            await messagesService.sendMessage(project.id, {
                role: 'user',
                content: chatInput
            });

            // 2. Send for Analysis (Backend 'analyzeText' *also* saves the AI message to DB if project_id is passed)
            // So we do NOT need to manually save the AI response here.
            await aiService.analyzeText(chatInput, project.id);

            // Refresh messages to show the new AI response
            const updatedMsgs = await messagesService.getMessages(project.id);
            setMessages(updatedMsgs);

            // Invalidate cache so next load fetches fresh
            sessionStorage.removeItem(`project_${project.id}`);

            setChatInput('');
            setPreviewUrl(null);
            showToast('success', 'Analysis complete');
        } catch (error) {
            console.error(error);
            showToast('error', 'Analysis failed');
        } finally {
            setIsProcessing(false);
            setIsUnlocking(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('success', 'Copied');
    };

    const actuallyAddNote = async () => {
        if (!newNote.trim() || !project) return;

        try {
            const addedNote = await projectsService.addNote(project.id, newNote);

            // Backend returns the note object, we might need to format date if it's a string
            const formattedNote: Note = {
                ...addedNote,
                createdAt: new Date(addedNote.created_at || addedNote.createdAt || new Date()),
                updatedAt: new Date(addedNote.updated_at || addedNote.updatedAt || new Date())
            };

            const updatedNotes = [...(project.notes || []), formattedNote];

            // Update local state
            setProject(prev => prev ? { ...prev, notes: updatedNotes } : null);
            setNewNote('');
            setIsNoteModalOpen(false);
            showToast('success', 'Note added');
        } catch (error) {
            console.error("Failed to add note:", error);
            showToast('error', 'Failed to save note');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!project || !confirm('Delete note?')) return;
        try {
            await projectsService.deleteNote(project.id, noteId);
            const updatedNotes = project.notes?.filter(n => n.id !== noteId) || [];

            // Update local state
            setProject(prev => prev ? { ...prev, notes: updatedNotes } : null);
            if (selectedNote?.id === noteId) setSelectedNote(null);
            showToast('success', 'Note deleted');
        } catch (e) {
            showToast('error', 'Failed to delete note');
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        if (!project || !confirm('Delete document?')) return;

        try {
            await filesService.deleteFile(docId);
            setFiles(prev => prev.filter(f => f.id !== docId));
            setProject(prev => prev ? { ...prev, files: Math.max(0, (prev.files || 0) - 1) } : null);
            showToast('success', 'File deleted');
        } catch (error) {
            console.error("Failed to delete file:", error);
            showToast('error', 'Failed to delete file');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in no-scrollbar overflow-hidden relative">
            <header className="flex-none bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border py-4 px-4 md:px-8 z-10 transition-colors duration-200">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/projects')} className="hidden sm:flex"><ArrowLeftIcon className="w-5 h-5" /></Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    {isEditingTitle ? (
                                        <Input value={titleInput} onChange={e => setTitleInput(e.target.value)} className="h-8 font-bold" autoFocus onBlur={handleTitleSave} onKeyDown={e => e.key === 'Enter' && handleTitleSave()} />
                                    ) : (
                                        <div className="group flex items-center gap-2">
                                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{project?.name}</h1>
                                            <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400"><PencilIcon className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                    <Badge variant={project?.status === 'Trustworthy' ? 'success' : project?.status === 'Risky' ? 'error' : 'warning'}>{project?.status}</Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> Updated {safeDate(project?.lastUpdated)}</span>
                                    <span>• {project?.files || 0} files</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="secondary" onClick={() => project && downloadProjectPDF(project)} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>Export</Button>
                            <Button variant="danger" onClick={handleDeleteProject} icon={<TrashIcon className="w-4 h-4" />}>Delete</Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50 dark:bg-gray-900">
                <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0">
                    <Tab.Group as="div" className="flex-1 flex flex-col min-h-0" selectedIndex={activeTab} onChange={setActiveTab}>
                        <div className="flex-none px-4 md:px-8 pt-6 pb-4">
                            <Tab.List className="flex gap-6 border-b border-gray-200 dark:border-dark-border">
                                {['Chat & Analysis', 'Files & Docs', 'Notes'].map((tab) => (
                                    <Tab key={tab} className={({ selected }) => `pb-4 text-sm font-medium border-b-2 transition-colors focus:outline-none ${selected ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</Tab>
                                ))}
                            </Tab.List>
                        </div>
                        <Tab.Panels className="flex-1 flex flex-col overflow-hidden relative min-h-0 h-full">
                            <Tab.Panel className="flex-1 flex flex-col min-h-0 h-full">
                                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 min-h-0">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                                            <ChatBubbleLeftRightIcon className="w-12 h-12 mb-4 opacity-50" />
                                            <h3>Start Analyzing</h3>
                                        </div>
                                    ) : (
                                        messages.map((msg: any, index: number) => {
                                            const isUser = msg.role === 'user';
                                            return (
                                                <div key={msg._id || index} className={`flex flex-col gap-4 ${isUser ? 'items-end' : 'items-start'}`}>
                                                    <div className={`${isUser ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'} rounded-2xl p-4 max-w-[85%] shadow-sm`}>
                                                        <SafeMarkdown content={msg.content} />
                                                        <div className={`text-xs mt-2 ${isUser ? 'text-primary-200' : 'text-gray-500'}`}>
                                                            {safeTime(msg.created_at || new Date())}
                                                        </div>
                                                        {!isUser && msg.score !== undefined && (
                                                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center gap-4">
                                                                <div className="font-bold">Trust Score: {msg.score}/100</div>
                                                                <button onClick={() => handleCopy(msg.content)} className="p-1 opacity-50 hover:opacity-100"><ClipboardDocumentIcon className="w-4 h-4" /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="flex-none p-4 md:p-6 bg-transparent z-10 max-w-4xl mx-auto w-full">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 pl-4 rounded-[26px] border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-none ring-1 ring-black/5 dark:ring-white/10 transition-all focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500/50">
                                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><PaperClipIcon className="w-5 h-5" /></button>
                                        <textarea
                                            value={chatInput}
                                            onChange={e => {
                                                setChatInput(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAnalyze();
                                                    const target = e.target as HTMLTextAreaElement;
                                                    setTimeout(() => { target.style.height = 'auto'; }, 0);
                                                }
                                            }}
                                            placeholder="Message TrustAI..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none p-3 max-h-[200px] min-h-[44px] resize-none text-gray-900 dark:text-white placeholder:text-gray-400 font-normal leading-relaxed custom-scrollbar"
                                            rows={1}
                                        />
                                        <Button onClick={handleAnalyze} disabled={!chatInput.trim() || isProcessing} size="sm"><PaperAirplaneIcon className="w-5 h-5" /></Button>
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-xs text-gray-400">TrustAI can make mistakes. Verify important info.</span>
                                    </div>
                                </div>
                            </Tab.Panel>

                            <Tab.Panel className="h-full overflow-y-auto p-4 md:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {files.map((doc: any) => (
                                        <Card key={doc.id} className="p-4 hover:shadow-md cursor-pointer group">
                                            <div className="flex justify-between mb-2">
                                                <DocumentIcon className="w-8 h-8 text-gray-400" />
                                                <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                            <h4 className="font-bold truncate">{doc.name}</h4>
                                            <div className="text-xs text-gray-500">{doc.size} • {safeDate(doc.addedAt)}</div>
                                        </Card>
                                    ))}
                                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl hover:bg-gray-50"><PlusIcon className="w-8 h-8 text-gray-400" /> Upload</button>
                                </div>
                            </Tab.Panel>

                            <Tab.Panel className="h-full overflow-y-auto p-4 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {project?.notes?.map((note: Note) => (
                                        <div key={note.id} className="bg-white dark:bg-dark-card p-5 rounded-2xl border shadow-sm h-52 flex flex-col cursor-pointer hover:shadow-md" onClick={() => setViewingNote(note)}>
                                            <p className="flex-1 text-sm line-clamp-6 whitespace-pre-wrap">{note.content}</p>
                                            <div className="mt-3 flex items-center justify-between pt-3 border-t">
                                                <span className="text-xs text-gray-400">{safeDate(note.createdAt)}</span>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => setIsNoteModalOpen(true)} className="flex items-center justify-center h-52 border-2 border-dashed rounded-2xl hover:bg-gray-50"><PlusIcon className="w-8 h-8 mr-2" /> Add Note</button>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>

            {/* Note Modals */}
            <Dialog open={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl p-6">
                        <Dialog.Title className="text-lg font-bold">Add Note</Dialog.Title>
                        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full h-32 mt-4 p-3 border rounded-xl dark:bg-slate-800" placeholder="Content..." />
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="secondary" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
                            <Button onClick={actuallyAddNote}>Save</Button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
            <Dialog open={!!viewingNote} onClose={() => setViewingNote(null)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2">
                                <Dialog.Title className="text-lg font-bold">Note</Dialog.Title>
                                <span className="text-sm text-gray-500 mt-1">{viewingNote && safeDate(viewingNote.createdAt)}</span>
                            </div>
                            <button onClick={() => setViewingNote(null)}><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <p className="whitespace-pre-wrap">{viewingNote?.content}</p>
                    </Dialog.Panel>
                </div>
            </Dialog>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />
        </div>
    );
}
