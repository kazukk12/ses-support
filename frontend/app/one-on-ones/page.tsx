'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart3, Calendar, MessageCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { OneOnOne } from '@/types'
import { formatDate, oneOnOneStatusLabels, oneOnOneStatusColors } from '@/lib/utils'

export default function OneOnOnesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  })
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('')
  const [appliedMonth, setAppliedMonth] = useState(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  })

  const { data: oneOnOnes, isLoading } = useQuery<(OneOnOne & { employee_name: string })[]>({
    queryKey: ['one-on-ones'],
    queryFn: api.oneOnOnes.getAll,
  })

  const filteredOneOnOnes = oneOnOnes?.filter(oneOnOne => {
    const matchesSearch = oneOnOne.employee_name?.toLowerCase().includes(appliedSearchTerm.toLowerCase())
    const matchesStatus = !appliedStatus || oneOnOne.status === appliedStatus
    const matchesMonth = !appliedMonth || oneOnOne.date.startsWith(appliedMonth)
    return matchesSearch && matchesStatus && matchesMonth
  })

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm)
    setAppliedStatus(selectedStatus)
    setAppliedMonth(selectedMonth)
  }


  const completionRateQuery = useQuery({
    queryKey: ['completion-rate'],
    queryFn: api.oneOnOnes.getCompletionRate,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl p-4 sm:p-6 lg:p-8 border border-brand-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-800 mb-2">1on1記録</h1>
            <p className="text-brand-600 text-sm sm:text-base lg:text-lg">
              社員との1on1記録の管理・追跡
            </p>
          </div>
          <Link href="/one-on-ones/new">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
              + 新規記録
            </Button>
          </Link>
        </div>
      </div>

      {/* 実施率表示 */}
      {completionRateQuery.data && (
        <Card className="bg-gradient-to-br from-white to-brand-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-600" />
              </div>
              <CardTitle className="text-xl text-brand-800">
                {completionRateQuery.data.year}年{completionRateQuery.data.month}月の実施状況
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center bg-white p-4 rounded-xl border border-brand-100 shadow-sm">
                <p className="text-3xl font-bold text-brand-600 mb-2">{completionRateQuery.data.completion_rate}%</p>
                <p className="text-sm text-brand-600 font-medium">実施率</p>
              </div>
              <div className="text-center bg-white p-4 rounded-xl border border-brand-100 shadow-sm">
                <p className="text-3xl font-bold text-brand-600 mb-2">{completionRateQuery.data.completed_one_on_ones}</p>
                <p className="text-sm text-brand-600 font-medium">実施済み人数</p>
              </div>
              <div className="text-center bg-white p-4 rounded-xl border border-brand-100 shadow-sm">
                <p className="text-3xl font-bold text-brand-600 mb-2">{completionRateQuery.data.total_employees}</p>
                <p className="text-sm text-brand-600 font-medium">総社員数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* フィルタ */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="社員名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 sm:h-12 text-base sm:text-lg border-brand-200 focus:border-brand-400 focus:ring-brand-400"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-brand-200 rounded-lg bg-white text-base sm:text-lg focus:border-brand-400 focus:ring-brand-400 min-w-0 sm:min-w-[200px]"
            >
              <option value="">すべてのステータス</option>
              <option value="good">良好</option>
              <option value="normal">普通</option>
              <option value="attention">注意</option>
            </select>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-brand-200 rounded-lg bg-white text-base sm:text-lg focus:border-brand-400 focus:ring-brand-400 min-w-0 sm:min-w-[180px]"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSearch}
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 sm:px-8 w-full sm:w-auto"
            >
              検索
            </Button>
          </div>
        </div>
      </div>

      {/* 記録一覧 */}
      <div className="space-y-4">
        {filteredOneOnOnes?.map((oneOnOne) => (
          <Card key={oneOnOne.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white via-white to-gray-50/50 hover:scale-[1.01]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{oneOnOne.employee_name.charAt(0)}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-brand-800 transition-colors duration-300">{oneOnOne.employee_name}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border shadow-sm w-fit ${oneOnOneStatusColors[oneOnOne.status]}`}>
                      {oneOnOneStatusLabels[oneOnOne.status]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      {formatDate(oneOnOne.date)}
                    </p>
                  </div>
                  {oneOnOne.memo && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-start space-x-2 mb-2">
                        <div className="w-5 h-5 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageCircle className="w-3 h-3 text-brand-600" />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {oneOnOne.memo.length > 150
                            ? `${oneOnOne.memo.substring(0, 150)}...`
                            : oneOnOne.memo
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-row sm:flex-col gap-2 sm:ml-4">
                  <Button variant="outline" size="sm" className="border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300 transition-colors duration-200 flex-1 sm:flex-none" asChild>
                    <Link href={`/one-on-ones/${oneOnOne.id}/edit`}>編集</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 flex-1 sm:flex-none" asChild>
                    <Link href={`/employees/${oneOnOne.employee_id}`}>社員詳細</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOneOnOnes?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">該当する1on1記録が見つかりませんでした。</p>
        </div>
      )}
    </div>
  )
}