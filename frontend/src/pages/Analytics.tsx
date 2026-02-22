import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShieldAlert, Fingerprint, IndianRupee } from 'lucide-react';

const Analytics = () => {
    const [stats, setStats] = useState({ real_applications: 0, fake_applications: 0, funds_saved: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:8000/api/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch stats", err);
                setLoading(false);
            });
    }, []);

    const donutData = [
        { name: 'Legitimate Apps', value: stats.real_applications },
        { name: 'Spoofed / Flagged', value: stats.fake_applications }
    ];

    const COLORS = ['#4ade80', '#f87171']; // Green and Red

    const barData = [
        { name: 'Today', Legitimate: stats.real_applications, Spoofed: stats.fake_applications }
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-2">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 text-center">
                <h1 className="text-4xl font-bold mb-4 text-slate-900">Live Threat Analytics</h1>
                <p className="text-slate-600 font-medium">Monitoring incoming traffic and AI identification rates.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-6 flex flex-col items-center justify-center">
                    <Fingerprint className="w-10 h-10 text-green-500 mb-2" />
                    <p className="text-slate-700 font-bold text-sm uppercase tracking-wider">Legitimate</p>
                    <h2 className="text-4xl font-bold text-slate-900">{loading ? '...' : stats.real_applications}</h2>
                </motion.div>

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-6 flex flex-col items-center justify-center">
                    <ShieldAlert className="w-10 h-10 text-red-500 mb-2" />
                    <p className="text-slate-700 font-bold text-sm uppercase tracking-wider">Flagged Threats</p>
                    <h2 className="text-4xl font-bold text-red-500">{loading ? '...' : stats.fake_applications}</h2>
                </motion.div>

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-panel p-6 flex flex-col items-center justify-center border-emerald-500/30">
                    <IndianRupee className="w-10 h-10 text-emerald-500 mb-2" />
                    <p className="text-slate-700 font-bold text-sm uppercase tracking-wider">Public Funds Saved</p>
                    <h2 className="text-4xl font-bold text-emerald-600">
                        {loading ? '...' : `₹${(stats.funds_saved / 10000000).toFixed(2)} Cr`}
                    </h2>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-80">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4 text-center text-slate-900">Applications Ratio</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {donutData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4 text-center text-slate-900">Traffic Volume</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                            <Legend />
                            <Bar dataKey="Legitimate" fill="#4ade80" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Spoofed" fill="#f87171" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
