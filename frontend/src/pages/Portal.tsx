import { useState, SyntheticEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const Portal = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        const form = e.currentTarget;
        const formData = new FormData();

        const payload = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            aadhaar_id: (form.elements.namedItem('aadhaar_id') as HTMLInputElement).value,
            stated_income: parseFloat((form.elements.namedItem('stated_income') as HTMLInputElement).value),
            bank_account: (form.elements.namedItem('bank_account') as HTMLInputElement).value,
            rto_vehicle_reg_number: (form.elements.namedItem('rto_vehicle_reg_number') as HTMLInputElement).value || "None"
        };

        formData.append('payload', JSON.stringify(payload));

        const fileInput = form.elements.namedItem('income_certificate') as HTMLInputElement;
        if (fileInput.files?.length) {
            formData.append('income_certificate', fileInput.files[0]);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/apply', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                setStatus('success');
                setMsg('Application submitted successfully. Under verification.');
                form.reset();
            } else {
                setStatus('error');
                setMsg(result.detail || 'Failed to submit application.');
            }
        } catch {
            setStatus('error');
            setMsg('Network error. Cannot reach backend API.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-8">
                <h2 className="text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">
                    Citizen Scheme Application
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Full Name</label>
                        <input type="text" name="name" required className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="John Doe" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Aadhaar ID</label>
                        <input type="text" name="aadhaar_id" required className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="1234-5678-9012" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Stated Annual Income (INR)</label>
                        <input type="number" name="stated_income" required className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="45000" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Bank Account</label>
                        <input type="text" name="bank_account" required className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="000123456789" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Vehicle Registration (If Any)</label>
                        <input type="text" name="rto_vehicle_reg_number" className="w-full bg-white/40 border border-white/40 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="MH-XX-AB-XXXX" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Upload Income Certificate (Image)</label>
                        <div className="relative border-2 border-dashed border-slate-400 rounded-lg px-4 py-6 text-center hover:bg-white/40 transition-colors cursor-none">
                            <input type="file" name="income_certificate" accept="image/*" required className="absolute inset-0 w-full h-full opacity-0 cursor-none" />
                            <Upload className="mx-auto w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-sm text-slate-600 font-medium">Click or drag image to upload certificate</p>
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span>Submit for Verification</span>
                        )}
                    </button>
                </form>

                {status !== 'idle' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${status === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                        {status === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                        <p className={`text-sm font-bold ${status === 'success' ? 'text-green-800' : 'text-red-800'}`}>{msg}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Portal;
