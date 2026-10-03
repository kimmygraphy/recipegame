import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 상대 경로 → GitHub Pages 하위 경로(/repo-name/)에서도 그대로 동작
export default defineConfig({ plugins: [react()], base: './' })
