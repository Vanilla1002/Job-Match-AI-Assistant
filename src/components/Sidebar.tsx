'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, UserCircle, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false)

  if (pathname === '/login' || pathname === '/') return null

  const navItems = [
    { name: 'Job Analysis', href: '/analysis', icon: Home },
    { name: 'My Profile', href: '/profile', icon: UserCircle },
    { name: 'History', href: '/history', icon: History },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsConfirmingLogout(!isConfirmingLogout)
    router.push('/')
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen p-4">
      <div className="mb-8 p-2">
        <h1 className="text-xl font-bold">Job Match <span className="text-blue-400">AI</span></h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout area */}
      <div className="mt-auto space-y-2">
        
        {/* Confirmation bubble - appears only when clicking */}
        {isConfirmingLogout && (
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-200 mb-2">
            <p className="text-sm text-slate-300 mb-3 text-center">Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsConfirmingLogout(false)}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {/* Main logout button */}
        <button 
          onClick={() => setIsConfirmingLogout(!isConfirmingLogout)}
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors ${
             isConfirmingLogout 
               ? 'bg-slate-800 text-white' 
               : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
          }`}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}