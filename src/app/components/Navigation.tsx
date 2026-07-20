'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { status } = useSession()
  const [LoginStatus, SetLoginStatus] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      SetLoginStatus(true)
    } else {
      SetLoginStatus(false)
    }
  }, [status])



  const navItems = [
    { href: '/', label: 'Upload Main', icon: '✨' },
    { href: '/main-projects', label: 'Main Projects', icon: '🔥' },
    { href: '/messages', label: 'Messages', icon: '💬' },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Project Manager</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={LoginStatus ? `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }` : "hidden"}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className={LoginStatus ? "flex items-center" : "hidden"}>
            <button type='button' onClick={() => {
              signOut()
            }} >SignOut</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
