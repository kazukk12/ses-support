'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Settings, ClipboardList } from 'lucide-react'
import { api } from '@/lib/api'
import { ProjectMatchingRequest, ProjectMatchingResult, Skill } from '@/types'
import { availabilityStatusLabels } from '@/lib/utils'

export default function MatchingPage() {
  const [searchCriteria, setSearchCriteria] = useState<ProjectMatchingRequest>({
    required_skills: [],
    preferred_skills: [],
    required_phases: [],
    start_date: '',
    unit_price_min: undefined,
    unit_price_max: undefined,
  })

  const [currentRequiredSkill, setCurrentRequiredSkill] = useState('')
  const [currentPreferredSkill, setCurrentPreferredSkill] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { data: skills } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: () => api.skills.getAll(),
  })

  const matchingMutation = useMutation<ProjectMatchingResult[], Error, ProjectMatchingRequest>({
    mutationFn: api.employees.matching,
    onSuccess: () => {
      setShowResults(true)
    },
    onError: (error) => {
      console.error('マッチングエラー:', error)
      alert('マッチング検索に失敗しました。')
    },
  })

  const handleAddSkill = (skill: string, type: 'required' | 'preferred') => {
    if (!skill.trim()) return

    setSearchCriteria(prev => ({
      ...prev,
      [type === 'required' ? 'required_skills' : 'preferred_skills']: [
        ...prev[type === 'required' ? 'required_skills' : 'preferred_skills'],
        skill.trim()
      ]
    }))

    if (type === 'required') {
      setCurrentRequiredSkill('')
    } else {
      setCurrentPreferredSkill('')
    }
  }

  const handleRemoveSkill = (skill: string, type: 'required' | 'preferred') => {
    setSearchCriteria(prev => ({
      ...prev,
      [type === 'required' ? 'required_skills' : 'preferred_skills']:
        prev[type === 'required' ? 'required_skills' : 'preferred_skills'].filter(s => s !== skill)
    }))
  }

  const handleSearch = () => {
    if (searchCriteria.required_skills.length === 0) {
      alert('必須スキルを1つ以上指定してください。')
      return
    }

    matchingMutation.mutate(searchCriteria)
  }

  const handleReset = () => {
    setSearchCriteria({
      required_skills: [],
      preferred_skills: [],
      required_phases: [],
      start_date: '',
      unit_price_min: undefined,
      unit_price_max: undefined,
    })
    setCurrentRequiredSkill('')
    setCurrentPreferredSkill('')
    setShowResults(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-2xl p-4 sm:p-6 lg:p-8 border border-brand-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-800 mb-2">案件マッチング</h1>
            <p className="text-brand-600 text-sm sm:text-base lg:text-lg">
              案件条件に適した社員を検索・マッチング
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* 検索条件 */}
        <Card className="bg-gradient-to-br from-white to-brand-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-brand-800">案件条件</CardTitle>
                <CardDescription className="text-brand-600">検索条件を入力してください</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 必須スキル */}
            <div>
              <label className="text-sm font-medium">必須スキル *</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={currentRequiredSkill}
                  onChange={(e) => setCurrentRequiredSkill(e.target.value)}
                  placeholder="スキル名を入力"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill(currentRequiredSkill, 'required')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => handleAddSkill(currentRequiredSkill, 'required')}
                >
                  追加
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {searchCriteria.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill, 'required')}
                      className="text-brand-600 hover:text-brand-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 歓迎スキル */}
            <div>
              <label className="text-sm font-medium">歓迎スキル</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={currentPreferredSkill}
                  onChange={(e) => setCurrentPreferredSkill(e.target.value)}
                  placeholder="スキル名を入力"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill(currentPreferredSkill, 'preferred')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => handleAddSkill(currentPreferredSkill, 'preferred')}
                >
                  追加
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {searchCriteria.preferred_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill, 'preferred')}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 稼働開始日 */}
            <div>
              <label className="text-sm font-medium">稼働開始日</label>
              <Input
                type="date"
                value={searchCriteria.start_date}
                onChange={(e) => setSearchCriteria(prev => ({
                  ...prev,
                  start_date: e.target.value
                }))}
                className="mt-1"
              />
            </div>

            {/* 単価条件 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">単価下限</label>
                <Input
                  type="number"
                  value={searchCriteria.unit_price_min || ''}
                  onChange={(e) => setSearchCriteria(prev => ({
                    ...prev,
                    unit_price_min: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                  placeholder="50"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">単価上限</label>
                <Input
                  type="number"
                  value={searchCriteria.unit_price_max || ''}
                  onChange={(e) => setSearchCriteria(prev => ({
                    ...prev,
                    unit_price_max: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                  placeholder="100"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button onClick={handleSearch} className="flex-1" disabled={matchingMutation.isPending}>
                {matchingMutation.isPending ? '検索中...' : 'マッチング検索'}
              </Button>
              <Button variant="outline" onClick={handleReset} className="sm:w-auto">
                リセット
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 検索結果 */}
        <Card className="bg-gradient-to-br from-white to-brand-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-brand-800">マッチング結果</CardTitle>
                <CardDescription className="text-brand-600">
                  {matchingMutation.data ?
                    `${matchingMutation.data.length}件の候補者が見つかりました` :
                    '条件を設定して検索してください'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {matchingMutation.data && matchingMutation.data.length > 0 ? (
              <div className="space-y-4">
                {matchingMutation.data.map((result, index) => (
                  <div
                    key={result.employee.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{result.employee.name}</h3>
                          <span className="text-sm bg-brand-100 text-brand-800 px-2 py-1 rounded">
                            スコア: {result.score.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.employee.main_role} • 経験{result.employee.years_experience}年
                        </p>
                      </div>
                      {result.employee.availability_status && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          result.employee.availability_status === 'working' ? 'bg-brand-100 text-brand-800' :
                          result.employee.availability_status === 'available_next_month' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-brand-100 text-brand-800'
                        }`}>
                          {availabilityStatusLabels[result.employee.availability_status]}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {result.matching_skills.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">合致スキル</p>
                          <div className="flex flex-wrap gap-1">
                            {result.matching_skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.recent_projects.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">直近案件</p>
                          <div className="text-xs text-muted-foreground">
                            {result.recent_projects.join(', ')}
                          </div>
                        </div>
                      )}

                      {(result.employee.unit_price_min || result.employee.unit_price_max) && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">単価レンジ</p>
                          <p className="text-xs">
                            {result.employee.unit_price_min?.toLocaleString()}万円 - {result.employee.unit_price_max?.toLocaleString()}万円
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Link href={`/employees/${result.employee.id}`}>
                        <Button size="sm">詳細を見る</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : showResults && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">条件に合致する候補者が見つかりませんでした。</p>
                <p className="text-sm text-muted-foreground mt-2">
                  検索条件を変更して再度お試しください。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}