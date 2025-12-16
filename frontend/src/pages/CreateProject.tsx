import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLoading } from '../context/LoadingContext';
import { projectsService } from '../services/projects';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

export default function CreateProject() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isLoading, showLoading, hideLoading } = useLoading();

    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            showToast('error', 'Project title is required');
            return;
        }

        showLoading('Creating project...');

        try {
            const newProject = await projectsService.createProject(formData);
            showToast('success', 'Project created successfully!');
            navigate(`/dashboard/projects/${newProject._id}`);
        } catch (error: any) {
            console.error('Create project error:', error);
            showToast('error', error.response?.data?.detail || 'Failed to create project');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Analysis</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a new trust analysis project.</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-900/30 mb-6">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                            <DocumentPlusIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Project Details</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enter the basic information for your new analysis project.</p>
                        </div>
                    </div>

                    <Input
                        label="Project Title"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Q3 Financial Audit"
                        required
                        className="text-lg"
                    />

                    <div className="space-y-1">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                            placeholder="Add some notes about this project..."
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="gradient"
                            isLoading={isLoading}
                            className="px-8"
                        >
                            Create Project
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
