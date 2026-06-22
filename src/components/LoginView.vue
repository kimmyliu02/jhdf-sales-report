<script setup>
import { ref } from 'vue'
import { loginWithUsername } from '../lib/supabase.js'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  if (!username.value || !password.value) { error.value = '请填写用户名和密码'; return }
  loading.value = true
  const result = await loginWithUsername(username.value, password.value)
  loading.value = false
  if (result.error) error.value = result.error
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 mb-4">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h1 class="text-xl font-semibold text-gray-900">销售日报</h1>
        <p class="text-sm text-gray-500 mt-1">请登录继续</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1.5">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="例：sales1"
              autocomplete="username"
              class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keydown.enter="login"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1.5">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keydown.enter="login"
            />
          </div>

          <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>

          <button
            @click="login"
            :disabled="loading"
            class="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
