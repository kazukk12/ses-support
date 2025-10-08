'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, MessageSquare, AlertTriangle, BarChart3, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { DashboardStats, SkillDistribution } from '@/types'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function DashboardPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const router = useRouter()

  const handleSkillClick = (skillName: string) => {
    // URLSearchParamsを使ってクエリパラメーターを設定
    const searchParams = new URLSearchParams()
    searchParams.set('skill', skillName)
    router.push(`/employees?${searchParams.toString()}`)
  }

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.dashboard.getStats(),
  })

  const { data: skillDistribution, isLoading: skillsLoading } = useQuery<SkillDistribution[]>({
    queryKey: ['dashboard', 'skills'],
    queryFn: () => api.dashboard.getSkillDistribution(),
  })

  const { data: detailedSkills, isLoading: detailedLoading } = useQuery({
    queryKey: ['dashboard', 'detailed-skills', expandedCategory],
    queryFn: () => api.dashboard.getDetailedSkillDistribution(expandedCategory!),
    enabled: !!expandedCategory,
  })

  const { data: recentOneOnOnes, isLoading: recentLoading } = useQuery({
    queryKey: ['dashboard', 'recent-one-on-ones'],
    queryFn: () => api.dashboard.getRecentOneOnOnes(5),
  })

  if (statsLoading) {
    return <div className="flex justify-center items-center h-64">読み込み中...</div>
  }

  return (
    <AuthGuard>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl p-4 sm:p-6 lg:p-8 border border-brand-200">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-800 mb-2">ダッシュボード</h1>
        <p className="text-brand-600 text-sm sm:text-base lg:text-lg">
          SES Supportの概要と最新の状況
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">総社員数</CardTitle>
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-brand-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats?.total_employees || 0}</div>
            <p className="text-xs text-gray-500 mt-1">登録社員数</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-brand-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">来月空き予定</CardTitle>
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-brand-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-brand-600">{stats?.next_month_available || 0}</div>
            <p className="text-xs text-gray-500 mt-1">アサイン可能</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-brand-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">1on1実施率</CardTitle>
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-brand-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-brand-600">{stats?.one_on_one_completion_rate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">今月の実施状況</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-red-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">要注意社員</CardTitle>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-red-500">{stats?.attention_employees || 0}</div>
            <p className="text-xs text-gray-500 mt-1">フォローアップ必要</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-brand-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl text-brand-800">技術分布</CardTitle>
                <CardDescription className="text-brand-600 text-sm sm:text-base">
                  カテゴリ別のスキル保有者数
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {skillsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {skillDistribution?.map((item, index) => (
                  <div key={item.category} className="bg-white rounded-lg border border-gray-100 hover:border-brand-200 transition-colors">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === item.category ? null : item.category)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        {expandedCategory === item.category ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (item.count / 20) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xl font-bold text-brand-600">{item.count}</span>
                      </div>
                    </button>

                    {expandedCategory === item.category && (
                      <div className="px-3 pb-3">
                        {detailedLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
                          </div>
                        ) : detailedSkills && detailedSkills.length > 0 ? (
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            {detailedSkills.map((skill: any) => (
                              <button
                                key={skill.name || skill.id}
                                onClick={() => handleSkillClick(skill.name)}
                                className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 hover:bg-brand-50 rounded-md transition-colors duration-200 group"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600 group-hover:text-brand-700">{skill.name}</span>
                                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                                <span className="text-sm font-medium text-brand-600">
                                  {skill.count || skill.employee_count}人
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-gray-500 text-sm">
                            詳細データがありません
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-brand-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl text-brand-800">最近の1on1</CardTitle>
                <CardDescription className="text-brand-600 text-sm sm:text-base">
                  直近の1on1記録
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOneOnOnes?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-brand-200 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">{item.employee_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.employee_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'good' ? 'bg-brand-100 text-brand-700 border border-brand-200' :
                      item.status === 'attention' ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {item.status === 'good' ? '良好' :
                       item.status === 'attention' ? '注意' : '普通'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </AuthGuard>
  )
}