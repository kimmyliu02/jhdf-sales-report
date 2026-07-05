<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase.js'
const props = defineProps({ user: Object, displayName: String })
const activeTab = ref('home'), visits = ref([]), loading = ref(true), submitting = ref(false), message = ref('')
const form = ref({ visit_date:new Date().toISOString().slice(0,10), hotel_name:'', contact_name:'', contact_phone:'', activity:'初次拜访', progress:'跟进中', communication_info:'', source_inquiry:'', follow_up:'' })
const ACTIVITIES=['初次拜访','产品介绍 / 送样','跟进报价','签合同 / 下单','售后维护','其他']
const PROGRESS=['跟进中','已成交','暂无意向','已流失','长期观察']
const styles={'跟进中':'bg-amber-50 text-amber-700','已成交':'bg-emerald-50 text-emerald-700','暂无意向':'bg-slate-100 text-slate-600','已流失':'bg-rose-50 text-rose-600','长期观察':'bg-indigo-50 text-indigo-600'}
const today = new Date().toISOString().slice(0,10)
const todayVisits=computed(()=>visits.value.filter(v=>v.visit_date===today))
async function load(){loading.value=true;const {data,error}=await supabase.from('sr_visits').select('*').eq('rep_id',props.user.id).order('visit_date',{ascending:false}).order('created_at',{ascending:false});loading.value=false;if(!error)visits.value=data||[]}
async function submit(){
  message.value=''
  if(!form.value.hotel_name.trim()){message.value='请填写酒店 / 餐饮名称';return}
  submitting.value=true
  const {error}=await supabase.from('sr_visits').insert({
    rep_id:props.user.id,
    rep_name:props.displayName,
    ...form.value,
    hotel_name:form.value.hotel_name.trim(),
    contact_name:form.value.contact_name.trim(),
    contact_phone:form.value.contact_phone.trim(),
    communication_info:form.value.communication_info.trim(),
    source_inquiry:form.value.source_inquiry.trim(),
    follow_up:form.value.follow_up.trim(),
  })
  submitting.value=false
  if(error){message.value='提交失败，请重试';return}
  message.value='✓ 已提交，老板端已同步'
  form.value={...form.value,hotel_name:'',contact_name:'',contact_phone:'',communication_info:'',source_inquiry:'',follow_up:''}
  activeTab.value='home'
  load()
}
async function logout(){await supabase.auth.signOut()}
function fmt(d){return d===today?'今天':d}
onMounted(load)
</script>
<template>
 <main class="min-h-screen bg-[#f6f7f9] pb-24">
  <header class="mx-auto flex max-w-lg items-center justify-between px-5 pt-8 pb-5"><div><p class="text-xs text-slate-500">{{ fmt(today) }} · 我的工作台</p><h1 class="mt-1 text-[23px] font-bold tracking-[-.7px] text-slate-800">你好，{{ displayName }}</h1></div><button @click="logout" class="grid h-9 w-9 place-items-center rounded-full bg-[#e7edff] text-xs font-semibold text-[#4664c5]">退</button></header>
  <div class="mx-auto max-w-lg px-5">
   <section v-if="activeTab==='home'" class="space-y-5">
    <div class="relative overflow-hidden rounded-[19px] bg-gradient-to-br from-[#345bd6] to-[#8099f8] p-5 text-white shadow-[0_10px_25px_rgba(72,102,215,.22)]"><div class="absolute -right-14 -top-14 h-36 w-36 rounded-full border-[22px] border-white/10"></div><p class="text-[13px] text-blue-100">我今天的拜访</p><p class="mt-1 text-[40px] font-bold tracking-[-2px]">{{ todayVisits.length }} <span class="text-sm font-medium tracking-normal">家客户</span></p></div>
    <div class="grid grid-cols-3 gap-2"><div class="rounded-xl border border-slate-100 bg-white p-3"><b class="text-xl">{{ todayVisits.length }}</b><span class="mt-1 block text-[11px] text-slate-500">已提交</span></div><div class="rounded-xl border border-slate-100 bg-white p-3"><b class="text-xl text-emerald-600">{{ todayVisits.filter(v=>v.progress==='已成交').length }}</b><span class="mt-1 block text-[11px] text-slate-500">已成交</span></div><div class="rounded-xl border border-slate-100 bg-white p-3"><b class="text-xl text-amber-600">{{ todayVisits.filter(v=>v.progress==='跟进中').length }}</b><span class="mt-1 block text-[11px] text-slate-500">待跟进</span></div></div>
    <div><div class="mb-2 flex items-center justify-between"><h2 class="text-[16px] font-bold">今天的记录</h2><button @click="activeTab='history'" class="text-xs font-semibold text-blue-600">查看全部</button></div><div v-if="loading" class="py-10 text-center text-sm text-slate-400">加载中…</div><div v-else-if="todayVisits.length" class="space-y-2"><article v-for="v in todayVisits" :key="v.id" class="rounded-[14px] border border-slate-100 bg-white p-4"><div class="flex items-start justify-between gap-2"><b class="text-sm text-slate-800">{{ v.hotel_name }}</b><span :class="['rounded-md px-2 py-1 text-[11px] font-semibold',styles[v.progress]]">{{ v.progress }}</span></div><p class="mt-1 text-xs text-slate-500">{{ v.activity }}<span v-if="v.contact_name"> · {{ v.contact_name }}</span></p><p v-if="v.communication_info" class="mt-2 border-t border-slate-100 pt-2 text-xs leading-5 text-slate-500"><b class="text-slate-600">沟通信息：</b>{{ v.communication_info }}</p><p v-if="v.source_inquiry" class="mt-1 text-xs leading-5 text-slate-500"><b class="text-slate-600">货源询问：</b>{{ v.source_inquiry }}</p><p v-if="v.follow_up" class="mt-1 text-xs leading-5 text-slate-500"><b class="text-slate-600">后续进展：</b>{{ v.follow_up }}</p></article></div><div v-else class="rounded-[14px] border border-dashed border-slate-300 bg-white py-9 text-center text-sm text-slate-400">还没有拜访记录<br><button @click="activeTab='add'" class="mt-2 text-xs font-semibold text-blue-600">去填写第一条</button></div></div>
   </section>
   <section v-else-if="activeTab==='add'"><div class="mb-4"><h2 class="text-xl font-bold">提交拜访</h2><p class="mt-1 text-xs text-slate-500">填写后，老板可实时查看</p></div><form @submit.prevent="submit" class="mt-3 space-y-3"><div class="rounded-[15px] border border-slate-100 bg-white p-4"><h3 class="mb-4 text-sm font-bold">拜访信息</h3><label class="label">拜访日期</label><input v-model="form.visit_date" type="date" class="input mb-3"><label class="label">酒店 / 餐饮名称 <span class="text-rose-500">*</span></label><input v-model="form.hotel_name" placeholder="例如：上海静安瑞吉酒店" class="input mb-3"><label class="label">本次工作</label><select v-model="form.activity" class="input mb-3"><option v-for="x in ACTIVITIES" :key="x">{{x}}</option></select><label class="label">进度 / 结果</label><div class="flex flex-wrap gap-2"><button v-for="x in PROGRESS" :key="x" type="button" @click="form.progress=x" :class="['rounded-lg border px-3 py-2 text-xs',form.progress===x?styles[x]+' border-transparent':'border-slate-200 bg-white text-slate-500']">{{x}}</button></div></div><div class="rounded-[15px] border border-slate-100 bg-white p-4"><h3 class="mb-4 text-sm font-bold">沟通人信息</h3><label class="label">沟通人（姓名 + 职位）</label><input v-model="form.contact_name" placeholder="例如：王经理（采购部）" class="input mb-3"><label class="label">沟通人联系方式</label><input v-model="form.contact_phone" placeholder="手机 / 微信" class="input mb-3"></div><div class="rounded-[15px] border border-slate-100 bg-white p-4"><h3 class="mb-4 text-sm font-bold">走访详情</h3><label class="label">沟通信息</label><textarea v-model="form.communication_info" placeholder="本次沟通的主要内容…" class="input mb-3 h-20 resize-none"></textarea><label class="label">货源询问</label><textarea v-model="form.source_inquiry" placeholder="对方目前的货源、供应商、进货价格等…" class="input mb-3 h-20 resize-none"></textarea><label class="label">后续进展</label><textarea v-model="form.follow_up" placeholder="下一步计划、需要跟进的事项…" class="input h-20 resize-none"></textarea></div><p v-if="message" :class="['text-center text-xs',message.startsWith('✓')?'text-emerald-600':'text-rose-500']">{{message}}</p><button :disabled="submitting" class="w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white disabled:opacity-60">{{submitting?'提交中…':'提交拜访记录'}}</button></form></section>
   <section v-else><div class="mb-4 flex items-center justify-between"><div><h2 class="text-xl font-bold">所有日报</h2><p class="mt-1 text-xs text-slate-500">仅显示你的拜访记录</p></div><button @click="load" class="text-xs font-semibold text-blue-600">刷新</button></div><div v-if="loading" class="py-10 text-center text-sm text-slate-400">加载中…</div><div v-else class="space-y-2"><article v-for="v in visits" :key="v.id" class="rounded-[14px] border border-slate-100 bg-white p-4"><div class="flex items-start justify-between gap-2"><b class="text-sm">{{v.hotel_name}}</b><span :class="['rounded-md px-2 py-1 text-[11px]',styles[v.progress]]">{{v.progress}}</span></div><p class="mt-1 text-xs text-slate-500">{{v.visit_date}} · {{v.activity}}</p><p v-if="v.contact_name" class="mt-2 text-xs text-slate-600">{{v.contact_name}}<span v-if="v.contact_phone" class="text-slate-400"> · {{v.contact_phone}}</span></p><p v-if="v.communication_info" class="mt-1 text-xs text-slate-400"><b class="text-slate-500">沟通信息：</b>{{v.communication_info}}</p><p v-if="v.source_inquiry" class="mt-1 text-xs text-slate-400"><b class="text-slate-500">货源询问：</b>{{v.source_inquiry}}</p><p v-if="v.follow_up" class="mt-1 text-xs text-slate-400"><b class="text-slate-500">后续进展：</b>{{v.follow_up}}</p></article></div></section>
  </div>
  <nav class="fixed bottom-0 left-1/2 flex w-full max-w-lg -translate-x-1/2 justify-around border-t border-slate-200 bg-white/95 px-5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur"><button v-for="x in [{id:'home',icon:'⌂',label:'首页'},{id:'history',icon:'▤',label:'日报'},{id:'add',icon:'⊕',label:'填报'}]" :key="x.id" @click="activeTab=x.id" :class="['w-16 text-[10px]',activeTab===x.id?'font-semibold text-blue-600':'text-slate-400']"><b class="block text-xl font-normal leading-6">{{x.icon}}</b>{{x.label}}</button></nav>
 </main>
</template>
<style scoped>.label{display:block;margin-bottom:6px;font-size:12px;color:#677287}.input{width:100%;border:1px solid #dfe4ec;border-radius:10px;background:#fff;padding:10px 11px;font-size:14px;color:#1c2637;outline:none}.input:focus{border-color:#5271e9;box-shadow:0 0 0 2px #e9eeff}</style>
