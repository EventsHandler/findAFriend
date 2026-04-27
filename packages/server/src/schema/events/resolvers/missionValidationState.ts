type ClaimKey = `${string}:${string}` // `${userId}:${missionId}`

const claimedAtByUserMission = new Map<ClaimKey, number>()
const lastUpdateAtByKey = new Map<string, number>()

export function setClaimedNow(userId: string, missionId: string) {
  claimedAtByUserMission.set(`${userId}:${missionId}`, Date.now())
}

export function getClaimedAtMs(userId: string, missionId: string) {
  return claimedAtByUserMission.get(`${userId}:${missionId}`) ?? null
}

export function canUpdateProgressNow(key: string, minIntervalMs: number) {
  const now = Date.now()
  const last = lastUpdateAtByKey.get(key) ?? 0
  if (now - last < minIntervalMs) return false
  lastUpdateAtByKey.set(key, now)
  return true
}

