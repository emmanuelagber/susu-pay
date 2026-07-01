import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { apiGetCircles } from '../lib/api'
import type { Circle } from '../types'

export function useSelectedCircle(): {
  circleId: string
  selectedCircle: Circle | undefined
  setCircleId: (id: string) => void
  circles: Circle[]
  isLoading: boolean
} {
  const { user, accessToken } = useAuth()
  const [params, setParams] = useSearchParams()

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['circles', user?.id],
    queryFn: () => apiGetCircles(user!.id, accessToken!, 1, 20),
    enabled: !!user && !!accessToken,
  })

  // Guard
  const circles: Circle[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as unknown as Record<string, unknown>)?.items)
      ? ((rawData as unknown as Record<string, unknown>).items as Circle[])
      : []

  const paramId = params.get('circleId')
  const circleId = (paramId && circles.some(c => c.id === paramId) ? paramId : circles[0]?.id) ?? ''
  const selectedCircle = circles.find(c => c.id === circleId)

  const setCircleId = (id: string) => {
    setParams(prev => {
      prev.set('circleId', id)
      return prev
    })
  }

  return { circleId, selectedCircle, setCircleId, circles, isLoading }
}
