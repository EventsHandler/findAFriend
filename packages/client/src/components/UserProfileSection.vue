<script setup lang="ts">
import { useMutation, useQuery } from '@vue/apollo-composable'
import { GenerateUserProfileDocument, MeDocument, type InterestTag } from '../api/graphql'
import { ref, computed } from 'vue'
import UiCard from '../ui/UiCard.vue'
import UiButton from '../ui/UiButton.vue'
import UiBadge from '../ui/UiBadge.vue'

interface Props {
  userId: string
  profileDescription: string
  profileTags: InterestTag[]
}

const props = defineProps<Props>()

const TAG_TRANSLATIONS: Record<InterestTag, string> = {
  NATURE: 'Natură',
  FOOD: 'Mâncare',
  CULTURE: 'Cultură',
  ENTERTAINMENT: 'Divertisment',
  SPORTS: 'Sport',
  RELAXATION: 'Relaxare',
  ADVENTURE: 'Aventură',
  SHOPPING: 'Shopping',
  HISTORY: 'Istorie',
  ART: 'Artă',
}

const showInput = ref(false)
const descriptionInput = ref('')
const isGenerating = ref(false)

const { mutate: generateProfile } = useMutation(GenerateUserProfileDocument)
const { refetch: refetchMe } = useQuery(MeDocument)

const handleGenerateProfile = async () => {
  if (!descriptionInput.value.trim()) return

  isGenerating.value = true
  try {
    await generateProfile({
      description: descriptionInput.value,
    })
    await refetchMe()
    descriptionInput.value = ''
    showInput.value = false
  } catch (error) {
    console.error('Failed to generate profile:', error)
  } finally {
    isGenerating.value = false
  }
}

const hasProfile = computed(() => props.profileDescription.length > 0)

const translateTag = (tag: InterestTag) => TAG_TRANSLATIONS[tag] || tag

const getToneForTag = (tag: InterestTag): 'neutral' | 'success' | 'warning' | 'info' | 'danger' => {
  switch (tag) {
    case 'NATURE':
    case 'ADVENTURE':
      return 'success'
    case 'FOOD':
    case 'SHOPPING':
      return 'warning'
    case 'CULTURE':
    case 'HISTORY':
    case 'ART':
      return 'info'
    case 'ENTERTAINMENT':
    case 'SPORTS':
      return 'danger'
    case 'RELAXATION':
    default:
      return 'neutral'
  }
}
</script>

<template>
  <section class="space-y-3">
    <div class="px-2">
      <h2 class="text-[10px] text-white/55 mb-3 tracking-[0.2em] uppercase cursor-default">Profilul Tău</h2>
    </div>
    <UiCard variant="surface">
      <div class="space-y-4">
        <!-- Afișare profil existent -->
        <div v-if="hasProfile" class="space-y-3">
          <p class="text-sm text-white/80 leading-relaxed">{{ profileDescription }}</p>
          <div class="flex flex-wrap gap-2">
            <UiBadge
              v-for="tag in profileTags"
              :key="tag"
              :tone="getToneForTag(tag)"
            >
              {{ translateTag(tag) }}
            </UiBadge>
          </div>

          <!-- Buton pentru a arăta input-ul -->
          <UiButton
            v-if="!showInput"
            variant="ghost"
            size="sm"
            class="w-full"
            @click="showInput = true"
          >
            Regenerare Profil
          </UiButton>
        </div>

        <!-- Input pentru descriere (vizibil când showInput este true sau când nu are profil) -->
        <div v-if="showInput || !hasProfile">
          <label class="text-xs text-white/60 uppercase tracking-wider block mb-2">
            {{ hasProfile ? 'Descriere nouă pentru regenerare' : 'Descriere pentru creare profil' }}
          </label>
          <textarea
            v-model="descriptionInput"
            :placeholder="hasProfile ? 'Introdu o descriere nouă...' : 'Ex: Îmi place natura, gastronomia și artă modernă. Mă relaxez în parcuri și cafenele...'"
            :disabled="isGenerating"
            class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--c-accent)] focus:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            rows="3"
          />

          <!-- Butoane pentru generare și anulare -->
          <div class="flex gap-2 mt-3">
            <UiButton
              variant="primary"
              size="sm"
              class="flex-1"
              :disabled="!descriptionInput.trim() || isGenerating"
              @click="handleGenerateProfile"
            >
              {{ isGenerating ? 'Se generează...' : hasProfile ? 'Regenerează' : 'Creează Profil' }}
            </UiButton>
            <UiButton
              v-if="hasProfile"
              variant="ghost"
              size="sm"
              class="flex-1"
              :disabled="isGenerating"
              @click="showInput = false; descriptionInput = ''"
            >
              Anulează
            </UiButton>
          </div>
        </div>

        <!-- Mesaj când nu are profil și nu arată input-ul -->
        <div v-else-if="!hasProfile" class="text-center py-6">
          <p class="text-sm text-white/60">Nu ai încă un profil personalizat</p>
          <UiButton variant="primary" size="sm" class="w-full mt-3" @click="showInput = true">
            Creează Profil
          </UiButton>
        </div>
      </div>
    </UiCard>
  </section>
</template>
