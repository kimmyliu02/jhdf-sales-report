<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase.js'

const props = defineProps({ user: Object, displayName: String })

const loading = ref(true)
const visits = ref([])
const filterRep = ref('')
const filterProgress = ref('')
const filterDate = ref('')

const progressStyle = {
  '跟进中':   'bg-amber-50 text-amber-800',
  '已成交':   'bg-green-50 text-green-800',
  '新线索':   'bg-blue-50 text-blue-800',
  '暂无意向': 'bg-gray-100 text-gray-600',
}

async function loadAll() {
  loading.value = true
  const { data, error } = await supabase
    .from('sr_visits')
    .select('*')
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false })
  loading.value = false
  if (!error) visits.value = data
}

const repNames = computed(() => [...new Set(visits.value.map(v => v.rep_name))].sort())
const allDates = computed(() => [...new Set(visits.value.map(v => v.visit_date))].sort((a,b)=>b.localeCompare(a)))

const filtered = computed(() => visits.value.filter(v =>
  (!filterRep.value     || v.rep_name === filterRep.value) &&
  (!filterProgress.value|| v.progress === filterProgress.value) &&
  (!filterDate.value    || v.visit_date === filterDate.value)
))

const today = new Date().toISOString().slice(0, 10)
const todayVisits = computed(() => visits.value.filter(v => v.visit_date === today))
const todayDeals  = computed(() => todayVisits.value.filter(v => v.progress === '已成交'))
const todayReps   = computed(() => new Set(todayVisits.value.map(v => v.rep_name)).size)

function grouped() {
  const map = {}
  for (const v of filtered.value) {
    (map[v.visit_date] = map[v.visit_date] || []).push(v)
  }
  return Object.entries(map).sort((a,b) => b[0].localeCompare(a[0]))
}

function fmtDate(d) {
  const t = new Date().toISOString().slice(0,10)
  const y = new Date(Date.now()-86400000).toISOString().slice(0,10)
  if (d === t) return `今天 ${d}`
  if (d === y) return `昨天 ${d}`
  return d
}

function clearFilters() {
  filterRep.value = ''
  filterProgress.value = ''
  filterDate.value = ''
}

async function logout() {
  await supabase.auth.signOut()
}

onMounted(loadAll)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <span class="font-semibold text-gray-900 text-sm">管理看板</span>
      </div>
      <div class="flex items-center gap-3">
        <button @click="loadAll" class="text-xs text-blue-600 hover:text-blue-700 font-medium">刷新</button>
        <button @click="logout" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">退出</button>
      </div>
    </header>

    <div class="px-4 py-4 max-w-lg mx-auto space-y-4">

      <!-- Today stats -->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p class="text-2xl font-semibold text-gray-900">{{ todayVisits.length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">今日拜访</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p class="text-2xl font-semibold text-green-600">{{ todayDeals.length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">今日成交</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <p class="text-2xl font-semibold text-blue-600">{{ todayReps }}</p>
          <p class="text-xs text-gray-400 mt-0.5">出勤人数</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl border border-gray-100 px-4 py-3 space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500">筛选</p>
          <button v-if="filterRep||filterProgress||filterDate" @click="clearFilters" class="text-xs text-blue-500 hover:text-blue-700">清除</button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <select v-model="filterRep" class="px-2 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">全部业务员</option>
            <option v-for="r in repNames" :key="r">{{ r }}</option>
          </select>
          <select v-model="filterProgress" class="px-2 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">全部进度</option>
            <option>跟进中</option>
            <option>已成交</option>
            <option>新线索</option>
            <option>暂无意向</option>
          </select>
          <select v-model="filterDate" class="px-2 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">全部日期</option>
            <option v-for="d in allDates" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
      </div>

      <!-- Results -->
      <div>
        <p class="text-xs text-gray-400 px-1 mb-2">共 {{ filtered.length }} 条记录</p>

        <div v-if="loading" class="text-center py-10 text-sm text-gray-400">加载中...</div>

        <template v-else-if="grouped().length">
          <div v-for="[date, items] in grouped()" :key="date" class="mb-4">
            <p class="text-xs font-semibold text-gray-400 uppercase mb-2 px-1">{{ fmtDate(date) }}</p>
            <div class="space-y-2">
              <div v-for="v in items" :key="v.id" class="bg-white rounded-2xl border border-gray-100 px-4 py-3">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <p class="text-sm font-semibold text-gray-900 leading-snug">{{ v.hotel_name }}</p>
                  <span :class="['shrink-0 text-xs px-2 py-0.5 rounded-full font-medium', progressStyle[v.progress]]">{{ v.progress }}</span>
                </div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs text-blue-600 font-medium">{{ v.rep_name }}</span>
                  <span class="text-gray-300 text-xs">·</span>
                  <span class="text-xs text-gray-500">{{ v.activity }}</span>
                </div>
                <p v-if="v.contact_name" class="text-xs text-gray-600">
                  {{ v.contact_name }}<span v-if="v.contact_phone" class="text-gray-400"> · {{ v.contact_phone }}</span>
                </p>
                <p v-if="v.notes" class="text-xs text-gray-400 mt-1 italic">{{ v.notes }}</p>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="text-center py-10 text-sm text-gray-400">暂无记录</div>
      </div>
    </div>
  </div>
</template>
