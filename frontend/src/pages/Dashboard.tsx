import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Application {
    aadhaar_id: string;
    name: string;
    stated_income: number;
    bank_account: string;
    rto_vehicle_reg_number: string;
    fraud_probability_score: number;
    flag_reason: string;
}

const Dashboard = () => {
    const [data, setData] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const apps = await res.json();
            setData(apps);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Polling for fast UI updates
        return () => clearInterval(interval);
    }, []);

    const getSeverity = (score: number) => {
        if (score >= 80) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'CRITICAL', icon: AlertCircle };
        if (score >= 40) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'WARNING', icon: AlertCircle };
        return { bg: 'bg-green-500/5', border: 'border-white/10', text: 'text-green-400', label: 'CLEAN', icon: CheckCircle2 };
    };

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Enhanced AI Dashboard</h1>
                    <p className="text-slate-600 font-medium">Reviewing prioritized flags from the Nexus Multi-Agent Engine.</p>
                </div>
                <div className="glass-panel px-4 py-2 flex items-center space-x-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search ID..." className="bg-transparent border-none outline-none text-sm text-slate-900 font-medium placeholder-slate-500 w-32" />
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/40 text-sm font-bold text-slate-700 uppercase tracking-wider bg-white/40">
                    <div className="col-span-1">Risk</div>
                    <div className="col-span-2">Aadhaar ID</div>
                    <div className="col-span-2">Name</div>
                    <div className="col-span-2">Stated Income</div>
                    <div className="col-span-2">Bank / Proxy</div>
                    <div className="col-span-2">AI Score</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                <div className="divide-y divide-white/10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {loading && data.length === 0 ? (
                        <div className="p-8 text-center text-slate-600 font-medium animate-pulse">Scanning Data Streams...</div>
                    ) : data.length === 0 ? (
                        <div className="p-8 text-center text-slate-600 font-medium">Database Empty.</div>
                    ) : (
                        data.map((app) => {
                            const severity = getSeverity(app.fraud_probability_score);
                            const SIcon = severity.icon;
                            const isExpanded = expandedRow === app.aadhaar_id;

                            return (
                                <div key={app.aadhaar_id} className={`transition-colors duration-200 ${severity.bg} ${isExpanded ? 'bg-white/40' : 'hover:bg-white/40'}`}>
                                    <div
                                        className="grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer items-center"
                                        onClick={() => setExpandedRow(isExpanded ? null : app.aadhaar_id)}
                                    >
                                        <div className="col-span-1">
                                            <SIcon className={`w-5 h-5 ${severity.text}`} />
                                        </div>
                                        <div className="col-span-2 font-mono text-sm tracking-widest text-slate-600 font-semibold">{app.aadhaar_id}</div>
                                        <div className="col-span-2 font-bold text-slate-900 line-clamp-1">{app.name}</div>
                                        <div className="col-span-2 text-slate-700 font-semibold font-mono">₹{app.stated_income.toLocaleString()}</div>
                                        <div className="col-span-2 text-slate-600 font-medium font-mono text-sm truncate">{app.bank_account}</div>
                                        <div className="col-span-2 flex items-center space-x-3">
                                            <div className="flex-1 h-2 bg-slate-300 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${app.fraud_probability_score}%` }}
                                                    className={`h-full ${app.fraud_probability_score >= 80 ? 'bg-red-500' : app.fraud_probability_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                />
                                            </div>
                                            <span className={`font-bold ${severity.text}`}>{app.fraud_probability_score}</span>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className={`mx-6 mb-4 mt-2 p-4 rounded-lg bg-white/50 backdrop-blur-md border ${severity.border}`}>
                                                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">AI Execution Trace</h4>
                                                    {app.flag_reason ? (
                                                        <ul className="list-disc pl-5 space-y-2">
                                                            {app.flag_reason.split(' | ').filter(f => f).map((reason, idx) => (
                                                                <li key={idx} className={`text-sm ${severity.text}`}>{reason.trim()}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-green-600 font-medium">No anomalies detected in document analysis, graph tracing, or RTO cross-verification.</p>
                                                    )}
                                                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-300">
                                                        <div><span className="text-xs text-slate-500 font-bold">Documented Vehicle:</span><br /><span className="text-sm font-mono text-slate-900 font-semibold">{app.rto_vehicle_reg_number}</span></div>
                                                        <div><span className="text-xs text-slate-500 font-bold">Syndicate Score Output:</span><br /><span className="text-sm font-mono text-slate-900 font-semibold">{app.fraud_probability_score > 50 ? 'Active Cluster Detected' : 'Isolated Network'}</span></div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
