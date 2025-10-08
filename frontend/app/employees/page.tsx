'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, DollarSign, X, ChevronDown, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { EmployeeList } from '@/types'
import { availabilityStatusLabels } from '@/lib/utils'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillSearchTerm, setSkillSearchTerm] = useState('')
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const skillDropdownRef = useRef<HTMLDivElement>(null)

  const handleClearAllSkills = () => {
    setSelectedSkills([])
    router.push('/employees')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill !== skillToRemove))
  }

  // URLクエリパラメータからスキル検索条件を取得
  useEffect(() => {
    const skillParam = searchParams.get('skill')
    if (skillParam) {
      setSelectedSkills([skillParam])
    }
  }, [searchParams])

  const { data: employees, isLoading, error } = useQuery<EmployeeList[]>({
    queryKey: ['employees'],
    queryFn: () => {
      console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL)
      return api.employees.getAll()
    },
  })

  // デバッグ情報をコンソールに出力
  console.log('employees data:', employees)
  console.log('isLoading:', isLoading)
  console.log('error:', error)

  const { data: allSkills } = useQuery<any[]>({
    queryKey: ['skills'],
    queryFn: () => api.skills.getAll(),
  })

  // スキル検索のフィルタリング
  const filteredSkills = allSkills?.filter(skill =>
    skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase())
  ) || []

  // ドロップダウン外部クリック検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setIsSkillDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSkillSelect = (skillName: string) => {
    if (!selectedSkills.includes(skillName)) {
      setSelectedSkills(prev => [...prev, skillName])
    }
    setSkillSearchTerm('')
    setIsSkillDropdownOpen(false)
  }

  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.main_role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSkills = selectedSkills.length === 0 || selectedSkills.every(selectedSkill =>
      employee.main_skills.some(employeeSkill =>
        employeeSkill.toLowerCase().includes(selectedSkill.toLowerCase())
      )
    )

    return matchesSearch && matchesSkills
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">
          エラーが発生しました: {error.message}
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl p-4 sm:p-6 lg:p-8 border border-brand-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-800 mb-2">社員一覧</h1>
            <div>
              <p className="text-brand-600 text-sm sm:text-base lg:text-lg">
                登録されている社員の一覧とスキル情報
              </p>
            </div>
          </div>
          <Link href="/employees/new">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
              + 新規登録
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="名前・役職で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 sm:h-auto"
          />
        </div>
        <div className="flex-1 relative" ref={skillDropdownRef}>
          <div className="relative">
            <Input
              type="text"
              placeholder="スキルで検索..."
              value={skillSearchTerm}
              onChange={(e) => {
                setSkillSearchTerm(e.target.value)
                setIsSkillDropdownOpen(true)
              }}
              onFocus={() => setIsSkillDropdownOpen(true)}
              className="h-10 sm:h-auto pr-10"
            />
            <button
              onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isSkillDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isSkillDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {skillSearchTerm && (
                <div className="p-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Search className="w-3 h-3" />
                    <span>"{skillSearchTerm}" を検索中...</span>
                  </div>
                </div>
              )}
              {filteredSkills.length > 0 ? (
                filteredSkills.slice(0, 20).map((skill) => {
                  const isSelected = selectedSkills.includes(skill.name)
                  return (
                    <button
                      key={skill.id}
                      onClick={() => handleSkillSelect(skill.name)}
                      disabled={isSelected}
                      className={`w-full text-left px-4 py-2 transition-colors ${
                        isSelected
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {skill.category}
                          </span>
                          {isSelected && (
                            <span className="text-xs text-brand-600 bg-brand-100 px-2 py-1 rounded-full">
                              選択済み
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  該当するスキルが見つかりません
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* アクティブな検索フィルターのタグ表示 */}
      {(searchTerm || selectedSkills.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          {searchTerm && (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-brand-100 text-brand-800 rounded-full text-sm font-medium border border-brand-200">
              <span>名前・役職: {searchTerm}</span>
              <button
                onClick={() => setSearchTerm('')}
                className="hover:bg-brand-200 rounded-full p-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {selectedSkills.map((skill) => (
            <div key={skill} className="inline-flex items-center gap-2 px-3 py-2 bg-brand-100 text-brand-800 rounded-full text-sm font-medium border border-brand-200">
              <span>{skill}</span>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="hover:bg-brand-200 rounded-full p-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {selectedSkills.length > 1 && (
            <button
              onClick={handleClearAllSkills}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200 hover:bg-red-200 transition-colors"
            >
              <span>すべてクリア</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {filteredEmployees?.map((employee) => (
          <Link key={employee.id} href={`/employees/${employee.id}`}>
            <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg bg-gradient-to-br from-white via-white to-brand-50/30 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white hover:via-brand-50/20 hover:to-brand-100/40 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-brand-200 transition-shadow duration-300">
                      <span className="text-white font-bold text-lg">{employee.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg text-gray-900 group-hover:text-brand-800 transition-colors duration-300 truncate">{employee.name}</CardTitle>
                      <CardDescription className="text-brand-600 font-medium text-sm">
                        {employee.main_role} • 経験{employee.years_experience}年
                      </CardDescription>
                    </div>
                  </div>
                  {employee.availability_status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm border ${
                      employee.availability_status === 'working' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      employee.availability_status === 'available_next_month' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-brand-50 text-brand-700 border-brand-200'
                    }`}>
                      {availabilityStatusLabels[employee.availability_status]}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-5 h-5 bg-brand-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-3 h-3 text-brand-600" />
                      </div>
                      <p className="text-sm font-semibold text-brand-700">主要スキル</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {employee.main_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-brand-50 to-brand-100 text-brand-800 text-xs rounded-full font-medium border border-brand-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(employee.unit_price_min || employee.unit_price_max) && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-brand-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-3 h-3 text-brand-600" />
                        </div>
                        <p className="text-sm font-semibold text-brand-700">単価レンジ</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        {employee.unit_price_min?.toLocaleString()}円 - {employee.unit_price_max?.toLocaleString()}円
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredEmployees?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">該当する社員が見つかりませんでした。</p>
        </div>
      )}
      </div>
    </AuthGuard>
  )
}