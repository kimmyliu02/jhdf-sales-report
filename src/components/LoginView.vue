<script setup>
import { ref } from 'vue'
import { loginWithUsername } from '../lib/supabase.js'
import logoUrl from '../assets/logo.svg'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  if (!username.value || !password.value) { error.value = '请输入用户名和密码'; return }
  loading.value = true
  const result = await loginWithUsername(username.value, password.value)
  loading.value = false
  if (result.error) error.value = result.error
}
</script>

<template>
  <main class="min-h-screen bg-[#edf2ff] px-6 flex items-center justify-center">
    <div class="w-full max-w-sm">
      <div class="mb-11">
        <div class="h-[64px] w-[64px] rounded-[18px] bg-white p-2 shadow-[0_12px_28px_rgba(64,93,210,.18)] grid place-items-center"><img :src="logoUrl" alt="嘉和鼎丰" class="h-full w-full object-contain" /></div>
        <h1 class="mt-5 text-[30px] tracking-[-1.4px] font-bold text-slate-800">嘉和鼎丰</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500">销售汇报</p>
      </div>

      <form @submit.prevent="login" class="rounded-[20px] border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(55,74,130,.10)]">
        <div class="mb-4"><label class="mb-2 block text-xs text-slate-500">用户名</label><input v-model="username" autocomplete="username" placeholder="例如：sales1" class="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
        <div class="mb-5"><label class="mb-2 block text-xs text-slate-500">登录密码</label><input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码" class="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div>
        <p v-if="error" class="mb-3 text-center text-xs text-rose-500">{{ error }}</p>
        <button :disabled="loading" class="w-full rounded-xl bg-slate-800 py-3 text-[15px] font-semibold text-white transition active:scale-[.985] disabled:opacity-60">{{ loading ? '登录中…' : '登录' }}</button>
      </form>

      <p class="mt-10 text-center text-[11px] text-slate-400">登录即代表你同意《服务协议》和《隐私政策》</p>
    </div>
  </main>
</template>
