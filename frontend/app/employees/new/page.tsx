'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { Skill, AvailabilityStatus } from '@/types'

export default function NewEmployeePage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '',
    years_experience: 0,
    main_role: '',
    unit_price_min: '',
    unit_price_max: '',
    desired_career: '',
    availability: {
      status: 'working' as AvailabilityStatus,
      available_from: '',
      memo: ''
    }
  })

  const [selectedSkills, setSelectedSkills] = useState<{skill_id: number, level: number, years_experience: number}[]>([])
  const [skillSearch, setSkillSearch] = useState('')

  const { data: skills, isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: () => api.skills.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: api.employees.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      router.push(`/employees/${data.id}`)
    },
    onError: (error) => {
      console.error('作成エラー:', error)
      alert('社員の作成に失敗しました。')
    },
  })

  const createAvailabilityMutation = useMutation({
    mutationFn: (data: any) => api.availability.create(data),
    onError: (error) => {
      console.error('稼働状況作成エラー:', error)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.main_role) {
      alert('名前と主要ロールは必須です。')
      return
    }

    try {
      const employeeData = {
        name: formData.name,
        years_experience: formData.years_experience,
        main_role: formData.main_role,
        unit_price_min: formData.unit_price_min ? parseInt(formData.unit_price_min) : undefined,
        unit_price_max: formData.unit_price_max ? parseInt(formData.unit_price_max) : undefined,
        desired_career: formData.desired_career,
        skills: selectedSkills
      }

      const employee = await createMutation.mutateAsync(employeeData)

      // 稼働状況を作成
      await createAvailabilityMutation.mutateAsync({
        employee_id: employee.id,
        status: formData.availability.status,
        available_from: formData.availability.available_from || undefined,
        memo: formData.availability.memo
      })

    } catch (error) {
      console.error('登録エラー:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('availability.')) {
      const availabilityField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [availabilityField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const addSkill = (skill: Skill) => {
    if (selectedSkills.find(s => s.skill_id === skill.id)) {
      return
    }

    setSelectedSkills(prev => [...prev, {
      skill_id: skill.id,
      level: 3,
      years_experience: 1
    }])
  }

  const updateSkill = (skill_id: number, field: string, value: number) => {
    setSelectedSkills(prev => prev.map(s =>
      s.skill_id === skill_id ? { ...s, [field]: value } : s
    ))
  }

  const removeSkill = (skill_id: number) => {
    setSelectedSkills(prev => prev.filter(s => s.skill_id !== skill_id))
  }

  const filteredSkills = skills?.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  )

  if (skillsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">新規社員登録</h1>
        <p className="text-muted-foreground">
          新しい社員の情報を登録します
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>社員の基本的な情報を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">氏名 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">経験年数 *</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.years_experience}
                  onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">主要ロール *</label>
                <Input
                  value={formData.main_role}
                  onChange={(e) => handleInputChange('main_role', e.target.value)}
                  placeholder="フロントエンドエンジニア、バックエンドエンジニアなど"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">単価下限（万円）</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.unit_price_min}
                    onChange={(e) => handleInputChange('unit_price_min', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">単価上限（万円）</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.unit_price_max}
                    onChange={(e) => handleInputChange('unit_price_max', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">希望キャリア</label>
                <textarea
                  value={formData.desired_career}
                  onChange={(e) => handleInputChange('desired_career', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  rows={3}
                  placeholder="将来的な希望やキャリアプランについて"
                />
              </div>
            </CardContent>
          </Card>

          {/* 稼働状況 */}
          <Card>
            <CardHeader>
              <CardTitle>稼働状況</CardTitle>
              <CardDescription>現在の稼働状況を設定してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">稼働ステータス</label>
                <select
                  value={formData.availability.status}
                  onChange={(e) => handleInputChange('availability.status', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="working">稼働中</option>
                  <option value="available_next_month">来月空き</option>
                  <option value="immediately_available">即稼働可能</option>
                </select>
              </div>

              {formData.availability.status !== 'working' && (
                <div>
                  <label className="text-sm font-medium">稼働開始可能日</label>
                  <Input
                    type="date"
                    value={formData.availability.available_from}
                    onChange={(e) => handleInputChange('availability.available_from', e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">メモ</label>
                <textarea
                  value={formData.availability.memo}
                  onChange={(e) => handleInputChange('availability.memo', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  rows={3}
                  placeholder="稼働状況に関する追加情報"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* スキル */}
        <Card>
          <CardHeader>
            <CardTitle>スキル</CardTitle>
            <CardDescription>保有スキルとレベルを設定してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">スキル検索・追加</label>
              <Input
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="スキル名で検索..."
                className="mt-1"
              />
            </div>

            {skillSearch && (
              <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                {filteredSkills?.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => addSkill(skill)}
                  >
                    <span>{skill.name}</span>
                    <span className="text-xs text-muted-foreground">{skill.category}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 選択されたスキル */}
            <div className="space-y-3">
              {selectedSkills.map((skillData) => {
                const skill = skills?.find(s => s.id === skillData.skill_id)
                return (
                  <div key={skillData.skill_id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{skill?.name}</p>
                        <p className="text-sm text-muted-foreground">{skill?.category}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skillData.skill_id)}
                      >
                        削除
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">レベル (1-5)</label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={skillData.level}
                          onChange={(e) => updateSkill(skillData.skill_id, 'level', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">経験年数</label>
                        <Input
                          type="number"
                          min="0"
                          value={skillData.years_experience}
                          onChange={(e) => updateSkill(skillData.skill_id, 'years_experience', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? '登録中...' : '社員を登録'}
          </Button>
        </div>
      </form>
    </div>
  )
}