import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center text-center max-w-4xl mx-auto relative">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="mb-8 p-6 rounded-full glass-panel inline-block"
            >
                <ShieldCheck className="w-24 h-24 text-blue-400" />
            </motion.div>

            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-800"
            >
                Securing the Nation's Welfare with AI.
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl text-slate-700 mb-10 max-w-2xl leading-relaxed font-medium"
            >
                An enterprise-grade, multi-agent cross-verification engine built to detect organized fraud and syndicate rings in Indian government schemes.
            </motion.p>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <Link
                    to="/apply"
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                    <span>Apply Now</span>
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                    to="/dashboard"
                    className="px-8 py-4 glass-panel text-slate-800 rounded-xl font-bold transition-all hover:bg-white/40"
                >
                    View Admin Dashboard
                </Link>
            </motion.div>
        </div>
    );
};

export default Home;
