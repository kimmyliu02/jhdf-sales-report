<script setup>
import { ref, onMounted } from 'vue'
import { supabase, BOSS_EMAILS, USERS } from './lib/supabase.js'
import LoginView from './components/LoginView.vue'
import RepView from './components/RepView.vue'
import BossView from './components/BossView.vue'

const session = ref(null)
const loading = ref(true)

function isBoss(user) {
  return BOSS_EMAILS.includes(user?.email)
}

function displayName(user) {
  const match = Object.values(USERS).find(u => u.email === user?.email)
  return match?.display || user?.email
}

onMounted(async () => {
  const { data: { session: s } } = await supabase.auth.getSession()
  session.value = s
  loading.value = false
  supabase.auth.onAuthStateChange((_event, s) => {
    session.value = s
  })
})
</script>

<template>
  <div>
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <p class="text-sm text-gray-400">加载中...</p>
    </div>
    <template v-else>
      <LoginView v-if="!session" />
      <BossView v-else-if="isBoss(session.user)" :user="session.user" :display-name="displayName(session.user)" />
      <RepView  v-else :user="session.user" :display-name="displayName(session.user)" />
    </template>
  </div>
</template>
