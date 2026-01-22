'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, UserCircle, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (pathname === '/login' || pathname === '/') return null

  const navItems = [
    { name: 'Job Analysis', href: '/analysis', icon: Home },
    { name: 'My Profile', href: '/profile', icon: UserCircle },
    { name: 'History', href: '/history', icon: History },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsConfirmingLogout(false)
    router.push('/')
  }

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <div className="hidden md:flex flex-col w-64 xl:w-72 2xl:w-80 bg-slate-900 text-white h-screen sticky top-0 p-4 2xl:p-6 transition-all duration-300">
        <div className="mb-8 p-2">
          <h1 className="text-xl 2xl:text-3xl font-bold">Job Match <span className="text-blue-400">AI</span></h1>
        </div>
        
        <nav className="flex-1 space-y-2 2xl:space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 2xl:py-4 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                
                <Icon size={20} className="2xl:w-6 2xl:h-6" />
                <span className="font-medium 2xl:text-lg">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-2 2xl:space-y-4">
          {isConfirmingLogout && (
            <div className="bg-slate-800 p-3 2xl:p-5 rounded-lg border border-slate-700 shadow-xl mb-2 animate-in slide-in-from-bottom-2 fade-in">
              <p className="text-sm 2xl:text-base text-slate-300 mb-3 text-center">Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsConfirmingLogout(false)}
                  className="flex-1 px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-medium bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsConfirmingLogout(!isConfirmingLogout)}
            className={`flex items-center gap-3 px-4 py-3 2xl:py-4 w-full rounded-lg transition-colors ${
               isConfirmingLogout 
                 ? 'bg-slate-800 text-white' 
                 : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
            }`}
          >
            <LogOut size={20} className="2xl:w-6 2xl:h-6" />
            <span className="2xl:text-lg">Logout</span>
          </button>
        </div>
      </div>

      {/* --- Mobile Top Navigation --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 relative z-20">
          <h1 className="text-lg font-bold">Job Match <span className="text-blue-400">AI</span></h1>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <Menu 
                size={24} 
                className="absolute top-0 left-0 transition-all duration-300 ease-in-out"
                style={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  transform: isMobileMenuOpen ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)'
                }}
              />
              <X 
                size={24} 
                className="absolute top-0 left-0 transition-all duration-300 ease-in-out"
                style={{
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)'
                }}
              />
            </div>
          </button>
        </div>

        
        <div 
          className="bg-slate-800 border-slate-700"
          style={{
            display: 'grid',
            gridTemplateRows: isMobileMenuOpen ? '1fr' : '0fr',
            transition: 'grid-template-rows 500ms ease-in-out, border-bottom-width 500ms ease-in-out',
            borderBottomWidth: isMobileMenuOpen ? '1px' : '0px'
          }}
        >
          
          <div style={{ overflow: 'hidden' }}>
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="mt-4 pt-4 border-t border-slate-700">
                {isConfirmingLogout && (
                  <div className="bg-slate-700 p-3 rounded-lg mb-3 text-center">
                    <p className="text-sm text-slate-300 mb-3">Are you sure?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsConfirmingLogout(false)}
                        className="flex-1 py-2 text-xs font-bold bg-slate-600 hover:bg-slate-500 rounded text-white"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex-1 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 rounded text-white"
                      >
                        YES
                      </button>
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => setIsConfirmingLogout(!isConfirmingLogout)}
                  className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors ${
                     isConfirmingLogout 
                       ? 'bg-slate-700 text-white' 
                       : 'text-slate-400 hover:text-red-400 hover:bg-slate-700'
                  }`}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}