import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getCurrentUser, signOut } from '@/lib/auth'

export async function MainNav() {
  const pathname = usePathname()
  const user = await getCurrentUser()

  const routes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    {
      href: '/documents',
      label: 'Documents',
      active: pathname === '/documents',
    },
    {
      href: '/analytics',
      label: 'Analytics',
      active: pathname === '/analytics',
    },
  ]

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4 lg:space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                route.active
                  ? 'text-black dark:text-white'
                  : 'text-muted-foreground'
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="ghost"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                window.location.href = '/auth/login'
              }}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
