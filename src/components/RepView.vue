<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase.js'

const props = defineProps({ user: Object, displayName: String })

const loading = ref(false)
const submitting = ref(false)
const visits = ref([])
const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  visit_date: new Date().toISOString().slice(0, 10),
  hotel_name: '',
  contact_name: '',
  contact_phone: '',
  activity: '初次拜访',
  progress: '跟进中',
  notes: '',
})

const ACTIVITIES = ['初次拜访', '产品介绍 / 送样', '跟进报价', '签合同 / 下单', '售后维护', '其他']
const PROGRESS = ['跟进中', '已成交', '新线索', '暂无意向']

const progressStyle = {
  '跟进中':   'bg-amber-50 text-amber-800',
  '已成交':   'bg-green-50 text-green-800',
  '新线索':   'bg-blue-50 text-blue-800',
  '暂无意向': 'bg-gray-100 text-gray-600',
}

async function loadVisits() {
  loading.value = true
  const { data, error } = await supabase
    .from('sr_visits')
    .select('*')
    .eq('rep_id', props.user.id)
    .order('visit_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)
  loading.value = false
  if (!error) visits.value = data
}

async function submit() {
  errorMsg.value = ''
  if (!form.value.hotel_name.trim()) { errorMsg.value = '请填写客户 / 酒店名称'; return }
  submitting.value = true
  const { error } = await supabase.from('sr_visits').insert({
    rep_id: props.user.id,
    rep_name: props.displayName,
    visit_date: form.value.visit_date,
    hotel_name: form.value.hotel_name.trim(),
    contact_name: form.value.contact_name.trim(),
    contact_phone: form.value.contact_phone.trim(),
    activity: form.value.activity,
    progress: form.value.progress,
    notes: form.value.notes.trim(),
  })
  submitting.value = false
  if (error) { errorMsg.value = '提交失败，请重试'; return }
  successMsg.value = '提交成功！'
  form.value.hotel_name = ''
  form.value.contact_name = ''
  form.value.contact_phone = ''
  form.value.notes = ''
  setTimeout(() => successMsg.value = '', 2500)
  loadVisits()
}

async function logout() {
  await supabase.auth.signOut()
}

// Group visits by date
function grouped() {
  const map = {}
  for (const v of visits.value) {
    (map[v.visit_date] = map[v.visit_date] || []).push(v)
  }
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
}

function fmtDate(d) {
  const today = new Date().toISOString().slice(0,10)
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10)
  if (d === today) return '今天'
  if (d === yesterday) return '昨天'
  return d
}

onMounted(loadVisits)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          </svg>
        </div>
        <span class="font-semibold text-gray-900 text-sm">销售日报</span>
      </div>
      <button @click="logout" class="text-xs text-gray-400 hover:text-gray-600 transition-colors">退出</button>
    </header>

    <div class="px-4 py-4 max-w-lg mx-auto space-y-4">

      <!-- Form card -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-4 pt-4 pb-2 border-b border-gray-50">
          <h2 class="text-sm font-semibold text-gray-800">新增拜访记录</h2>
        </div>
        <div class="px-4 py-3 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">拜访日期</label>
              <input v-model="form.visit_date" type="date" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">活动类型</label>
              <select v-model="form.activity" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option v-for="a in ACTIVITIES" :key="a">{{ a }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1">客户 / 酒店名称 <span class="text-red-400">*</span></label>
            <input v-model="form.hotel_name" type="text" placeholder="例：君悦大酒店" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">联系人</label>
              <input v-model="form.contact_name" type="text" placeholder="姓名 + 职位" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">联系方式</label>
              <input v-model="form.contact_phone" type="text" placeholder="电话 / 微信" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1">进度</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="p in PROGRESS"
                :key="p"
                @click="form.progress = p"
                :class="['px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', form.progress === p ? progressStyle[p] + ' border-transparent' : 'bg-white border-gray-200 text-gray-500']"
              >{{ p }}</button>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-500 mb-1">备注</label>
            <textarea v-model="form.notes" rows="2" placeholder="客户需求、下次跟进计划等..." class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>

          <p v-if="errorMsg" class="text-xs text-red-500">{{ errorMsg }}</p>

          <button
            @click="submit"
            :disabled="submitting"
            class="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {{ submitting ? '提交中...' : '提交记录' }}
          </button>

          <div v-if="successMsg" class="text-center text-xs text-green-600 font-medium">✓ {{ successMsg }}</div>
        </div>
      </div>

      <!-- History -->
      <div>
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">我的记录</h2>

        <div v-if="loading" class="text-center py-8 text-sm text-gray-400">加载中...</div>

        <template v-else-if="grouped().length">
          <div v-for="[date, items] in grouped()" :key="date" class="mb-3">
            <p class="text-xs text-gray-400 mb-1.5 px-1">{{ fmtDate(date) }} · {{ date }}</p>
            <div class="space-y-2">
              <div v-for="v in items" :key="v.id" class="bg-white rounded-2xl border border-gray-100 px-4 py-3">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <p class="text-sm font-semibold text-gray-900 leading-snug">{{ v.hotel_name }}</p>
                  <span :class="['shrink-0 text-xs px-2 py-0.5 rounded-full font-medium', progressStyle[v.progress]]">{{ v.progress }}</span>
                </div>
                <p class="text-xs text-gray-500 mb-1">{{ v.activity }}</p>
                <p v-if="v.contact_name" class="text-xs text-gray-600">
                  {{ v.contact_name }}<span v-if="v.contact_phone" class="text-gray-400"> · {{ v.contact_phone }}</span>
                </p>
                <p v-if="v.notes" class="text-xs text-gray-400 mt-1 italic">{{ v.notes }}</p>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="text-center py-8 text-sm text-gray-400">暂无记录，填写第一条拜访吧</div>
      </div>
    </div>
  </div>
</template>
