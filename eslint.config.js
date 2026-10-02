const globals=Object.fromEntries(['process','Buffer','console','fetch','URL','URLSearchParams','TextEncoder','TextDecoder','AbortController','AbortSignal','DOMException','Response','Request','Headers','ReadableStream','setTimeout','clearTimeout','setInterval','clearInterval','structuredClone','crypto'].map(name=>[name,'readonly']));
export default [
  {ignores:['node_modules/**','public/**','.npm-cache/**','.test-databases/**']},
  {files:['server/**/*.js','api/**/*.js','scripts/**/*.mjs','tests/**/*.mjs'],languageOptions:{ecmaVersion:'latest',sourceType:'module',globals},
    rules:{'no-undef':'error','no-unreachable':'error','no-dupe-args':'error','no-dupe-keys':'error','no-duplicate-case':'error','no-constant-binary-expression':'error','valid-typeof':'error'}},
];
