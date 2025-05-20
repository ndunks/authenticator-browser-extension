import { fileURLToPath, URL } from 'node:url'
// import vueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  root: "src",
  build: {
    outDir: "..",
  //   rollupOptions: {
  //     input: "./src/index.html"
  //   }
  },
  // server: {
  //   open: "./src/index.html"
  // }
  // root: "dashboard",
  // build: {
  //   outDir: "../build-dashboard"
  // },
  // plugins: [
  //   // vueDevTools({componentInspector: false}),
  //   // vue(),
  //   // vuetify({ autoImport: true }),
  // ],
  // server: {
  //   fs: {
  //     allow: [
  //       '../'
  //     ]
  //   }
  // }
})