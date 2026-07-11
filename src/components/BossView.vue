<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase.js'
const props=defineProps({user:Object,displayName:String})
const visits=ref([]),loading=ref(true),rep=ref(''),progress=ref(''),date=ref('')
const expandedId=ref(null)
const feedbackText=ref({}),savingId=ref(null)
const today=new Date().toISOString().slice(0,10)
const styles={'跟进中':'bg-amber-50 text-amber-700','已成交':'bg-emerald-50 text-emerald-700','暂无意向':'bg-slate-100 text-slate-600','已流失':'bg-rose-50 text-rose-600','长期观察':'bg-indigo-50 text-indigo-600'}
async function load(){loading.value=true;const {data,error}=await supabase.from('sr_visits').select('*').order('visit_date',{ascending:false}).order('created_at',{ascending:false});loading.value=false;if(!error)visits.value=data||[]}
const filtered=computed(()=>visits.value.filter(v=>(!rep.value||v.rep_name===rep.value)&&(!progress.value||v.progress===progress.value)&&(!date.value||v.visit_date===date.value)))
const reps=computed(()=>[...new Set(visits.value.map(v=>v.rep_name))].sort());const dates=computed(()=>[...new Set(visits.value.map(v=>v.visit_date))].sort().reverse())
const todayItems=computed(()=>visits.value.filter(v=>v.visit_date===today));const teamCount=computed(()=>new Set(todayItems.value.map(v=>v.rep_name)).size)
function clear(){rep.value='';progress.value='';date.value=''}
async function logout(){await supabase.auth.signOut()}
function fmt(d){return d===today?'今天':d}
function toggle(id){
  expandedId.value=expandedId.value===id?null:id
  if(expandedId.value===id){
    const v=visits.value.find(x=>x.id===id)
    feedbackText.value[id]=v?.boss_feedback||''
  }
}
async function saveFeedback(v){
  savingId.value=v.id
  const text=(feedbackText.value[v.id]||'').trim()
  const nowIso=new Date().toISOString()
  const {error}=await supabase.from('sr_visits').update({boss_feedback:text,boss_feedback_at:nowIso}).eq('id',v.id)
  savingId.value=null
  if(!error){v.boss_feedback=text;v.boss_feedback_at=nowIso}
}
onMounted(load)
</script>

<template>
  <main class="min-h-screen bg-[#f6f7f9] pb-9">
    <header class="mx-auto flex max-w-lg items-center justify-between px-5 pt-8 pb-5">
      <div>
        <p class="text-xs text-slate-500">{{ fmt(today) }} · 团队全貌</p>
        <h1 class="mt-1 text-[23px] font-bold tracking-[-.7px] text-slate-800">每日拜访报告</h1>
      </div>
      <button @click="logout" class="grid h-9 w-9 place-items-center rounded-full bg-[#e7edff] text-xs font-semibold text-[#4664c5]">退</button>
    </header>

    <div class="mx-auto max-w-lg space-y-5 px-5">
      <section class="relative overflow-hidden rounded-[19px] bg-gradient-to-br from-[#345bd6] to-[#8099f8] p-5 text-white shadow-[0_10px_25px_rgba(72,102,215,.22)]">
        <div class="absolute -right-14 -top-14 h-36 w-36 rounded-full border-[22px] border-white/10"></div>
        <p class="text-[13px] text-blue-100">今日团队拜访</p>
        <p class="mt-1 text-[40px] font-bold tracking-[-2px]">{{ todayItems.length }} <span class="text-sm font-medium tracking-normal">家客户</span></p>
        <p class="text-xs text-blue-100">{{ teamCount }} 位业务员有外出记录</p>
      </section>

      <div class="grid grid-cols-3 gap-2">
        <div class="rounded-xl border border-slate-100 bg-white p-3">
          <b class="text-xl">{{ todayItems.length }}</b>
          <span class="mt-1 block text-[11px] text-slate-500">已拜访</span>
        </div>
        <div class="rounded-xl border border-slate-100 bg-white p-3">
          <b class="text-xl text-emerald-600">{{ todayItems.filter(v => v.progress === '已成交').length }}</b>
          <span class="mt-1 block text-[11px] text-slate-500">已成交</span>
        </div>
        <div class="rounded-xl border border-slate-100 bg-white p-3">
          <b class="text-xl text-amber-600">{{ todayItems.filter(v => v.progress === '跟进中').length }}</b>
          <span class="mt-1 block text-[11px] text-slate-500">重点跟进</span>
        </div>
      </div>

      <section class="rounded-[15px] border border-slate-100 bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-bold">筛选记录</h2>
          <button v-if="rep || progress || date" @click="clear" class="text-xs text-blue-600">清除</button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <select v-model="rep" class="filter">
            <option value="">全部业务员</option>
            <option v-for="x in reps" :key="x">{{ x }}</option>
          </select>
          <select v-model="progress" class="filter">
            <option value="">全部进度</option>
            <option>跟进中</option>
            <option>已成交</option>
            <option>暂无意向</option>
            <option>已流失</option>
            <option>长期观察</option>
          </select>
          <select v-model="date" class="filter">
            <option value="">全部日期</option>
            <option v-for="x in dates" :key="x">{{ x }}</option>
          </select>
        </div>
      </section>

      <section>
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-[16px] font-bold">拜访明细</h2>
          <button @click="load" class="text-xs font-semibold text-blue-600">刷新</button>
        </div>
        <p class="mb-2 text-xs text-slate-400">共 {{ filtered.length }} 条记录 · 点击查看详情</p>

        <div v-if="loading" class="py-10 text-center text-sm text-slate-400">加载中…</div>

        <div v-else-if="filtered.length" class="space-y-2">
          <article
            v-for="v in filtered"
            :key="v.id"
            @click="toggle(v.id)"
            class="cursor-pointer rounded-[14px] border border-slate-100 bg-white p-4 transition active:scale-[.99]"
          >
            <div class="flex items-start justify-between gap-2">
              <b class="text-sm text-slate-800">{{ v.hotel_name }}</b>
              <span :class="['rounded-md px-2 py-1 text-[11px] font-semibold', styles[v.progress]]">{{ v.progress }}</span>
            </div>

            <p class="mt-1 text-xs">
              <span class="font-semibold text-blue-600">{{ v.rep_name }}</span>
              <span class="text-slate-300"> · </span>
              <span class="text-slate-500">{{ v.visit_date }} · {{ v.activity }}</span>
              <span v-if="v.boss_feedback" class="ml-1 text-emerald-600">已反馈</span>
            </p>

            <template v-if="expandedId === v.id">
              <div class="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs leading-5">
                <p v-if="v.contact_name" class="text-slate-600">
                  <b class="text-slate-700">沟通人：</b>{{ v.contact_name }}
                  <span v-if="v.contact_phone" class="text-slate-400"> · {{ v.contact_phone }}</span>
                </p>
                <p v-if="v.communication_info" class="text-slate-500">
                  <b class="text-slate-700">沟通信息：</b>{{ v.communication_info }}
                </p>
                <p v-if="v.source_inquiry" class="text-slate-500">
                  <b class="text-slate-700">货源询问：</b>{{ v.source_inquiry }}
                </p>
                <p v-if="v.follow_up" class="text-slate-500">
                  <b class="text-slate-700">后续进展：</b>{{ v.follow_up }}
                </p>
                <p
                  v-if="!v.contact_name && !v.communication_info && !v.source_inquiry && !v.follow_up"
                  class="text-slate-300"
                >
                  暂无更多详情
                </p>
              </div>

              <div class="mt-3 border-t border-slate-100 pt-3" @click.stop>
                <label class="mb-1 block text-[11px] font-semibold text-slate-600">公司意见</label>
                <textarea
                  v-model="feedbackText[v.id]"
                  placeholder="给业务员留言，例如：不用再打电话了…"
                  class="h-16 w-full resize-none rounded-lg border border-slate-200 p-2 text-xs text-slate-700 outline-none focus:border-[#5271e9]"
                ></textarea>
                <div class="mt-1.5 flex items-center justify-between">
                  <span class="text-[10px] text-slate-300">
                    {{ v.boss_feedback_at ? `上次反馈：${v.boss_feedback_at.slice(0, 16).replace('T', ' ')}` : '' }}
                  </span>
                  <button
                    @click="saveFeedback(v)"
                    :disabled="savingId === v.id"
                    class="rounded-lg bg-[#345bd6] px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
                  >
                    {{ savingId === v.id ? '保存中…' : '保存反馈' }}
                  </button>
                </div>
              </div>
            </template>

            <p v-else class="mt-2 text-[11px] text-slate-300">点击展开详情</p>
          </article>
        </div>

        <div v-else class="rounded-[14px] border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
          暂无符合条件的记录
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>.filter{width:100%;border:1px solid #dfe4ec;border-radius:10px;background:#fff;padding:8px 7px;font-size:11px;color:#4d5a70;outline:none}</style>
