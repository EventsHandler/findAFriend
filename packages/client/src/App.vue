<script setup lang="ts">
import { useRoom } from './composables/useRoom'
import { RouterView } from 'vue-router'
import UiBottomNav from './ui/UiBottomNav.vue'
import UiToastHost from './ui/UiToastHost.vue'

const { currentRoomId } = useRoom()
</script>

<template>
  <div class="app-screen font-sans flex flex-col">
    <UiToastHost />
    <RouterView />
    <UiBottomNav :current-room-id="currentRoomId" />
  </div>
</template>

<style>
@import './assets/main.css';
</style>
