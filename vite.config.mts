import {defineConfig} from "vite";

export default defineConfig({
  base:"./",
  publicDir:"public",
  build:{
    outDir:"dist",
    emptyOutDir:true,
    sourcemap:true,
    rollupOptions:{
      external:(id:string)=>/^https:\/\/(?:www\.)?gstatic\.com\//.test(id)
    }
  },
  server:{
    host:"0.0.0.0",
    port:4173
  },
  preview:{
    host:"0.0.0.0",
    port:4174
  }
});
