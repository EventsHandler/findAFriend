<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { useRouter } from 'vue-router'
import { LoginDocument, RegisterDocument } from '../api/graphql'

const isLogin = ref(true)
const name = ref('')
const password = ref('')
const error = ref('')

const router = useRouter()

const { mutate: loginMutate, loading: loginLoading } = useMutation(LoginDocument)
const { mutate: registerMutate, loading: registerLoading } = useMutation(RegisterDocument)

const handleSubmit = async () => {
  error.value = ''
  try {
    if (isLogin.value) {
      const res = await loginMutate({ name: name.value, password: password.value })
      if (res?.data?.login) {
        localStorage.setItem('token', res.data.login.token)
        router.push('/me')
      }
    } else {
      const res = await registerMutate({ name: name.value, password: password.value })
      if (res?.data?.register) {
        localStorage.setItem('token', res.data.register.token)
        router.push('/me')
      }
    }
  } catch (e: any) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0b0f0c] text-white font-sans flex flex-col items-center justify-center p-4">
    <!-- HUD Decoration -->
    <div class="absolute top-4 left-4 flex items-center gap-2">
      <svg class="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3"/>
        <circle cx="12" cy="12" r="6" stroke="currentColor" opacity="0.6"/>
        <path d="M12 12 L20 6" stroke="currentColor"/>
      </svg>
      <span class="text-sm tracking-widest text-lime-300">SYSTEM {{ isLogin ? 'AUTH' : 'REGISTRATION' }}</span>
    </div>

    <div class="w-full max-w-md bg-[#101712] border border-lime-500/20 p-8 rounded-2xl shadow-[0_0_30px_rgba(132,255,122,0.05)] relative overflow-hidden">
      <!-- Grid Overlay -->
      <div class="absolute inset-0 opacity-10 pointer-events-none"
           style="background-image: linear-gradient(#1a2a1f 1px, transparent 1px), linear-gradient(90deg, #1a2a1f 1px, transparent 1px); background-size: 20px 20px;">
      </div>

      <div class="relative z-10">
        <h1 class="text-2xl font-bold text-lime-400 mb-6 tracking-widest uppercase">
          {{ isLogin ? 'Login' : 'Register' }}
        </h1>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-xs text-gray-400 mb-2 tracking-widest uppercase">Username</label>
            <input 
              v-model="name"
              type="text" 
              class="w-full bg-[#0b0f0c] border border-lime-500/30 rounded-xl p-3 text-sm focus:outline-none focus:border-lime-400 transition-colors"
              placeholder="Enter operator name..."
              required
            />
          </div>

          <div>
            <label class="block text-xs text-gray-400 mb-2 tracking-widest uppercase">Password</label>
            <input 
              v-model="password"
              type="password" 
              class="w-full bg-[#0b0f0c] border border-lime-500/30 rounded-xl p-3 text-sm focus:outline-none focus:border-lime-400 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="error" class="text-red-400 text-xs bg-red-400/10 p-2 rounded-lg border border-red-400/20">
            {{ error }}
          </div>

          <button 
            type="submit"
            :disabled="loginLoading || registerLoading"
            class="w-full py-3 bg-lime-500 text-black font-bold rounded-xl hover:bg-lime-400 transition-colors shadow-[0_0_15px_rgba(132,255,122,0.3)] disabled:opacity-50"
          >
            {{ isLogin ? 'INITIALIZE LINK' : 'CREATE PROFILE' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button 
            @click="isLogin = !isLogin"
            class="text-xs text-gray-400 hover:text-lime-300 transition-colors uppercase tracking-widest"
          >
            {{ isLogin ? 'Need a new profile? Register' : 'Already have a profile? Login' }}
          </button>
        </div>
      </div>
    </div>

    <!-- HUD Footer -->
    <div class="mt-8 flex gap-4 opacity-50">
      <div class="h-1 w-12 bg-lime-500/30 rounded-full"></div>
      <div class="h-1 w-24 bg-orange-500/30 rounded-full"></div>
      <div class="h-1 w-12 bg-lime-500/30 rounded-full"></div>
    </div>
  </div>
</template>
