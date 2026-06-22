import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nxovzgampwicmbwxzqkv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3Z6Z2FtcHdpY21id3h6cWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODgzMzUsImV4cCI6MjA5NjI2NDMzNX0.OxX0i1QGkUvC1D6vGcCrKsUxYM48DdaY_eLy0b-SWlg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// All accounts — username → fake email mapping
export const USERS = {
  sales1: { email: 'sales1@jhdf.internal', display: 'Sales 1', role: 'rep' },
  sales2: { email: 'sales2@jhdf.internal', display: 'Sales 2', role: 'rep' },
  admin1: { email: 'admin1@jhdf.internal', display: 'Admin 1', role: 'boss' },
  admin2: { email: 'admin2@jhdf.internal', display: 'Admin 2', role: 'boss' },
}

export const BOSS_EMAILS = ['admin1@jhdf.internal', 'admin2@jhdf.internal']

export async function loginWithUsername(username, password) {
  const user = USERS[username.trim().toLowerCase()]
  if (!user) return { error: '用户名不存在' }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })
  if (error) return { error: '密码错误，请重试' }
  return { data }
}
