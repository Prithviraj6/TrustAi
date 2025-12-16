import { useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FolderIcon,
    PlusIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EllipsisVerticalIcon,
    DocumentTextIcon,
    PhotoIcon,
    DocumentIcon,
    TrashIcon,
    PencilIcon,
    DocumentDuplicateIcon,
    ArrowTopRightOnSquareIcon,
    CalendarIcon,
    ChevronDownIcon,
    CheckIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition, Listbox } from '@headlessui/react';
import { useToast } from '../context/ToastContext';
// import { useLoading } from '../context/LoadingContext'; // Unused
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import type { Project } from '../types';
import { useProjects } from '../context/ProjectContext';
import { downloadProjectPDF } from '../utils/reportGenerator';


type SortOption = 'recent' | 'oldest' | 'score_high' | 'score_low' | 'az';
type FilterCategory = 'all' | 'General' | 'Financial' | 'Legal' | 'HR' | 'Personal';

export default function Projects() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    // const { hideLoading } = useLoading(); // Unused
    const { projects, addProject, updateProject, deleteProject, isLoading } = useProjects();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [projectToRename, setProjectToRename] = useState<Project | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        category: 'General'
    });

    const filteredProjects = useMemo(() => {
        let result = projects;

        // Filter by category
        if (filterCategory !== 'all') {
            result = result.filter(p => p.category === filterCategory);
        }

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // Sort
        return [...result].sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return b.lastUpdated.getTime() - a.lastUpdated.getTime();
                case 'oldest':
                    return a.lastUpdated.getTime() - b.lastUpdated.getTime();
                case 'score_high':
                    return b.trustScore - a.trustScore;
                case 'score_low':
                    return a.trustScore - b.trustScore;
                case 'az':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }, [projects, filterCategory, searchQuery, sortBy]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.name.trim()) return;

        try {
            await addProject({
                name: newProject.name,
                description: newProject.description,
                category: newProject.category,
                priority: 'Medium'
            });

            setNewProject({ name: '', description: '', category: 'General' });
            setIsModalOpen(false);
            showToast('success', 'Project created successfully');
        } catch (error) {
            showToast('error', 'Failed to create project');
        }
    };

    const handleRenameClick = (project: Project) => {
        setProjectToRename(project);
        setRenameValue(project.name);
        setIsRenameModalOpen(true);
    };

    const handleRenameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectToRename || !renameValue.trim()) return;

        try {
            await updateProject(projectToRename.id, { name: renameValue.trim() });
            showToast('success', 'Project renamed successfully');
            setIsRenameModalOpen(false);
            setProjectToRename(null);
        } catch (error) {
            showToast('error', 'Failed to rename project');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject(id);
                showToast('info', 'Project deleted');
            } catch (error) {
                // Error handled in context
            }
        }
    };

    const handleDuplicate = async (project: Project) => {
        try {
            await addProject({
                name: `${project.name} (Copy)`,
                description: project.description,
                category: project.category,
                priority: project.priority
            });
            showToast('success', 'Project duplicated');
        } catch (error) {
            showToast('error', 'Failed to duplicate project');
        }
    };

    const getIconByType = (type: string) => {
        switch (type) {
            case 'PDF': return <DocumentTextIcon className="w-5 h-5" />;
            case 'Image': return <PhotoIcon className="w-5 h-5" />;
            case 'Text': return <DocumentIcon className="w-5 h-5" />;
            default: return <FolderIcon className="w-5 h-5" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Your saved trust analyses & documents</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                            className="py-2.5"
                        />
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        icon={<PlusIcon className="w-5 h-5" />}
                    >
                        New Project
                    </Button>
                </div>
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                    <FunnelIcon className="w-4 h-4" />
                    <span>Filter:</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {(['all', 'General', 'Financial', 'Legal', 'HR', 'Personal'] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterCategory === cat
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>
                <div className="sm:ml-auto flex items-center gap-2">
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                            <span>
                                {sortBy === 'recent' && 'Most Recent'}
                                {sortBy === 'oldest' && 'Oldest'}
                                {sortBy === 'score_high' && 'Highest Score'}
                                {sortBy === 'score_low' && 'Lowest Score'}
                                {sortBy === 'az' && 'Name (A-Z)'}
                            </span>
                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
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
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-dark-border z-20 focus:outline-none divide-y divide-gray-100 dark:divide-dark-border">
                                <div className="p-1">
                                    {[
                                        { value: 'recent', label: 'Most Recent' },
                                        { value: 'oldest', label: 'Oldest' },
                                        { value: 'score_high', label: 'Highest Score' },
                                        { value: 'score_low', label: 'Lowest Score' },
                                        { value: 'az', label: 'Name (A-Z)' }
                                    ].map((option) => (
                                        <Menu.Item key={option.value}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setSortBy(option.value as SortOption)}
                                                    className={`${active ? 'bg-gray-50 dark:bg-slate-800' : ''
                                                        } ${sortBy === option.value ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10' : 'text-gray-700 dark:text-gray-200'
                                                        } w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors`}
                                                >
                                                    {option.label}
                                                    {sortBy === option.value && (
                                                        <CheckIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <FolderIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No projects found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                        {searchQuery ? `No projects match "${searchQuery}"` : "Get started by creating your first analysis project."}
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon className="w-5 h-5" />}>
                        Create New Project
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project, index) => (
                        <Card
                            key={project.id}
                            className="group relative hover:-translate-y-1 transition-all duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl transition-colors ${project.status === 'Trustworthy' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                        project.status === 'Risky' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                            'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        }`}>
                                        {getIconByType(project.type)}
                                    </div>

                                    <Menu as="div" className="relative">
                                        <Menu.Button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                            <EllipsisVerticalIcon className="w-5 h-5" />
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
                                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-dark-border z-10 focus:outline-none divide-y divide-gray-100 dark:divide-dark-border">
                                                <div className="p-1">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                                                                className={`${active ? 'bg-gray-50 dark:bg-slate-800' : ''} w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg transition-colors`}
                                                            >
                                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Open Project
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => downloadProjectPDF(project)}
                                                                className={`${active ? 'bg-gray-50 dark:bg-slate-800' : ''} w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg transition-colors`}
                                                            >
                                                                <ArrowDownTrayIcon className="w-4 h-4" /> Download Report
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleRenameClick(project)}
                                                                className={`${active ? 'bg-gray-50 dark:bg-slate-800' : ''} w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg transition-colors`}
                                                            >
                                                                <PencilIcon className="w-4 h-4" /> Rename
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleDuplicate(project)}
                                                                className={`${active ? 'bg-gray-50 dark:bg-slate-800' : ''} w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg transition-colors`}
                                                            >
                                                                <DocumentDuplicateIcon className="w-4 h-4" /> Duplicate
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                </div>
                                                <div className="p-1">
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleDelete(project.id)}
                                                                className={`${active ? 'bg-red-50 dark:bg-red-900/20' : ''} w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg transition-colors`}
                                                            >
                                                                <TrashIcon className="w-4 h-4" /> Delete
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                </div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate" title={project.name}>
                                    {project.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                                    {project.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                                    <Badge variant={project.status === 'Trustworthy' ? 'success' : project.status === 'Risky' ? 'error' : 'warning'} size="sm">
                                        {project.trustScore}/100
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        <span>{project.lastUpdated.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* New Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-2xl shadow-2xl animate-scale-in overflow-hidden border border-gray-100 dark:border-dark-border">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                                    <FolderIcon className="w-5 h-5" />
                                </div>
                                Create New Project
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateProject} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Project Name
                                </label>
                                <input
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    placeholder="e.g., Q1 Financial Analysis"
                                    autoFocus
                                    className="block w-full rounded-xl border-2 border-primary-100 dark:border-slate-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:outline-none sm:text-sm py-3 px-4 transition-all duration-200 placeholder-gray-400 hover:border-primary-200 dark:hover:border-primary-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Category
                                </label>
                                <Listbox value={newProject.category} onChange={(val) => setNewProject({ ...newProject, category: val })}>
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-xl border-2 border-primary-100 dark:border-slate-500 bg-white dark:bg-slate-800 py-3 pl-11 pr-10 text-left shadow-sm focus:outline-none focus:border-primary-500 sm:text-sm hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
                                            <span className="block truncate text-gray-900 dark:text-white">{newProject.category}</span>
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
                                                {['General', 'Financial', 'Legal', 'HR', 'Personal'].map((category) => (
                                                    <Listbox.Option
                                                        key={category}
                                                        className={({ active }) =>
                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${active ? 'bg-primary-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                                            }`
                                                        }
                                                        value={category}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-medium text-primary-600 dark:text-primary-400' : 'font-normal'}`}>
                                                                    {category}
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

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    className="block w-full rounded-xl border-2 border-primary-100 dark:border-slate-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:outline-none sm:text-sm min-h-[120px] resize-none p-4 transition-all duration-200 placeholder-gray-400 hover:border-primary-200 dark:hover:border-primary-800"
                                    placeholder="Brief description of the project..."
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 pt-4 mt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!newProject.name.trim()}
                                    icon={<PlusIcon className="w-5 h-5" />}
                                >
                                    Create Project
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rename Project Modal */}
            {isRenameModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
                        onClick={() => setIsRenameModalOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-2xl animate-scale-in overflow-hidden border border-gray-100 dark:border-dark-border">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                                    <PencilIcon className="w-5 h-5" />
                                </div>
                                Rename Project
                            </h2>
                            <button
                                onClick={() => setIsRenameModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRenameSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    Project Name
                                </label>
                                <input
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    placeholder="Enter project name"
                                    autoFocus
                                    className="block w-full rounded-xl border-2 border-primary-100 dark:border-slate-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:outline-none sm:text-sm py-3 px-4 transition-all duration-200 placeholder-gray-400 hover:border-primary-200 dark:hover:border-primary-800"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsRenameModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!renameValue.trim()}
                                    icon={<CheckIcon className="w-5 h-5" />}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}
