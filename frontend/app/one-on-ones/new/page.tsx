'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { EmployeeList, OneOnOneStatus } from '@/types'

export default function NewOneOnOnePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const preselectedEmployeeId = searchParams.get('employee_id')

  const [formData, setFormData] = useState({
    employee_id: preselectedEmployeeId ? parseInt(preselectedEmployeeId) : 0,
    date: new Date().toISOString().split('T')[0],
    memo: '',
    status: 'normal' as OneOnOneStatus,
  })

  const { data: employees, isLoading: employeesLoading } = useQuery<EmployeeList[]>({
    queryKey: ['employees'],
    queryFn: api.employees.getAll,
  })

  const createMutation = useMutation({
    mutationFn: api.oneOnOnes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-on-ones'] })
      queryClient.invalidateQueries({ queryKey: ['completion-rate'] })
      router.push('/one-on-ones')
    },
    onError: (error) => {
      console.error('作成エラー:', error)
      alert('1on1記録の作成に失敗しました。')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employee_id || !formData.date) {
      alert('社員と日付を選択してください。')
      return
    }

    createMutation.mutate({
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

  if (employeesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">新規1on1記録</h1>
        <p className="text-muted-foreground">
          新しい1on1記録を作成します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1on1記録</CardTitle>
          <CardDescription>実施した1on1の詳細を記録してください</CardDescription>
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? '作成中...' : '記録を保存'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}