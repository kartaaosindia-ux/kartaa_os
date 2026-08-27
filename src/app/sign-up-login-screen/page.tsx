import React from 'react';
import LoginForm from './components/LoginForm';
import LoginBrandPanel from './components/LoginBrandPanel';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <LoginBrandPanel />
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <LoginForm />
      </div>
    </div>
  );
}