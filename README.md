# 行迹 · 销售拜访日报

移动端 Vue 3 + Vite 应用，分为两个角色：

- 业务员：登录后只能填写和查看自己的拜访记录。
- 老板：登录后查看全部业务员的日报、状态与筛选结果。

## Supabase / PostgreSQL

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
2. 复制 `.env.example` 为 `.env.local`，填入项目的 URL 和 anon key。
3. 在 Supabase Auth 创建账号，并在账号的 `app_metadata` 写入 `role: boss` 或 `role: rep`。

数据隔离由 PostgreSQL RLS 策略执行，前端的角色判断只用于显示不同界面。

## 后续迁移到阿里云

UI 与数据字段不依赖 Supabase 专有格式。迁移时可在阿里云部署 PostgreSQL + API（或 Supabase 自托管），将 `src/lib/supabase.js` 的数据调用替换为 API 客户端；`sr_visits` 表字段和角色权限规则可原样迁移。
