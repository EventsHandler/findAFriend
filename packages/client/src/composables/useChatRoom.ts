import { useRouter } from 'vue-router'

export function useChatRoom() {
  const router = useRouter()

  function openChat(locationId: string | null | undefined) {
    if (!locationId) return
    router.push(`/chat/${encodeURIComponent(locationId)}`)
  }

  function chatLink(locationId: string | null | undefined) {
    return locationId ? `/chat/${encodeURIComponent(locationId)}` : '/chat'
  }

  return {
    openChat,
    chatLink,
  }
}
