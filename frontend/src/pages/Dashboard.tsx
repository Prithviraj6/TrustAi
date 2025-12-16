import { useState, useEffect, useMemo } from 'react';
import {
    ArrowTrendingUpIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    ClockIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    EllipsisHorizontalIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { projects: contextProjects, isLoading: loading, refreshProjects } = useProjects();

    // Sort projects by date (most recent first) using useMemo
    const projects = useMemo(() => {
        return [...contextProjects].sort((a: any, b: any) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
    }, [contextProjects]);

    const [stats, setStats] = useState([
        { name: 'Total Analyses', value: '0', change: '+0%', changeType: 'increase', icon: DocumentTextIcon },
        { name: 'Avg Trust Score', value: '0', change: '+0%', changeType: 'increase', icon: ShieldCheckIcon },
        { name: 'Risky Docs', value: '0', change: '0%', changeType: 'decrease', icon: ArrowTrendingUpIcon },
        { name: 'Processing Time', value: '1.2s', change: '-0.3s', changeType: 'increase', icon: ClockIcon },
    ]);

    // Chart State
    const [riskData, setRiskData] = useState([
        { name: 'Trustworthy', value: 0, color: '#10B981' },
        { name: 'Neutral', value: 0, color: '#F59E0B' },
        { name: 'Risky', value: 0, color: '#EF4444' },
    ]);

    const [trendData, setTrendData] = useState<any[]>([]);

    const calculateStats = (data: any[]) => {
        const total = data.length;
        const totalScore = data.reduce((acc, curr) => acc + (curr.trustScore || 0), 0);
        const avgScore = total > 0 ? (totalScore / total).toFixed(1) : '0';
        const riskyCount = data.filter(p => (p.trustScore || 0) < 50 && (p.trustScore || 0) > 0).length;

        setStats([
            { name: 'Total Analyses', value: total.toString(), change: '+0%', changeType: 'increase', icon: DocumentTextIcon },
            { name: 'Avg Trust Score', value: avgScore, change: '+0%', changeType: 'increase', icon: ShieldCheckIcon },
            { name: 'Risky Docs', value: riskyCount.toString(), change: '0%', changeType: 'decrease', icon: ArrowTrendingUpIcon },
            { name: 'Processing Time', value: '1.2s', change: '-0.3s', changeType: 'increase', icon: ClockIcon },
        ]);
    };

    const calculateCharts = (data: any[]) => {
        // 1. Risk Distribution
        let trustworthy = 0;
        let neutral = 0;
        let risky = 0;

        data.forEach(p => {
            const score = p.trustScore || 0;
            if (score === 0) return; // Skip pending/unprocessed
            if (score >= 80) trustworthy++;
            else if (score >= 50) neutral++;
            else risky++;
        });

        setRiskData([
            { name: 'Trustworthy', value: trustworthy, color: '#10B981' },
            { name: 'Neutral', value: neutral, color: '#F59E0B' },
            { name: 'Risky', value: risky, color: '#EF4444' },
        ]);

        // 2. Trend Data (Last 7 Days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0]; // YYYY-MM-DD
        });

        const trendMap = new Map<string, { total: number, count: number }>();
        last7Days.forEach(date => trendMap.set(date, { total: 0, count: 0 }));

        data.forEach(p => {
            if (!p.created) return;
            const date = new Date(p.created).toISOString().split('T')[0];
            if (trendMap.has(date)) {
                const entry = trendMap.get(date)!;
                entry.total += (p.trustScore || 0);
                entry.count += 1;
            }
        });

        const newTrendData = last7Days.map(date => {
            const entry = trendMap.get(date)!;
            const avg = entry.count > 0 ? Math.round(entry.total / entry.count) : 0;
            // Format date for display (e.g., "Mon", "Tue" or "MM/DD")
            const displayDate = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return { name: displayDate, score: avg };
        });

        setTrendData(newTrendData);
    };

    // Calculate stats and charts when projects change
    useEffect(() => {
        if (projects.length > 0) {
            calculateStats(projects);
            calculateCharts(projects);
        }
    }, [projects]);

    const getStatus = (score: number) => {
        if (score === 0) return 'Pending';
        if (score >= 80) return 'Trustworthy';
        if (score >= 50) return 'Neutral';
        return 'Risky';
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Trustworthy': return 'success';
            case 'Risky': return 'error';
            case 'Pending': return 'default';
            default: return 'warning';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your document trust analysis.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={refreshProjects}
                        className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        Refresh Data
                    </button>
                    <Link
                        to="/dashboard/projects/new"
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        New Analysis
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card
                        key={stat.name}
                        className="p-6 hover:-translate-y-1 transition-transform duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                <stat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            {stat.changeType === 'increase' ? (
                                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={`${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'} font-medium`}>{stat.change}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trust Score Trend */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trust Score Trend</h3>
                        <select className="text-sm border-gray-200 dark:border-slate-700 rounded-lg bg-transparent text-gray-500 dark:text-gray-400 focus:border-transparent focus:ring-0 focus:outline-none cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: '#111827' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#4F46E5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Risk Distribution */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Risk Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={riskData} layout="vertical" margin={{ left: 0, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={80}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Analyses Table */}
            <Card className="overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Analyses</h3>
                    <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Project Name</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Trust Score</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading projects...
                                    </td>
                                </tr>
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No projects found. Create one to get started!
                                    </td>
                                </tr>
                            ) : (
                                projects.map((item) => {
                                    const score = item.trustScore || 0;
                                    const status = getStatus(score);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                <Link to={`/dashboard/projects/${item.id}`} className="flex items-center gap-3 hover:text-primary-600">
                                                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                                                        <DocumentTextIcon className="w-5 h-5" />
                                                    </div>
                                                    {item.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {new Date(item.created).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusVariant(status) as any} size="sm">
                                                    {status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{score}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/dashboard/projects/${item.id}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                    <EllipsisHorizontalIcon className="w-5 h-5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

export default Dashboard;
