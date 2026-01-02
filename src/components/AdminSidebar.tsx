'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Building2,
  Home,
  FileText,
  CheckCircle,
  AlertTriangle,
  Wrench,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Building,
  ClipboardList,
  UserCog,
} from 'lucide-react'

type NavItem = {
  name: string
  href?: string
  icon: React.ReactNode
  children?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
  {
    name: '대시보드',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: '사용자',
    icon: <Users className="w-5 h-5" />,
    children: [
      { name: '사용자 관리', href: '/admin/users' },
      { name: '관리자 계정', href: '/admin/admins' },
    ],
  },
  {
    name: '매물',
    icon: <Home className="w-5 h-5" />,
    children: [
      { name: '매물 관리', href: '/admin/properties' },
      { name: '매물 요청', href: '/admin/property-requests' },
      { name: '매물 인증', href: '/admin/verification/properties' },
    ],
  },
  {
    name: '인증/승인',
    icon: <CheckCircle className="w-5 h-5" />,
    children: [
      { name: '역할 승인', href: '/admin/role-requests' },
      { name: '회사 인증', href: '/admin/verification/companies' },
    ],
  },
  {
    name: '신고 관리',
    href: '/admin/reports',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    name: '하우스케어',
    icon: <Wrench className="w-5 h-5" />,
    children: [
      { name: '요청 관리', href: '/admin/housecare' },
      { name: '사용자 연결', href: '/admin/housecare/users' },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(['사용자', '매물', '인증/승인', '하우스케어'])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const isGroupActive = (children?: { name: string; href: string }[]) => {
    if (!children) return false
    return children.some((child) => isActive(child.href))
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold">Off-Base</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.href ? (
                // Single link item
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ) : (
                // Dropdown menu
                <div>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isGroupActive(item.children)
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openMenus.includes(item.name) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openMenus.includes(item.name) && item.children && (
                    <ul className="mt-1 space-y-1 pl-10">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}