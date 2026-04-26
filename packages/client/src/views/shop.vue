<script setup lang="ts">
import { useQuery, useMutation } from '@vue/apollo-composable'
import { MeDocument, AddPointsDocument, CratesDocument } from '../api/graphql'
import { computed } from 'vue'

const { result, refetch } = useQuery(MeDocument)
const user = computed(() => result.value?.me)

const { result: cratesResult } = useQuery(CratesDocument)
const { mutate } = useMutation(AddPointsDocument)

async function addPoints() {
  if (!user.value?.id) return
  try {
    await mutate({
      userId: user?.value?.id,
      amount: 100,
    })

    await refetch()
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
</template>