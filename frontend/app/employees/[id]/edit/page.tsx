'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { Employee, Skill, AvailabilityStatus } from '@/types'

interface EditEmployeePageProps {
  params: {
    id: string
  }
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const employeeId = parseInt(params.id)

  const [formData, setFormData] = useState({
    name: '',
    years_experience: 0,
    main_role: '',
    unit_price_min: '',
    unit_price_max: '',
    desired_career: '',
  })

  const [availabilityData, setAvailabilityData] = useState({
    status: 'working' as AvailabilityStatus,
    available_from: '',
    memo: ''
  })

  const { data: employee, isLoading: employeeLoading } = useQuery<Employee>({
    queryKey: ['employee', employeeId],
    queryFn: () => api.employees.getById(employeeId),
  })

  const { data: skills, isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: () => api.skills.getAll(),
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        years_experience: employee.years_experience,
        main_role: employee.main_role,
        unit_price_min: employee.unit_price_min?.toString() || '',
        unit_price_max: employee.unit_price_max?.toString() || '',
        desired_career: employee.desired_career || '',
      })

      if (employee.availability) {
        setAvailabilityData({
          status: employee.availability.status,
          available_from: employee.availability.available_from ?
            employee.availability.available_from.split('T')[0] : '',
          memo: employee.availability.memo || ''
        })
      }
    }
  }, [employee])

  const updateEmployeeMutation = useMutation({
    mutationFn: (data: any) => api.employees.update(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      router.push(`/employees/${employeeId}`)
    },
    onError: (error) => {
      console.error('更新エラー:', error)
      alert('社員情報の更新に失敗しました。')
    },
  })

  const updateAvailabilityMutation = useMutation({
    mutationFn: (data: any) => api.availability.update(employeeId, data),
    onError: (error) => {
      console.error('稼働状況更新エラー:', error)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.main_role) {
      alert('名前と主要ロールは必須です。')
      return
    }

    try {
      const employeeUpdateData = {
        name: formData.name,
        years_experience: formData.years_experience,
        main_role: formData.main_role,
        unit_price_min: formData.unit_price_min ? parseInt(formData.unit_price_min) : undefined,
        unit_price_max: formData.unit_price_max ? parseInt(formData.unit_price_max) : undefined,
        desired_career: formData.desired_career,
      }

      await updateEmployeeMutation.mutateAsync(employeeUpdateData)

      // 稼働状況を更新
      if (employee?.availability) {
        await updateAvailabilityMutation.mutateAsync({
          status: availabilityData.status,
          available_from: availabilityData.available_from || undefined,
          memo: availabilityData.memo
        })
      }

    } catch (error) {
      console.error('更新エラー:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAvailabilityChange = (field: string, value: any) => {
    setAvailabilityData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (employeeLoading || skillsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>読み込み中...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">社員が見つかりませんでした。</p>
        <Button asChild className="mt-4">
          <a href="/employees">一覧に戻る</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">社員情報編集</h1>
        <p className="text-muted-foreground">
          {employee.name}の情報を編集します
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>社員の基本的な情報を編集してください</CardDescription>
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
          {employee.availability && (
            <Card>
              <CardHeader>
                <CardTitle>稼働状況</CardTitle>
                <CardDescription>現在の稼働状況を編集してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">稼働ステータス</label>
                  <select
                    value={availabilityData.status}
                    onChange={(e) => handleAvailabilityChange('status', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="working">稼働中</option>
                    <option value="available_next_month">来月空き</option>
                    <option value="immediately_available">即稼働可能</option>
                  </select>
                </div>

                {availabilityData.status !== 'working' && (
                  <div>
                    <label className="text-sm font-medium">稼働開始可能日</label>
                    <Input
                      type="date"
                      value={availabilityData.available_from}
                      onChange={(e) => handleAvailabilityChange('available_from', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">メモ</label>
                  <textarea
                    value={availabilityData.memo}
                    onChange={(e) => handleAvailabilityChange('memo', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    rows={3}
                    placeholder="稼働状況に関する追加情報"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 現在のスキル表示 */}
        <Card>
          <CardHeader>
            <CardTitle>現在のスキル</CardTitle>
            <CardDescription>
              現在登録されているスキル情報（スキルの編集は将来的に実装予定）
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employee.skills.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {employee.skills.map((skill) => (
                  <div key={skill.skill_id} className="border rounded-lg p-3">
                    <div className="space-y-1">
                      <p className="font-medium">{skill.skill_name}</p>
                      <p className="text-sm text-muted-foreground">{skill.skill_category}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>レベル: {skill.level}</span>
                        <span>経験: {skill.years_experience}年</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">スキル情報がありません</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/employees/${employeeId}`)}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={updateEmployeeMutation.isPending}
          >
            {updateEmployeeMutation.isPending ? '更新中...' : '変更を保存'}
          </Button>
        </div>
      </form>
    </div>
  )
}