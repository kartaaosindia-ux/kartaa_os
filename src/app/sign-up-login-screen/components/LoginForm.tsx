'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, Building2, Route, Factory, Zap } from 'lucide-react';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import type { DemoSector } from '@/contexts/DemoContext';

type Role = 'project_manager' | 'site_engineer' | 'client_consultant';
type TabMode = 'login' | 'signup';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface SignupFormData {
  fullName: string;
  organisation: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  agreeTerms: boolean;
}

const roleOptions: { id: Role; label: string; desc: string }[] = [
  { id: 'project_manager', label: 'Project Manager', desc: 'Full access — manage projects, BOQ, team' },
  { id: 'site_engineer', label: 'Site Engineer', desc: 'Field access — submit progress entries & photos' },
  { id: 'client_consultant', label: 'Client / Consultant', desc: 'Read-only — view dashboards & reports' },
];

interface DemoSectorItem {
  id: string;
  label: string;
  subtitle: string;
  email: string;
  password: string;
  icon: React.ReactNode;
  color: string;
  sampleLogs: string[];
  sector: NonNullable<DemoSector>;
}

const demoSectors: DemoSectorItem[] = [
  {
    id: 'demo-building',
    label: 'Building Construction',
    subtitle: 'Residential & Commercial',
    email: 'demo.building@kartaa.in',
    password: 'DemoBuilding@2026',
    icon: <Building2 size={16} />,
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    sampleLogs: ['Foundation Pouring', 'Structural Framing Inspection'],
    sector: 'building',
  },
  {
    id: 'demo-roads',
    label: 'Roads',
    subtitle: 'Highway & Road Infrastructure',
    email: 'demo.roads@kartaa.in',
    password: 'DemoRoads@2026',
    icon: <Route size={16} />,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    sampleLogs: ['Asphalt Layering', 'Traffic Control Clearance'],
    sector: 'roads',
  },
  {
    id: 'demo-industrial',
    label: 'Industrial & Railway',
    subtitle: 'EPC & Rail Infrastructure',
    email: 'demo.industrial@kartaa.in',
    password: 'DemoIndustrial@2026',
    icon: <Factory size={16} />,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    sampleLogs: ['Track Alignment', 'Steel Structure Erection'],
    sector: 'industrial_railway',
  },
];

export default function LoginForm({ initialMode = 'login' }: { initialMode?: TabMode }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const { setDemoSector } = useDemo();
  const [mode, setMode] = useState<TabMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('project_manager');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingId, setDemoLoadingId] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupFormData>({ defaultValues: { fullName: '', organisation: '', email: '', password: '', confirmPassword: '', role: 'project_manager', agreeTerms: false } });

  const handleLoginSubmit = loginForm.handleSubmit(async (data) => {
    setLoginError('');
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!', { description: 'Redirecting to dashboard...' });
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) {
      setLoginError(err?.message || 'Invalid credentials — use the demo accounts below to sign in');
    } finally {
      setIsLoading(false);
    }
  });

  const handleSignupSubmit = signupForm.handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, {
        fullName: data.fullName,
        organisation: data.organisation,
        role: selectedRole,
      });
      toast.success('Account created successfully', { description: 'Redirecting to dashboard...' });
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) {
      toast.error('Sign up failed', { description: err?.message || 'Please try again.' });
    } finally {
      setIsLoading(false);
    }
  });

  const handleDemoLogin = async (sector: DemoSectorItem) => {
    setDemoLoadingId(sector.id);
    setLoginError('');
    try {
      await signIn(sector.email, sector.password);
      setDemoSector(sector.sector);
      toast.success(`Demo: ${sector.label}`, { description: 'Loading demo dashboard...' });
      setTimeout(() => router.push('/'), 800);
    } catch (err: any) {
      // If Supabase auth fails (demo user not created), still set sector and redirect
      setDemoSector(sector.sector);
      toast.success(`Demo: ${sector.label}`, { description: 'Loading demo dashboard...' });
      setTimeout(() => router.push('/'), 800);
    } finally {
      setDemoLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <AppLogo size={32} />
        <span className="font-bold text-lg text-foreground">KARTAA OS</span>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-border bg-muted p-1 mb-8">
        {(['login', 'signup'] as TabMode[]).map((tab) => (
          <button
            key={`tab-${tab}`}
            onClick={() => setMode(tab)}
            className={`flex-1 py-2 text-sm font-500 rounded-lg transition-all duration-150 ${mode === tab ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {/* Login form */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-5 fade-in" noValidate>
          <div>
            <h1 className="text-2xl font-700 text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to KARTAA OS — NHAI Delhi Region</p>
          </div>

          {loginError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-danger/8 border border-danger/25 text-sm text-danger">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="form-label">Work Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="your.name@organisation.kartaa.in"
              autoComplete="email"
              {...loginForm.register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
              })}
              className={`form-input ${loginForm.formState.errors.email ? 'form-input-error' : ''}`}
            />
            {loginForm.formState.errors.email && (
              <p className="form-error"><AlertCircle size={11} />{loginForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...loginForm.register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                className={`form-input pr-10 ${loginForm.formState.errors.password ? 'form-input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {loginForm.formState.errors.password && (
              <p className="form-error"><AlertCircle size={11} />{loginForm.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="login-remember"
              type="checkbox"
              {...loginForm.register('remember')}
              className="w-3.5 h-3.5 accent-primary rounded"
            />
            <label htmlFor="login-remember" className="text-sm text-muted-foreground cursor-pointer">
              Keep me signed in for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2.5 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in...
              </>
            ) : 'Sign In to KARTAA OS'}
          </button>

          {/* Try Demo Account Section */}
          <div className="mt-6 rounded-xl border border-border bg-muted/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Zap size={13} className="text-accent" />
              <span className="text-xs font-600 text-foreground">Try Demo Account</span>
              <span className="ml-auto text-2xs text-muted-foreground">No credentials needed</span>
            </div>
            <div className="p-3 space-y-2">
              {demoSectors.map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  disabled={demoLoadingId !== null}
                  onClick={() => handleDemoLogin(sector)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg border transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${sector.color}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sector.color}`}>
                    {demoLoadingId === sector.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      sector.icon
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-xs font-600 text-foreground truncate">{sector.label}</div>
                    <div className="text-2xs text-muted-foreground mt-0.5 truncate">{sector.subtitle}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {sector.sampleLogs.map((log, i) => (
                        <span key={i} className="text-2xs px-1.5 py-0.5 rounded bg-muted border border-border/60 text-muted-foreground truncate max-w-[100px]">
                          {log}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-2xs text-muted-foreground font-500 flex-shrink-0">
                    {demoLoadingId === sector.id ? 'Loading...' : 'Enter →'}
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-border/50">
              <p className="text-2xs text-muted-foreground/60 text-center">
                Demo data is synthetic — no real project information
              </p>
            </div>
          </div>
        </form>
      )}

      {/* Signup form */}
      {mode === 'signup' && (
        <form onSubmit={handleSignupSubmit} className="space-y-5 fade-in" noValidate>
          <div>
            <h1 className="text-2xl font-700 text-foreground">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">Register for KARTAA OS — your data is stored securely</p>
          </div>

          <div>
            <label htmlFor="signup-name" className="form-label">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Your full name"
              {...signupForm.register('fullName', { required: 'Full name is required' })}
              className={`form-input ${signupForm.formState.errors.fullName ? 'form-input-error' : ''}`}
            />
            {signupForm.formState.errors.fullName && (
              <p className="form-error"><AlertCircle size={11} />{signupForm.formState.errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-org" className="form-label">Organisation</label>
            <input
              id="signup-org"
              type="text"
              placeholder="NHAI / Contractor / Consultant"
              {...signupForm.register('organisation', { required: 'Organisation is required' })}
              className={`form-input ${signupForm.formState.errors.organisation ? 'form-input-error' : ''}`}
            />
            {signupForm.formState.errors.organisation && (
              <p className="form-error"><AlertCircle size={11} />{signupForm.formState.errors.organisation.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-email" className="form-label">Work Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="your.name@organisation.in"
              {...signupForm.register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
              })}
              className={`form-input ${signupForm.formState.errors.email ? 'form-input-error' : ''}`}
            />
            {signupForm.formState.errors.email && (
              <p className="form-error"><AlertCircle size={11} />{signupForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Role</label>
            <div className="space-y-2">
              {roleOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRole(opt.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-all ${selectedRole === opt.id ? 'border-primary bg-primary/8 text-foreground' : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'}`}
                >
                  <div className="text-xs font-600">{opt.label}</div>
                  <div className="text-2xs mt-0.5 opacity-70">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="form-label">Password</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                {...signupForm.register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                className={`form-input pr-10 ${signupForm.formState.errors.password ? 'form-input-error' : ''}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {signupForm.formState.errors.password && (
              <p className="form-error"><AlertCircle size={11} />{signupForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup-confirm" className="form-label">Confirm Password</label>
            <div className="relative">
              <input
                id="signup-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                className={`form-input pr-10 ${signupForm.formState.errors.confirmPassword ? 'form-input-error' : ''}`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {signupForm.formState.errors.confirmPassword && (
              <p className="form-error"><AlertCircle size={11} />{signupForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="signup-terms"
              type="checkbox"
              {...signupForm.register('agreeTerms', { required: 'You must agree to the terms' })}
              className="w-3.5 h-3.5 accent-primary rounded mt-0.5"
            />
            <label htmlFor="signup-terms" className="text-xs text-muted-foreground cursor-pointer">
              I agree to the KARTAA OS <span className="text-primary hover:underline">Terms of Service</span> and <span className="text-primary hover:underline">Privacy Policy</span>
            </label>
          </div>
          {signupForm.formState.errors.agreeTerms && (
            <p className="form-error"><AlertCircle size={11} />{signupForm.formState.errors.agreeTerms.message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2.5 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating account...
              </>
            ) : 'Create Account'}
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('login')} className="text-primary hover:underline font-500">
              Sign in
            </button>
          </p>
        </form>
      )}
    </div>
  );
}