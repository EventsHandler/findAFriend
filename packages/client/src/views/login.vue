<script setup lang="ts">
import { ref } from 'vue'
import { useApolloClient, useMutation } from '@vue/apollo-composable'
import { useRouter } from 'vue-router'
import { LoginDocument, RegisterDocument } from '../api/graphql'
import UiCard from '../ui/UiCard.vue'
import UiInput from '../ui/UiInput.vue'
import UiButton from '../ui/UiButton.vue'

const isLogin = ref(true)
const name = ref('')
const password = ref('')
const error = ref('')

const router = useRouter()
const { client: apollo } = useApolloClient()

const { mutate: loginMutate, loading: loginLoading } = useMutation(LoginDocument)
const { mutate: registerMutate, loading: registerLoading } = useMutation(RegisterDocument)

function friendlyAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e ?? '')
  const m = msg.toLowerCase()
  if (m.includes('network') || m.includes('failed to fetch') || m.includes('ecconn') || m.includes('timeout')) {
    return 'Nu pot contacta serverul. Verifică internetul și încearcă din nou.'
  }
  if (m.includes('invalid') || m.includes('unauthorized') || m.includes('auth') || m.includes('parol') || m.includes('password')) {
    return 'Utilizator sau parolă incorecte.'
  }
  if (m.includes('already') || m.includes('exists')) {
    return 'Acest utilizator există deja. Încearcă să te autentifici.'
  }
  return msg || 'A apărut o eroare. Încearcă din nou.'
}

const handleSubmit = async () => {
  error.value = ''
  try {
    if (isLogin.value) {
      const res = await loginMutate({ name: name.value, password: password.value })
      if (res?.data?.login) {
        localStorage.setItem('token', res.data.login.token)
        // Ensure subsequent pages don't reuse unauthenticated cached results (e.g. Me -> null).
        await apollo.clearStore()
        router.push('/me')
      }
    } else {
      const res = await registerMutate({ name: name.value, password: password.value })
      if (res?.data?.register) {
        localStorage.setItem('token', res.data.register.token)
        await apollo.clearStore()
        router.push('/me')
      }
    }
  } catch (e: any) {
    error.value = friendlyAuthError(e)
  }
}
</script>

<template>
  <div class="app-screen flex flex-col items-center justify-center p-4">
    <!-- HUD Decoration -->
    <div class="absolute top-4 left-4 flex items-center gap-2">
      <svg class="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3"/>
        <circle cx="12" cy="12" r="6" stroke="currentColor" opacity="0.6"/>
        <path d="M12 12 L20 6" stroke="currentColor"/>
      </svg>
      <span class="text-sm tracking-widest text-lime-300">SISTEM {{ isLogin ? 'AUTENTIFICARE' : 'ÎNREGISTRARE' }}</span>
    </div>

    <UiCard class="w-full max-w-md relative overflow-hidden" :padded="false">
      <div
        class="absolute inset-0 opacity-10 pointer-events-none"
        style="background-image: linear-gradient(#1a2a1f 1px, transparent 1px), linear-gradient(90deg, #1a2a1f 1px, transparent 1px); background-size: 20px 20px;"
      />

      <div class="relative p-6 sm:p-8">
        <h1 class="text-xl sm:text-2xl font-bold text-[var(--c-accent)] mb-6 tracking-widest uppercase">
          {{ isLogin ? 'Autentificare' : 'Înregistrare' }}
        </h1>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <UiInput
            v-model="name"
            label="Utilizator"
            placeholder="Numele tău…"
            autocomplete="username"
            required
          />

          <UiInput
            v-model="password"
            label="Parolă"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            hint="Minim 8 caractere recomandat."
          />

          <div v-if="error" class="text-red-300 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20">
            {{ error }}
          </div>

          <UiButton type="submit" :loading="loginLoading || registerLoading" :disabled="loginLoading || registerLoading" block>
            {{ isLogin ? 'CONECTEAZĂ' : 'CREEAZĂ PROFIL' }}
          </UiButton>
        </form>

        <div class="mt-6 text-center">
          <UiButton variant="ghost" size="sm" @click="isLogin = !isLogin">
            {{ isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Autentifică-te' }}
          </UiButton>
        </div>
      </div>
    </UiCard>

    <!-- HUD Footer -->
    <div class="mt-8 flex gap-4 opacity-50">
      <div class="h-1 w-12 bg-lime-500/30 rounded-full"></div>
      <div class="h-1 w-24 bg-orange-500/30 rounded-full"></div>
      <div class="h-1 w-12 bg-lime-500/30 rounded-full"></div>
    </div>
  </div>
</template>
