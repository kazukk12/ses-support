'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { Employee } from '@/types'
import { availabilityStatusLabels, oneOnOneStatusLabels, formatDate, oneOnOneStatusColors } from '@/lib/utils'

interface EmployeeDetailPageProps {
  params: {
    id: string
  }
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const employeeId = parseInt(params.id)

  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ['employee', employeeId],
    queryFn: () => api.employees.getById(employeeId),
  })

  if (isLoading) {
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
        <Link href="/employees">
          <Button className="mt-4">一覧に戻る</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{employee.name}</h1>
          <p className="text-muted-foreground">
            {employee.main_role} • 経験{employee.years_experience}年
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/employees/${employee.id}/edit`}>
            <Button variant="outline">編集</Button>
          </Link>
          <Link href="/employees">
            <Button>一覧に戻る</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">氏名</p>
                <p>{employee.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">経験年数</p>
                <p>{employee.years_experience}年</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">主要ロール</p>
                <p>{employee.main_role}</p>
              </div>
              {(employee.unit_price_min || employee.unit_price_max) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">単価レンジ</p>
                  <p>
                    {employee.unit_price_min?.toLocaleString()}円 - {employee.unit_price_max?.toLocaleString()}円
                  </p>
                </div>
              )}
              {employee.desired_career && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">希望キャリア</p>
                  <p className="whitespace-pre-wrap">{employee.desired_career}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {employee.availability && (
            <Card>
              <CardHeader>
                <CardTitle>稼働状況</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ステータス</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.availability.status === 'working' ? 'bg-brand-100 text-brand-800' :
                    employee.availability.status === 'available_next_month' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-brand-100 text-brand-800'
                  }`}>
                    {availabilityStatusLabels[employee.availability.status]}
                  </span>
                </div>
                {employee.availability.available_from && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">稼働開始可能日</p>
                    <p>{formatDate(employee.availability.available_from)}</p>
                  </div>
                )}
                {employee.availability.memo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">メモ</p>
                    <p className="whitespace-pre-wrap">{employee.availability.memo}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>スキル</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.skills.length > 0 ? (
                <div className="space-y-4">
                  {employee.skills.map((skill) => (
                    <div key={skill.skill_id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{skill.skill_name}</p>
                          <p className="text-sm text-muted-foreground">{skill.skill_category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">レベル {skill.level}</p>
                          <p className="text-xs text-muted-foreground">経験 {skill.years_experience}年</p>
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

          <Card>
            <CardHeader>
              <CardTitle>案件経歴</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.projects.length > 0 ? (
                <div className="space-y-4">
                  {employee.projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="border-b pb-3 last:border-b-0">
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-sm text-muted-foreground">{project.role}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(project.start_date)} - {project.end_date ? formatDate(project.end_date) : '現在'}
                        </p>
                        {project.tech_tags && (
                          <div className="flex flex-wrap gap-1">
                            {project.tech_tags.split(',').map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {employee.projects.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      他 {employee.projects.length - 5} 件の案件
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">案件経歴がありません</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>1on1記録</CardTitle>
                <Link href={`/one-on-ones/new?employee_id=${employee.id}`}>
                  <Button size="sm">記録追加</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {employee.one_on_ones.length > 0 ? (
                <div className="space-y-4">
                  {employee.one_on_ones.slice(0, 5).map((oneOnOne) => (
                    <div key={oneOnOne.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {formatDate(oneOnOne.date)}
                          </p>
                          {oneOnOne.memo && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {oneOnOne.memo}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${oneOnOneStatusColors[oneOnOne.status]}`}>
                          {oneOnOneStatusLabels[oneOnOne.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                  {employee.one_on_ones.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      他 {employee.one_on_ones.length - 5} 件の記録
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">1on1記録がありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}