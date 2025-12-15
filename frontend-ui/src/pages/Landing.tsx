import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRightIcon,
    ShieldCheckIcon,
    BoltIcon,
    DocumentTextIcon,
    LockClosedIcon,
    GlobeAltIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LiquidEther from '../components/ui/LiquidEther';
import BlurText from '../components/ui/BlurText';
import BentoCardWrapper from '../components/ui/BentoCardWrapper';
import '../components/ui/BentoCardWrapper.css';
import ChromaGrid from '../components/ui/ChromaGrid';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import GradientText from '../components/ui/GradientText';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export default function Landing() {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-300 selection:bg-primary-500 selection:text-white overflow-x-hidden">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                    {/* Liquid Ether Background */}
                    <div className="absolute inset-0 pointer-events-none">
                        <LiquidEther
                            colors={['#3B82F6', '#8B5CF6', '#06B6D4']}
                            mouseForce={20}
                            cursorSize={100}
                            autoDemo={true}
                            autoSpeed={0.5}
                            autoIntensity={2.2}
                            resolution={0.5}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="text-left"
                            >
                                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm mb-8">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 tracking-wide uppercase">AI Engine v2.0 Live</span>
                                </motion.div>

                                <div className="mb-6">
                                    <div>
                                        <BlurText
                                            text="Verify with"
                                            delay={150}
                                            animateBy="words"
                                            direction="top"
                                            className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                                        />
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                                    >
                                        <GradientText className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]" animationSpeed={5}>
                                            Confidence.
                                        </GradientText>
                                    </motion.div>
                                </div>

                                <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                                    Enterprise-grade AI analysis for contracts, reports, and legal documents. Detect risks, verify sources, and ensure compliance in seconds.
                                </motion.p>

                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                                    <Link to="/signup" className="group relative px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Start Analyzing
                                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                                    </Link>
                                    <Link to="/try" className="px-8 py-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-full font-semibold text-lg hover:from-primary-500/20 hover:to-purple-500/20 transition-all backdrop-blur-sm">
                                        ✨ Try for Free
                                    </Link>
                                </motion.div>

                                <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8 text-gray-400 dark:text-gray-500 grayscale opacity-70">
                                    {/* Placeholder Logos */}
                                    <div className="h-8 w-24 bg-current rounded opacity-20" />
                                    <div className="h-8 w-24 bg-current rounded opacity-20" />
                                    <div className="h-8 w-24 bg-current rounded opacity-20" />
                                    <div className="h-8 w-24 bg-current rounded opacity-20" />
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                className="relative hidden lg:block"
                            >
                                <div className="relative z-10 bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 max-w-md mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    {/* Mock UI Card */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                                <DocumentTextIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="h-2 w-24 bg-gray-200 dark:bg-white/10 rounded mb-1" />
                                                <div className="h-2 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">
                                            98/100
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded" />
                                        <div className="h-2 w-[90%] bg-gray-100 dark:bg-white/5 rounded" />
                                        <div className="h-2 w-[95%] bg-gray-100 dark:bg-white/5 rounded" />
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheckIcon className="w-4 h-4 text-primary-500" />
                                            <span className="text-xs font-semibold text-gray-900 dark:text-white">AI Verdict</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                            The document structure matches verified templates. No anomalies detected in the signature block.
                                        </p>
                                    </div>
                                </div>
                                {/* Decorative Blur Behind */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-3xl blur-3xl opacity-20 -z-10 transform translate-y-10" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Bento Grid Features */}
                <section id="features" className="py-32 bg-gray-50 dark:bg-[#050505] relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Everything you need to <br /><GradientText animationSpeed={5}>verify with confidence.</GradientText></h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Our platform combines advanced OCR, natural language processing, and pattern recognition to deliver bank-grade analysis.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                            {/* Large Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="md:col-span-2"
                            >
                                <BentoCardWrapper
                                    className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-white/10 h-full group"
                                    glowColor="59, 130, 246"
                                    enableTilt={true}
                                    enableParticles={true}
                                >
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div>
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                                <BoltIcon className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">Real-time Analysis</h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                                Get instant feedback on your documents. Our AI processes pages in milliseconds, not minutes.
                                            </p>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-white/5 rounded-xl p-4 mt-8 border border-gray-200 dark:border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-2 flex-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: "100%" }}
                                                        transition={{ duration: 1.5, ease: "circOut" }}
                                                        className="h-full bg-blue-500"
                                                    />
                                                </div>
                                                <span className="text-xs font-mono text-blue-500">COMPLETE</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                </BentoCardWrapper>
                            </motion.div>

                            {/* Tall Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="md:row-span-2"
                            >
                                <BentoCardWrapper
                                    className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-white/10 h-full group"
                                    glowColor="168, 85, 247"
                                    enableTilt={true}
                                    enableParticles={true}
                                >
                                    <div className="relative z-10 h-full flex flex-col">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                            <ShieldCheckIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Trust Scoring</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                                            Our proprietary algorithm assigns a 0-100 trust score based on 50+ signals.
                                        </p>

                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="relative w-40 h-40">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100 dark:text-white/5" />
                                                    <motion.circle
                                                        cx="80" cy="80" r="70"
                                                        stroke="currentColor"
                                                        strokeWidth="10"
                                                        fill="transparent"
                                                        strokeDasharray="440"
                                                        strokeDashoffset="440"
                                                        whileInView={{ strokeDashoffset: 66 }}
                                                        transition={{ duration: 2, ease: "easeOut" }}
                                                        className="text-purple-500"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-4xl font-bold">85</span>
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">Score</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </BentoCardWrapper>
                            </motion.div>

                            {/* Small Card 1 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <BentoCardWrapper
                                    className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-white/10 h-full group"
                                    glowColor="34, 197, 94"
                                    enableTilt={true}
                                    enableParticles={true}
                                >
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform">
                                        <GlobeAltIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Multi-Language</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Support for 30+ languages with native-level understanding.
                                    </p>
                                </BentoCardWrapper>
                            </motion.div>

                            {/* Small Card 2 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <BentoCardWrapper
                                    className="bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-200 dark:border-white/10 h-full group"
                                    glowColor="249, 115, 22"
                                    enableTilt={true}
                                    enableParticles={true}
                                >
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                                        <LockClosedIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Secure by Design</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        End-to-end encryption for all your sensitive data.
                                    </p>
                                </BentoCardWrapper>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* How it Works Section */}
                <section id="how-it-works" className="py-24 bg-white dark:bg-[#0A0A0A]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4"><GradientText animationSpeed={5}>How it Works</GradientText></h2>
                            <p className="text-gray-600 dark:text-gray-400">Three simple steps to verify any document.</p>
                        </div>

                        {/* Steps with Timeline */}
                        <div className="relative">
                            {/* Animated Timeline Connector - Hidden on mobile */}
                            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0">
                                <div className="max-w-4xl mx-auto relative h-full">
                                    {/* Background line */}
                                    <div className="absolute inset-0 bg-gray-200 dark:bg-white/10 rounded-full" />
                                    {/* Animated gradient line */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Step Cards */}
                            <div className="grid md:grid-cols-3 gap-8 relative z-10">
                                {[
                                    { step: 1, title: "Upload", desc: "Drag and drop your PDF or image file.", color: "59, 130, 246", icon: "📄" },
                                    { step: 2, title: "Analyze", desc: "Our AI scans for anomalies and patterns.", color: "168, 85, 247", icon: "🔍" },
                                    { step: 3, title: "Verify", desc: "Get a detailed trust score and report.", color: "34, 197, 94", icon: "✅" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2, duration: 0.5 }}
                                    >
                                        <BentoCardWrapper
                                            className="relative p-8 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 h-full"
                                            glowColor={item.color}
                                            enableTilt={true}
                                            enableParticles={true}
                                            particleCount={6}
                                        >
                                            {/* Step Number Circle */}
                                            <div className="flex justify-center mb-6">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    whileInView={{ scale: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.2 + 0.3, type: 'spring', stiffness: 200 }}
                                                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold"
                                                    style={{
                                                        background: `linear-gradient(135deg, rgba(${item.color}, 0.2), rgba(${item.color}, 0.1))`,
                                                        border: `2px solid rgba(${item.color}, 0.5)`
                                                    }}
                                                >
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: 1 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: i * 0.2 + 0.5 }}
                                                        style={{ color: `rgba(${item.color}, 1)` }}
                                                    >
                                                        0{item.step}
                                                    </motion.span>
                                                </motion.div>
                                            </div>

                                            {/* Icon */}
                                            <div className="text-4xl text-center mb-4">{item.icon}</div>

                                            {/* Content */}
                                            <h3 className="text-xl font-bold mb-2 text-center">{item.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-center">{item.desc}</p>
                                        </BentoCardWrapper>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 bg-gray-50 dark:bg-[#050505]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4"><GradientText animationSpeed={5}>Simple Pricing</GradientText></h2>
                            <p className="text-gray-600 dark:text-gray-400">Start for free, upgrade for power.</p>
                        </div>
                        <ChromaGrid
                            variant="pricing"
                            columns={3}
                            radius={350}
                            items={[
                                {
                                    title: 'Starter',
                                    price: '$0',
                                    period: 'mo',
                                    features: ['5 Documents/mo', 'Basic Analysis', 'Email Support', 'Standard Reports'],
                                    borderColor: '#6B7280',
                                    gradient: 'linear-gradient(145deg, #1a1a2e, #0a0a0a)',
                                    buttonText: 'Get Started Free',
                                    buttonType: 'secondary'
                                },
                                {
                                    title: 'Pro',
                                    price: '$29',
                                    period: 'mo',
                                    features: ['50 Documents/mo', 'Deep Analysis', 'Priority Support', 'Advanced Reports', 'API Access'],
                                    borderColor: '#3B82F6',
                                    gradient: 'linear-gradient(145deg, #1e3a5f, #0a0a0a)',
                                    buttonText: 'Start Pro Trial',
                                    buttonType: 'primary',
                                    popular: true
                                },
                                {
                                    title: 'Enterprise',
                                    price: 'Custom',
                                    features: ['Unlimited Documents', 'Full API Access', 'Dedicated Manager', 'Custom Integrations', 'SLA Guarantee'],
                                    borderColor: '#8B5CF6',
                                    gradient: 'linear-gradient(145deg, #2d1b4e, #0a0a0a)',
                                    buttonText: 'Contact Sales',
                                    buttonType: 'secondary'
                                }
                            ]}
                        />
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-24 border-y border-gray-100 dark:border-white/5 bg-white dark:bg-[#0A0A0A]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Documents Analyzed", value: 10, suffix: "M+", color: "59, 130, 246" },
                                { label: "Accuracy Rate", value: 99.9, suffix: "%", color: "34, 197, 94" },
                                { label: "Enterprise Users", value: 500, suffix: "+", color: "168, 85, 247" },
                                { label: "Trust Score", value: 4.9, suffix: "/5", color: "249, 115, 22" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                >
                                    <BentoCardWrapper
                                        className="p-6 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 text-center h-full"
                                        glowColor={stat.color}
                                        enableTilt={true}
                                        enableParticles={false}
                                    >
                                        <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: `rgba(${stat.color}, 1)` }}>
                                            <AnimatedCounter
                                                value={stat.value}
                                                suffix={stat.suffix}
                                                duration={2}
                                            />
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                                            {stat.label}
                                        </div>
                                    </BentoCardWrapper>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 relative overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gray-900 dark:bg-black">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/40 via-gray-900 to-gray-900 dark:from-primary-900/20 dark:via-black dark:to-black" />

                        {/* Floating Orbs */}
                        <motion.div
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -50, 0],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                x: [0, -80, 0],
                                y: [0, 60, 0],
                                scale: [1, 1.3, 1]
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                x: [0, 50, 0],
                                y: [0, -30, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                            className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl"
                        />
                    </div>

                    <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                        {/* Animated Headline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-8"
                        >
                            <BlurText
                                text="Ready to secure your workflow?"
                                className="text-4xl md:text-6xl font-bold text-white tracking-tight"
                                delay={100}
                                animateBy="words"
                                direction="top"
                            />
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
                        >
                            Join thousands of professionals who trust TrustAI for their document verification needs.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            {/* Primary CTA with Glow */}
                            <Link
                                to="/signup"
                                className="relative w-full sm:w-auto group"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
                                <div className="relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
                                    Get Started Now
                                </div>
                            </Link>

                            {/* Secondary CTA */}
                            <Link
                                to="/contact"
                                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all"
                            >
                                Contact Sales
                            </Link>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                No credit card required
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                14-day free trial
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Cancel anytime
                            </span>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
