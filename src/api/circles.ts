import { apiGet, apiPatch } from './_client'

import type { CircleSettingsData, CircleSettingsPatch } from '../types/sprint2'

export async function getCircleSettings(
  circleId: string,
  token: string,
): Promise<CircleSettingsData | null> {
  return apiGet<CircleSettingsData>(`/circles/${circleId}/settings`, token)
}

export async function updateCircleSettings(
  circleId: string,
  patch: CircleSettingsPatch,
  token: string,
): Promise<CircleSettingsData> {
  
  return apiPatch<CircleSettingsData>(`/circles/${circleId}/settings`, patch, token)
}
