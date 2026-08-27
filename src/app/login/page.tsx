import React from 'react';
import LoginForm from '@/app/sign-up-login-screen/components/LoginForm';
import LoginBrandPanel from '@/app/sign-up-login-screen/components/LoginBrandPanel';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <LoginBrandPanel />
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <LoginForm initialMode="login" />
      </div>
    </div>
  );
}
