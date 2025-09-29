import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Traduz status de campanha para português
 */
export function translateCampaignStatus(status: string): string {
  const translations: Record<string, string> = {
    'active': 'Ativa',
    'scheduled': 'Agendada',
    'paused': 'Pausada',
    'expired': 'Expirada',
    'draft': 'Rascunho'
  }
  return translations[status?.toLowerCase()] || status
}