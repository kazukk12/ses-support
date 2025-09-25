import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const availabilityStatusLabels = {
  working: '稼働中',
  available_next_month: '来月空き',
  immediately_available: '即稼働可能',
}

export const oneOnOneStatusLabels = {
  good: '良好',
  normal: '普通',
  attention: '注意',
}

export const oneOnOneStatusColors = {
  good: 'bg-green-100 text-green-800',
  normal: 'bg-yellow-100 text-yellow-800',
  attention: 'bg-red-100 text-red-800',
}