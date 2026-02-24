import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="w-full flex flex-col pt-20">
            {/* Hero Section */}
            <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl relative z-10"
                >
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
                        Securing welfare with <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">precision AI.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                        Satark stops organized proxy networks from draining the Ladki Bahin Yojana by cross-referencing documents with automated precise heuristics.
                    </p>
                    <Link
                        to="/apply"
                        className="inline-flex px-10 py-5 bg-orange-500 text-white rounded-full hover:bg-orange-400 font-bold transition-all hover:scale-105 active:scale-95 items-center space-x-3 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
                    >
                        <span className="text-lg uppercase tracking-wider">Start Application</span>
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </motion.div>
            </section>

            {/* The Problem Section */}
            <section id="problem" className="py-24 px-6 md:px-12 lg:px-24 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="h-96 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl flex items-center justify-center p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
                        <span className="text-slate-400 font-medium text-lg relative z-10">Cyber Threat Simulation Active</span>
                    </div>
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Proxy networks are draining the system.
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed font-medium">
                            Organized proxy networks exploit government schemes by bulk-generating spoofed income certificates
                            and routing billions of rupees through proxy bank accounts. Traditional manual verification
                            cannot scale to intercept these coordinated fraud rings before the funds are dispersed.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Solution Section */}
            <section id="solution" className="py-32 px-6 md:px-12 lg:px-24 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tight">The Engine</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {/* Card 1 */}
                        <div className="glass-panel p-10 transform transition hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-4">PAN Graph Inspector</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">Cross-references registered PAN endpoints to identify excessive wealth spikes or direct state treasury overlap prior to welfare disbursement.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="glass-panel p-10 transform transition hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-4">Deterministic Heuristics</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Core logic instantly maps extracted income and identity across simulated databases to spot mismatches and anomalies in milliseconds.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="glass-panel p-10 transform transition hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-white mb-4">NetworkX Graphing</h3>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                In-memory graph engines trace direct connections between seemingly unrelated applications formatting a cluster of matching bank proxy accounts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
