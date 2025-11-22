'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Vault, Home, Wallet, Shield } from 'lucide-react'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'
import { cn } from '@/lib/utils'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  const iconMap = {
    '/': Home,
    '/account': Wallet,
    '/about': Shield,
  }
  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between rounded-xl border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-black/5 dark:shadow-black/20 px-6">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Vault className="w-5 h-5 text-primary" />
              </div>
              <span>LockBox</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map(({ label, path }) => {
                const Icon = iconMap[path as keyof typeof iconMap]
                return (
                  <Link
                    key={path}
                    href={path}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive(path) ? 'rounded-b-none border-b-2 border-primary' : 'text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <WalletButton />
              <ClusterUiSelect />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Toggle menu"
            >
              {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden mt-2 mx-4 rounded-xl border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-2">
              {links.map(({ label, path }) => {
                const Icon = iconMap[path as keyof typeof iconMap]
                return (
                  <Link
                    key={path}
                    href={path}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive(path) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t">
              <WalletButton />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <ClusterUiSelect />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
