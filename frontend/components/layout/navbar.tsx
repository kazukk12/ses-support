'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard' },
  { name: '社員一覧', href: '/employees' },
  { name: '案件マッチング', href: '/matching' },
  { name: '1on1記録', href: '/one-on-ones' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

  // パスが変更されたときにメニューを閉じる
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-18">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">S</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                  SES Support
                </h1>
              </div>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-800',
                    'inline-flex items-center px-4 py-3 mx-1 border-b-2 text-sm font-medium rounded-t-lg transition-all duration-200'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ''}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-brand-300 to-brand-400 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                      {session.user?.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </Button>
                </div>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors duration-200"
                  aria-expanded="false"
                >
                  <span className="sr-only">メニューを開く</span>
                  {isMenuOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth/signin">ログイン</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {session && (
        <div className={cn(
          "sm:hidden transition-all duration-300 ease-in-out",
          isMenuOpen
            ? "max-h-96 opacity-100 border-t border-gray-100"
            : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <div className="px-4 py-3 space-y-1 bg-white shadow-lg">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  pathname === item.href
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800',
                  'block px-4 py-3 rounded-lg text-base font-medium border-l-4 transition-all duration-200'
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center gap-3 px-4 py-2 mb-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ''}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-brand-300 to-brand-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}