'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Home, FileCheck, AlertCircle, Building2 } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  users: {
    total: number
    admins: number
    realtors: number
    tenants: number
    landlords: number
    pendingVerification: number
  }
  properties: {
    total: number
    active: number
    inactive: number
    thisMonth: number
  }
  companies: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  pendingDocuments: number
  pendingReports: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    users: { total: 0, admins: 0, realtors: 0, tenants: 0, landlords: 0, pendingVerification: 0 },
    properties: { total: 0, active: 0, inactive: 0, thisMonth: 0 },
    companies: { total: 0, approved: 0, pending: 0, rejected: 0 },
    pendingDocuments: 0,
    pendingReports: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get user statistics
        const { data: users } = await supabase
          .from('users')
          .select('user_type, verification_status')
        
        // Get property statistics
        const { data: properties } = await supabase
          .from('properties')
          .select('id, is_active, created_at, status')
        
        // Get company statistics
        const { data: companies } = await supabase
          .from('realtor_companies')
          .select('id, verification_status')
        
        // Get pending verifications
        const { data: pendingDocs } = await supabase
          .from('user_verification_documents')
          .select('id')
          .eq('verification_status', 'PENDING')
        
        // Get property reports
        const { data: reports } = await supabase
          .from('property_reports')
          .select('id, status')
          .eq('status', 'PENDING')

        // Calculate statistics
        const userStats = {
          total: users?.length || 0,
          admins: users?.filter(u => u.user_type === 'ADMIN').length || 0,
          realtors: users?.filter(u => u.user_type === 'REALTOR').length || 0,
          tenants: users?.filter(u => u.user_type === 'TENANT').length || 0,
          landlords: users?.filter(u => u.user_type === 'LANDLORD').length || 0,
          pendingVerification: users?.filter(u => u.verification_status === 'PENDING').length || 0
        }

        const propertyStats = {
          total: properties?.length || 0,
          active: properties?.filter(p => p.is_active).length || 0,
          inactive: properties?.filter(p => !p.is_active).length || 0,
          thisMonth: properties?.filter(p => {
            const createdAt = new Date(p.created_at!)
            const now = new Date()
            return createdAt.getMonth() === now.getMonth() && 
                   createdAt.getFullYear() === now.getFullYear()
          }).length || 0
        }

        const companyStats = {
          total: companies?.length || 0,
          approved: companies?.filter(c => c.verification_status === 'APPROVED').length || 0,
          pending: companies?.filter(c => c.verification_status === 'PENDING').length || 0,
          rejected: companies?.filter(c => c.verification_status === 'REJECTED').length || 0
        }

        setStats({
          users: userStats,
          properties: propertyStats,
          companies: companyStats,
          pendingDocuments: pendingDocs?.length || 0,
          pendingReports: reports?.length || 0
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsCards = [
    {
      title: '전체 사용자',
      value: stats.users.total.toString(),
      icon: Users,
      description: `관리자: ${stats.users.admins} | 공인중개사: ${stats.users.realtors} | 세입자: ${stats.users.tenants}`,
      link: '/admin/users',
      color: 'text-blue-600'
    },
    {
      title: '전체 매물',
      value: stats.properties.total.toString(),
      icon: Home,
      description: `활성: ${stats.properties.active} | 비활성: ${stats.properties.inactive}`,
      link: '/admin/properties',
      color: 'text-green-600'
    },
    {
      title: '부동산 회사',
      value: stats.companies.total.toString(),
      icon: Building2,
      description: `승인: ${stats.companies.approved} | 대기: ${stats.companies.pending}`,
      link: '/admin/verification/companies',
      color: 'text-purple-600'
    },
    {
      title: '대기중인 인증',
      value: stats.users.pendingVerification.toString(),
      icon: FileCheck,
      description: '사용자 인증 대기',
      link: '/admin/users?filter=PENDING',
      color: 'text-yellow-600'
    },
    {
      title: '신고된 매물',
      value: stats.pendingReports.toString(),
      icon: AlertCircle,
      description: '검토 필요한 신고',
      link: '/admin/reports',
      color: 'text-red-600'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat) => (
        <Link key={stat.title} href={stat.link}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}