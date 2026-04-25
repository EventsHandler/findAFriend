<script setup lang="ts">
import { CreateEventDocument, EventsListDocument } from '@/api/graphql'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

const filter = ref('')

const { result, refetch, loading } = useQuery(EventsListDocument, () => ({
  filter: filter.value,
}))

const newEventName = ref('')

const { mutate } = useMutation(CreateEventDocument)

async function createEvent() {
  if (!newEventName.value) return

  try {
    await mutate({
      name: newEventName.value,
    })
    newEventName.value = ''
    refetch()
  } catch (error) {
    console.error('Error creating event:', error)
  }
}
</script>

<template>
  <div>
    <form @submit.prevent="createEvent">
      <fieldset>
        <label for="name">Name of new event</label>
        <input type="text" id="name" v-model="newEventName" placeholder="New event name" />
      </fieldset>
      <button type="submit">Create new event</button>
    </form>
    <div v-if="loading">Loading...</div>
    <div>
      <input type="text" v-model="filter" placeholder="Filter events" />
    </div>
    <ul v-if="result?.events">
      <li v-for="event in result.events" :key="event.id">
        <h2>{{ event.name }}</h2>
      </li>
    </ul>
  </div>
</template>
