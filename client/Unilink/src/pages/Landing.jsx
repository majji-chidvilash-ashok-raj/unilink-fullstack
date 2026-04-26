import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  GraduationCap, ArrowRight, Users, MessageSquare, Calendar,
  Sparkles, Shield, Globe, Zap, ChevronRight, Briefcase, Star,
  BookOpen
} from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground/ParticleBackground';
import GlowCard from '../components/GlowCard/GlowCard';
import AnimatedCounter from '../components/AnimatedCounter/AnimatedCounter';
import TypewriterText from '../components/TypewriterText/TypewriterText';

function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);

  const features = [
    { icon: Users, title: 'Smart Profiles', desc: 'Showcase skills, achievements, and projects. AI-matched connections find your perfect study partners.', color: 'from-blue-500 to-cyan-400', tag: 'Networking' },
    { icon: MessageSquare, title: 'Real-time Chat', desc: 'Instant messaging with rich media sharing, group chats, and smart notification management.', color: 'from-violet-500 to-purple-400', tag: 'Communication' },
    { icon: Calendar, title: 'Events Hub', desc: 'Discover hackathons, workshops, and clubs. One-click registration with smart reminders.', color: 'from-amber-500 to-orange-400', tag: 'Discovery' },
    { icon: Sparkles, title: 'AI-Curated Feed', desc: 'Intelligent content feed that learns your interests. Surface the most relevant posts and opportunities.', color: 'from-emerald-500 to-teal-400', tag: 'Intelligence' },
    { icon: Briefcase, title: 'Career Launch', desc: 'Job listings, internships, and resume builder. Get discovered by top companies recruiting on campus.', color: 'from-rose-500 to-pink-400', tag: 'Careers' },
    { icon: BookOpen, title: 'Study Groups', desc: 'Form study groups, share resources, and collaborate on projects with built-in productivity tools.', color: 'from-sky-500 to-blue-400', tag: 'Collaboration' },
  ];

  const stats = [
    { value: 50000, suffix: '+', label: 'Active Students' },
    { value: 200, suffix: '+', label: 'Universities' },
    { value: 10000, suffix: '+', label: 'Daily Connections' },
    { value: 500, suffix: '+', label: 'Monthly Events' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'CS Student, IIT Delhi', text: 'UniLink completely transformed how I network. Found my hackathon team and landed an internship through connections here.', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random' },
    { name: 'Arjun Patel', role: 'Design, NID', text: "The UI is stunning and the community is incredibly active. Best student platform I've ever used.", avatar: 'https://ui-avatars.com/api/?name=Arjun+Patel&background=random' },
    { name: 'Sarah Chen', role: 'MBA, ISB', text: 'From study groups to startup co-founders — UniLink made it all possible. Essential for every student.', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random' },
  ];

  return (
    <div className="min-h-screen bg-bg overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="glass rounded-2xl px-6 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div whileHover={{ scale: 1.1, rotateY: 15 }}
                className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <GraduationCap size={18} className="text-white" />
              </motion.div>
              <span className="text-lg font-bold gradient-text font-display tracking-tight">UniLink</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-1.5 rounded-xl text-sm font-medium text-text-muted hover:text-text transition-all">
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/signup" className="px-5 py-1.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity">
                  Get Started
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/8 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[200px]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center px-6 max-w-6xl mx-auto pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-primary-light mb-10">
            <Sparkles size={14} className="animate-pulse" />
            <span className="font-medium">The future of campus networking</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.5rem,8vw,7rem)] font-black leading-[0.95] tracking-[-0.04em] font-display mb-8">
            Connect with
            <span className="gradient-text block glow-text mt-1">
              <TypewriterText />
            </span>
            <span className="block mt-1">Like Never Before</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed mb-12">
            The all-in-one platform where university students build their network,
            discover opportunities, and launch their careers.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/signup"
                className="px-10 py-4 rounded-2xl gradient-primary text-white font-semibold text-lg shadow-xl glow flex items-center gap-3 hover:opacity-90 transition-opacity">
                Start for Free <ArrowRight size={20} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login"
                className="px-10 py-4 rounded-2xl glass-card text-text font-semibold text-lg hover:bg-surface-light/20 transition-all flex items-center gap-3">
                Sign In <ChevronRight size={20} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2 }}
            className="mt-20">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-text-muted/30 mx-auto flex items-start justify-center pt-2">
              <div className="w-1 h-2 rounded-full bg-text-muted/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-surface/30 to-bg" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-black gradient-text font-display tracking-tight">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.5} />
                  </p>
                  <p className="text-sm text-text-muted mt-2 font-medium">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap relative">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-20">
            <p className="text-primary-light text-sm font-semibold tracking-widest uppercase mb-4">Platform</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] font-display leading-tight">
              Everything you need<br />
              <span className="gradient-text">to thrive on campus</span>
            </h2>
            <p className="mt-6 text-text-muted text-lg max-w-xl mx-auto">
              From finding study partners to launching your career —
              one platform, infinite possibilities.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.08}
                className={i === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}>
                <GlowCard className="rounded-3xl h-full">
                  <div className={`rounded-3xl bg-surface border border-border p-8 group h-full hover:border-primary/15 transition-all duration-500 ${
                    i === 0 ? 'lg:flex lg:items-center lg:gap-10' : ''
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 ${
                      i === 0 ? 'lg:mb-0 lg:w-20 lg:h-20 lg:rounded-3xl' : ''
                    } group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 shrink-0`}>
                      <feature.icon size={i === 0 ? 28 : 24} className="text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted/60 mb-2 block">{feature.tag}</span>
                      <h3 className="font-bold text-xl mb-2 font-display tracking-tight">{feature.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal className="text-center mb-16">
            <p className="text-primary-light text-sm font-semibold tracking-widest uppercase mb-4">Testimonials</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] font-display">
              Loved by <span className="gradient-text">students</span> everywhere
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.12}>
                <GlowCard className="rounded-3xl h-full">
                  <div className="rounded-3xl bg-surface border border-border p-8 h-full flex flex-col">
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed flex-1 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
                      <img src={t.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-text-muted">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <GlowCard className="rounded-[2rem]" glowColor="rgba(99, 102, 241, 0.12)">
              <div className="rounded-[2rem] bg-surface border border-border relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
                  <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-secondary/8 blur-[100px]" />
                </div>
                <div className="relative z-10 p-12 md:p-20 text-center">
                  <div className="flex items-center justify-center gap-4 mb-8">
                    {[
                      { icon: Shield, rot: 15 },
                      { icon: Globe, rot: -15 },
                      { icon: Zap, rot: 15 },
                    ].map(({ icon: I, rot }, idx) => (
                      <motion.div key={idx} whileHover={{ scale: 1.2, rotateY: rot }}
                        className="p-4 rounded-2xl glass-card cursor-pointer">
                        <I size={28} className="text-primary-light" />
                      </motion.div>
                    ))}
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] font-display mb-5">
                    Ready to transform<br />
                    <span className="gradient-text">your campus experience?</span>
                  </h2>
                  <p className="text-text-muted max-w-lg mx-auto mb-10 text-lg">
                    Join thousands of students already building their future on UniLink. Free forever.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/signup"
                      className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl gradient-primary text-white font-semibold text-lg shadow-xl glow hover:opacity-90 transition-opacity">
                      Get Started Free <ArrowRight size={20} />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </GlowCard>
          </ScrollReveal>
        </div>
      </section>

      <footer className="py-10 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold gradient-text font-display tracking-tight">UniLink</span>
          </div>
          <p className="text-sm text-text-muted">© 2026 UniLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}