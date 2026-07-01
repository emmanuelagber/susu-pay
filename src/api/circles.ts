import { apiGet, apiPatch } from './_client'
// import { mock_getCircleSettings, mock_updateCircleSettings } from '../mocks/circles'
import type { CircleSettingsData, CircleSettingsPatch } from '../types/sprint2'

export async function getCircleSettings(
  circleId: string,
  token: string,
): Promise<CircleSettingsData | null> {
  // if (USE_MOCK) return mock_getCircleSettings(circleId)
  return apiGet<CircleSettingsData>(`/circles/${circleId}/settings`, token)
}

export async function updateCircleSettings(
  circleId: string,
  patch: CircleSettingsPatch,
  token: string,
): Promise<CircleSettingsData> {
  // if (USE_MOCK) return mock_updateCircleSettings(circleId, patch)
  return apiPatch<CircleSettingsData>(`/circles/${circleId}/settings`, patch, token)
}
