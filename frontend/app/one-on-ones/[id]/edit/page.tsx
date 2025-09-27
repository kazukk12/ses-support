'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { EmployeeList, OneOnOneStatus } from '@/types'

export default function EditOneOnOnePage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const oneOnOneId = params.id as string

  const [formData, setFormData] = useState({
    employee_id: 0,
    date: '',
    memo: '',
    status: 'normal' as OneOnOneStatus,
  })

  const { data: oneOnOne, isLoading: oneOnOneLoading } = useQuery({
    queryKey: ['one-on-one', oneOnOneId],
    queryFn: () => api.oneOnOnes.getById(parseInt(oneOnOneId))(),
  })

  const { data: employees, isLoading: employeesLoading } = useQuery<EmployeeList[]>({
    queryKey: ['employees'],
    queryFn: () => api.employees.getAll(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.oneOnOnes.update(parseInt(oneOnOneId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-on-ones'] })
      queryClient.invalidateQueries({ queryKey: ['one-on-one', oneOnOneId] })
      queryClient.invalidateQueries({ queryKey: ['completion-rate'] })
      router.push('/one-on-ones')
    },
    onError: (error) => {
      console.error('更新エラー:', error)
      alert('1on1記録の更新に失敗しました。')
    },
  })

  useEffect(() => {
    if (oneOnOne) {
      setFormData({
        employee_id: oneOnOne.employee_id,
        date: oneOnOne.date.split('T')[0], // ISO形式から日付部分のみ抽出
        memo: oneOnOne.memo || '',
        status: oneOnOne.status,
      })
    }
  }, [oneOnOne])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employee_id || !formData.date) {
      alert('社員と日付を選択してください。')
      return
    }

    updateMutation.mutate({
      employee_id: formData.employee_id,
      date: `${formData.date}T12:00:00`,
      memo: formData.memo,
      status: formData.status,
    })
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  if (oneOnOneLoading || employeesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>読み込み中...</div>
      </div>
    )
  }

  if (!oneOnOne) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">1on1記録が見つかりませんでした。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">1on1記録編集</h1>
        <p className="text-muted-foreground">
          1on1記録の内容を編集します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1on1記録</CardTitle>
          <CardDescription>1on1の詳細を編集してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium">社員 *</label>
              <select
                value={formData.employee_id}
                onChange={(e) => handleInputChange('employee_id', parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                required
              >
                <option value={0}>社員を選択してください</option>
                {employees?.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.main_role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">実施日 *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">ステータス</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="good">良好</option>
                <option value="normal">普通</option>
                <option value="attention">注意</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">メモ</label>
              <textarea
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                rows={6}
                placeholder="1on1で話した内容、気づいたこと、今後のアクションなど..."
              />
            </div>

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
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? '更新中...' : '更新を保存'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}