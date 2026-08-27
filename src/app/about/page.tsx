'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  HardHat,
  Target,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  ArrowRight,
  Building2,
  TrendingUp,
  Award,
  ChevronDown,
} from 'lucide-react';

export default function AboutPage() {
  const [openDisclaimer, setOpenDisclaimer] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white font-sans overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0f1a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <HardHat size={16} className="text-black" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">KARTAA OS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#motivation" className="hover:text-white transition-colors">Motivation</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            <a href="#disclaimer" className="hover:text-white transition-colors">Disclaimer</a>
          </nav>
          <Link
            href="/sign-up-login-screen"
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors"
          >
            Sign In <ArrowRight size={14} />
          </Link>
        </div>
      </header>
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium mb-6">
            <Building2 size={12} />
            Construction Intelligence Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Building India's
            <span className="block text-amber-400">Construction Future</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            KARTAA OS is a purpose-built platform to bring data-driven precision, accountability, and efficiency to India's infrastructure and construction sector.
          </p>
        </div>
      </section>
      {/* Stats bar */}
      <div className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '16+', label: 'Years of Field Experience' },
            { value: '₹1000Cr+', label: 'Projects Managed' },
            { value: '50+', label: 'Projects Delivered' },
            { value: '100%', label: 'Commitment to Quality' },
          ]?.map((stat) => (
            <div key={stat?.label} className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-1">{stat?.value}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{stat?.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* About Us */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Founder card */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 blur-sm" />
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-amber-400">PM</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Priyankar Mohanty</h3>
                    <p className="text-amber-400 text-sm font-medium mt-0.5">Founder & Civil Construction Engineer</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Award size={13} className="text-white/40" />
                      <span className="text-xs text-white/40">16+ Years of Experience</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-white/60 leading-relaxed">
                  <p>
                    With over <span className="text-white font-medium">16 years of hands-on experience</span> in civil construction engineering, Priyankar Mohanty has led and delivered multiple large-scale infrastructure projects across India.
                  </p>
                  <p>
                    His portfolio spans projects of varied valuations — from <span className="text-amber-400 font-medium">₹20 Crore</span> to <span className="text-amber-400 font-medium">₹1000 Crore</span> — covering highways, industrial facilities, and urban infrastructure. He has managed multi-disciplinary teams, complex procurement cycles, and high-stakes project timelines.
                  </p>
                  <p>
                    This deep field experience is the foundation of KARTAA OS — every feature is built from real-world construction challenges, not assumptions.
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                  {[
                    { icon: <Building2 size={14} />, label: 'Infrastructure' },
                    { icon: <TrendingUp size={14} />, label: 'Project Mgmt' },
                    { icon: <Award size={14} />, label: 'Quality Assurance' },
                  ]?.map((tag) => (
                    <div key={tag?.label} className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-amber-400">{tag?.icon}</span>
                      <span className="text-2xs text-white/40 text-center leading-tight">{tag?.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: About text */}
            <div>
              <div className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-3">About Us</div>
              <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                Built by Engineers,<br />
                <span className="text-white/50">for Engineers</span>
              </h2>
              <div className="space-y-4 text-white/55 leading-relaxed">
                <p>
                  KARTAA OS was conceived from the ground up by a practitioner who has spent over a decade and a half on construction sites, in project offices, and in boardrooms — understanding the real friction points that slow India's infrastructure delivery.
                </p>
                <p>
                  The platform addresses the core challenges of project monitoring, BOQ management, progress tracking, and accountability — bringing together satellite intelligence, GIS mapping, and real-time data into a single unified operating system for construction projects.
                </p>
                <p>
                  Our mission is simple: give every project manager, site engineer, and client the visibility and tools they need to deliver projects on time, within budget, and to specification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Motivation */}
      <section id="motivation" className="py-24 px-6 bg-white/[0.015] border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-3">Our Motivation</div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Why KARTAA OS Exists
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Large card */}
            <div className="md:col-span-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-8 flex flex-col justify-between">
              <div>
                <Target size={32} className="text-amber-400 mb-5" />
                <h3 className="text-2xl font-bold text-white mb-4 leading-snug">
                  Making Indian Construction Efficient & World-Class
                </h3>
                <p className="text-white/55 leading-relaxed text-sm">
                  India's construction industry is one of the largest in the world, yet it continues to lag behind well-developed nations in terms of efficiency, transparency, and technology adoption. Projects face chronic delays, cost overruns, and accountability gaps — not due to lack of talent, but due to lack of the right tools.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-amber-500/20">
                <p className="text-amber-300 font-medium text-sm italic">
                  "Our motivation is to make the Indian construction industry as efficient and capable as the best in the world — through technology, data, and accountability."
                </p>
                <p className="text-white/40 text-xs mt-2">— Priyankar Mohanty, Founder</p>
              </div>
            </div>

            {/* Right column */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {[
                {
                  title: 'Close the Global Gap',
                  desc: 'Bring Indian construction practices at par with Germany, Japan, and Singapore through digital project management.',
                },
                {
                  title: 'Eliminate Inefficiencies',
                  desc: 'Reduce project delays and cost overruns through real-time monitoring, AI-driven insights, and structured workflows.',
                },
                {
                  title: 'Empower Field Teams',
                  desc: 'Give site engineers and project managers tools that actually work in the field — offline-capable, intuitive, and built for Indian conditions.',
                },
              ]?.map((item) => (
                <div key={item?.title} className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <h4 className="text-sm font-semibold text-white mb-2">{item?.title}</h4>
                  <p className="text-xs text-white/45 leading-relaxed">{item?.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Contact Us */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-3">Get In Touch</div>
            <h2 className="text-4xl font-bold text-white">Contact Us</h2>
            <p className="text-white/40 mt-3 text-sm max-w-md mx-auto">
              Have questions about KARTAA OS or want to explore how it can transform your project operations?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: <Mail size={20} />,
                label: 'Email',
                value: 'contact@kartaaos.in',
                sub: 'We respond within 24 hours',
              },
              {
                icon: <Phone size={20} />,
                label: 'Phone',
                value: '+91 98XXX XXXXX',
                sub: 'Mon–Sat, 9 AM – 6 PM IST',
              },
              {
                icon: <MapPin size={20} />,
                label: 'Location',
                value: 'India',
                sub: 'Serving pan-India projects',
              },
            ]?.map((item) => (
              <div key={item?.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center hover:border-amber-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                  {item?.icon}
                </div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{item?.label}</div>
                <div className="text-sm font-medium text-white mb-1">{item?.value}</div>
                <div className="text-xs text-white/30">{item?.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Disclaimer */}
      <section id="disclaimer" className="py-16 px-6 border-t border-white/10 bg-white/[0.015]">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setOpenDisclaimer(!openDisclaimer)}
            className="w-full flex items-center justify-between p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
              <span className="font-semibold text-white text-sm">Disclaimer</span>
            </div>
            <ChevronDown
              size={16}
              className={`text-white/40 transition-transform duration-200 ${openDisclaimer ? 'rotate-180' : ''}`}
            />
          </button>

          {openDisclaimer && (
            <div className="mt-2 p-6 rounded-xl border border-white/10 bg-white/[0.02] text-sm text-white/50 leading-relaxed space-y-3">
              <p>
                <span className="text-white font-medium">General Information:</span> The information provided on this platform and website is for general informational purposes only. While we strive to keep the information accurate and up to date, KARTAA OS makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information.
              </p>
              <p>
                <span className="text-white font-medium">Project Data:</span> All project data, metrics, and reports generated through KARTAA OS are based on inputs provided by users. KARTAA OS is not responsible for decisions made based on data entered into or generated by the platform. Users are advised to independently verify critical project information before making financial or operational decisions.
              </p>
              <p>
                <span className="text-white font-medium">No Professional Advice:</span> Nothing on this platform constitutes professional engineering, legal, financial, or regulatory advice. For project-specific guidance, please consult qualified professionals.
              </p>
              <p>
                <span className="text-white font-medium">Limitation of Liability:</span> In no event shall KARTAA OS, its founders, employees, or affiliates be liable for any indirect, incidental, special, or consequential damages arising from the use of this platform or reliance on information provided herein.
              </p>
              <p>
                <span className="text-white font-medium">Intellectual Property:</span> All content, design, and software on this platform are the intellectual property of KARTAA OS. Unauthorized reproduction or distribution is strictly prohibited.
              </p>
              <p className="text-white/30 text-xs pt-2 border-t border-white/10">
                Last updated: August 2026. By using KARTAA OS, you agree to these terms.
              </p>
            </div>
          )}
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
              <HardHat size={12} className="text-black" />
            </div>
            <span className="text-sm font-semibold text-white/70">KARTAA OS</span>
          </div>
          <p className="text-xs text-white/30 text-center">
            © {new Date()?.getFullYear()} KARTAA OS. Built for India's construction industry.
          </p>
          <Link
            href="/sign-up-login-screen"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Sign In to Platform →
          </Link>
        </div>
      </footer>
    </div>
  );
}
