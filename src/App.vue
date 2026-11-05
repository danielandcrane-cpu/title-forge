<script setup>
/**
 * TitleForge · Day8 · 多平台标题生成工作台
 * 中国风 UI · 5 平台输出（YouTube / TikTok / 抖音 / B站 / 小红书）
 * 基础版：纯规则 + 模板随机组合，离线可用
 *
 * 后续扩展位：AI API（DeepSeek）接入、模板库管理、多版本对比
 */
import { onMounted, ref, computed } from 'vue'

// ============== 状态 ==============
const topic = ref('')
const isEnglish = ref(false)  // 后续自动检测，基础版手动切换
const loading = ref(false)
const toast = ref({ show: false, msg: '' })

// 各平台生成结果
const results = ref({
  youtube: '',
  tiktok: '',
  douyin: '',
  bilibili: '',
  xiaohongshu: '',
})

// 收藏
const favorites = ref([])
const FAV_KEY = 'title-forge-favorites'
const TOPIC_KEY = 'title-forge-last-topic'

// ============== 模板库（5 平台 × 中英双语）==============
const TEMPLATES = {
  youtube: {
    zh: [
      '{topic}的深层解读 | 你不知道的5件事',
      '为什么{topic}能火？3分钟讲透核心逻辑',
      '{topic}从0到1：完整发展历程（2024最新）',
      '【硬核分析】{topic}到底值不值得做？',
      '{topic}实战指南：新手入门到精通',
      '全网最火的{topic}，看完我悟了',
      '{topic}的秘密终于被揭开了...',
    ],
    en: [
      'The Hidden Truth About {topic} | 5 Things You Never Knew',
      'Why {topic} is Going Viral — Explained in 3 Minutes',
      '{topic} from Zero to Hero: The Complete Journey (2024)',
      'Is {topic} Worth It? Honest Review',
      '{topic} for Beginners: Complete Guide',
      'The {topic} Secret Nobody Tells You',
    ],
  },
  tiktok: {
    zh: [
      '{topic}，我被震撼到了',
      '这就是{topic}的真相',
      '千万别学{topic}，会后悔',
      '{topic}到底有多绝？',
      '看完这个，我对{topic}改观了',
      '{topic}的天花板有多高？',
    ],
    en: [
      'This is why {topic} is everywhere',
      'POV: You just discovered {topic}',
      'Nobody talks about this {topic} trick',
      '{topic} changed my life',
      'Watch this before you try {topic}',
    ],
  },
  douyin: {
    zh: [
      '中国人不知道的{topic}秘密，今天终于说透',
      '99%的人都误解了{topic}，真相在这',
      '{topic}的正确打开方式，看完直接收藏',
      '关于{topic}，这可能是最狠的一条视频',
      '{topic}到底有多香？一条视频讲透',
      '别再瞎玩{topic}了，真正的玩法在这',
      '{topic}背后的真相，看完我沉默了',
    ],
    en: [
      // 抖音也可以输出中文，保持中文模板
    ],
  },
  bilibili: {
    zh: [
      '【硬核科普】{topic}到底是什么？从0讲透',
      '{topic}全解析：看完你也是行家',
      'UP主教你{topic}，小白也能上手',
      '{topic}年度复盘：这一年我们经历了什么',
      '【深度】{topic}为什么突然火了？',
      '{topic}对比测评：5款产品谁最强？',
      '万字长文讲{topic}，建议收藏慢慢看',
    ],
    en: [],
  },
  xiaohongshu: {
    zh: [
      '🍵终于找到！{topic}的正确打开方式✨',
      '姐妹们！{topic}也太绝了吧💕',
      '{topic}保姆级教程｜新手必看，看完就会📌',
      '为什么你的{topic}总做不好？这5点是关键❌',
      '被问了N次的{topic}攻略，今天写全了💯',
      '{topic}避雷指南！这几个坑我替你踩过了⚠️',
      '这个{topic}真的会上头！我已经连刷3天了🔥',
    ],
    en: [],
  },
}

// ============== 生成逻辑 ==============
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fillTemplate(template, topicText) {
  return template.replace(/\{topic\}/g, topicText.trim())
}

function detectLang(text) {
  // 简单检测：包含中文则是中文
  return /[\u4e00-\u9fa5]/.test(text) ? 'zh' : 'en'
}

function generate() {
  if (!topic.value.trim()) {
    showToast('请先输入主题')
    return
  }

  loading.value = true
  const lang = detectLang(topic.value)
  const t = topic.value.trim()

  // 随机选模板填进去
  Object.keys(results.value).forEach(platform => {
    const tplList = TEMPLATES[platform][lang]
    if (tplList && tplList.length > 0) {
      results.value[platform] = fillTemplate(pickRandom(tplList), t)
    } else {
      // 该平台没对应语言模板 → 用另一种语言
      const fallback = TEMPLATES[platform][lang === 'zh' ? 'en' : 'zh']
      if (fallback && fallback.length > 0) {
        results.value[platform] = fillTemplate(pickRandom(fallback), t)
      } else {
        results.value[platform] = lang === 'zh'
          ? '(该平台暂无中文模板，后续补充)'
          : '(No English template yet, will add soon)'
      }
    }
  })

  loading.value = false
  localStorage.setItem(TOPIC_KEY, topic.value)
}

function regenerate(platform) {
  if (!topic.value.trim()) {
    showToast('请先输入主题')
    return
  }
  const lang = detectLang(topic.value)
  const t = topic.value.trim()

  // 先拿目标语言的模板，没有的话拿另一种语言（空数组 [] 在 JS 里是 truthy，必须显式检查 length）
  let tplList = TEMPLATES[platform][lang]
  if (!tplList || tplList.length === 0) {
    tplList = TEMPLATES[platform][lang === 'zh' ? 'en' : 'zh']
  }

  if (tplList && tplList.length > 0) {
    results.value[platform] = fillTemplate(pickRandom(tplList), t)
  }
}

// ============== 一键复制 ==============
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('已复制到剪贴板 ✓')
  } catch {
    showToast('复制失败，请手动选中复制')
  }
}

// ============== 收藏 ==============
function toggleFav(platform) {
  const title = results.value[platform]
  if (!title) return
  const idx = favorites.value.findIndex(f => f.platform === platform && f.title === title)
  if (idx >= 0) {
    favorites.value.splice(idx, 1)
    showToast('已取消收藏')
  } else {
    favorites.value.unshift({ platform, title, time: Date.now() })
    showToast('已收藏 ⭐')
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favorites.value))
}

function isFav(platform) {
  return favorites.value.some(f => f.platform === platform && f.title === results.value[platform])
}

// ============== 平台元数据 ==============
const platforms = [
  { key: 'youtube',  name: 'YouTube',  icon: '▶', lang: 'en', hint: '海外长视频' },
  { key: 'tiktok',   name: 'TikTok',   icon: '♪', lang: 'en', hint: '海外短视频' },
  { key: 'douyin',   name: '抖音',     icon: '♫', lang: 'zh', hint: '国内短视频' },
  { key: 'bilibili', name: 'B站',      icon: '📺', lang: 'zh', hint: '中长视频/社区' },
  { key: 'xiaohongshu', name: '小红书', icon: '📕', lang: 'zh', hint: '种草/图文' },
]

// ============== 生命周期 ==============
onMounted(() => {
  const savedFavs = localStorage.getItem(FAV_KEY)
  if (savedFavs) favorites.value = JSON.parse(savedFavs)
  const savedTopic = localStorage.getItem(TOPIC_KEY)
  if (savedTopic) topic.value = savedTopic
})

function showToast(msg) {
  toast.value = { show: true, msg }
  setTimeout(() => { toast.value.show = false }, 1800)
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center px-4 py-10">
    <!-- 标题区 -->
    <header class="text-center mb-10">
      <div class="flex items-center justify-center gap-3 mb-2">
        <span class="w-1.5 h-6 bg-seal rounded-sm opacity-80"></span>
        <h1 class="text-3xl font-serif font-bold text-ink tracking-wider">TitleForge</h1>
        <span class="w-1.5 h-6 bg-seal rounded-sm opacity-80"></span>
      </div>
      <p class="text-sm text-tea tracking-wide">多平台标题生成工作台 · 为老泡菜量身打造</p>
      <div class="ink-divider w-48 mt-4 mx-auto"></div>
    </header>

    <!-- 输入区 -->
    <section class="w-full max-w-2xl bg-white/70 backdrop-blur-sm rounded-xl border border-clay/40 shadow-sm p-6 seal-corner">
      <label class="block text-sm font-serif text-ink mb-2 tracking-wide">✦ 主题 / 一句话梗概</label>
      <textarea
        v-model="topic"
        rows="2"
        placeholder="比如：中国茶文化 5000 年的演变，或者：Tea and Chinese Culture evolution"
        class="w-full px-4 py-3 rounded-lg border border-clay focus:border-seal focus:outline-none bg-paper/50 text-ink placeholder:text-clay/70 text-sm resize-none transition"
      ></textarea>
      <div class="flex items-center justify-between mt-3">
        <span class="text-xs text-tea">输入中文 → 中文标题；输入英文 → 英文标题</span>
        <button
          type="button"
          :disabled="loading"
          @click="generate"
          class="px-6 py-2 rounded-lg bg-seal text-white text-sm font-serif tracking-wider hover:bg-[#9a3838] active:scale-95 transition disabled:opacity-50"
        >
          {{ loading ? '生成中...' : '✦ 生成标题' }}
        </button>
      </div>
    </section>

    <!-- 结果区 -->
    <section class="w-full max-w-4xl mt-10">
      <h2 class="text-center font-serif text-ink text-lg mb-6 tracking-wide">
        <span class="text-seal">◆</span> 五大平台 · 一主题多版标题 <span class="text-seal">◆</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article
          v-for="p in platforms"
          :key="p.key"
          class="bg-white/70 backdrop-blur-sm rounded-xl border border-clay/40 shadow-sm p-5 hover:shadow-md transition"
        >
          <!-- 平台头 -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ p.icon }}</span>
              <span class="font-serif font-bold text-ink">{{ p.name }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-clay/20 text-tea">{{ p.hint }}</span>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="regenerate(p.key)"
                title="换一条"
                class="text-xs text-tea hover:text-seal px-2 py-1 rounded hover:bg-seal/10 transition"
              >↻ 换一条</button>
            </div>
          </div>

          <!-- 生成结果 -->
          <div class="min-h-[52px] rounded-lg bg-paper/60 border border-clay/30 p-3 text-sm text-ink leading-relaxed">
            {{ results[p.key] || '点「生成标题」后这里会出结果' }}
          </div>

          <!-- 操作栏 -->
          <div class="flex items-center justify-end gap-2 mt-3">
            <button
              v-if="results[p.key]"
              type="button"
              @click="toggleFav(p.key)"
              :title="isFav(p.key) ? '取消收藏' : '收藏'"
              class="text-xs px-3 py-1 rounded-md transition"
              :class="isFav(p.key) ? 'bg-seal/10 text-seal' : 'bg-clay/15 text-tea hover:bg-seal/10 hover:text-seal'"
            >{{ isFav(p.key) ? '★ 已收藏' : '☆ 收藏' }}</button>
            <button
              v-if="results[p.key]"
              type="button"
              @click="copy(results[p.key])"
              class="text-xs px-3 py-1 rounded-md bg-ink/90 text-paper hover:bg-ink active:scale-95 transition"
            >复制</button>
          </div>
        </article>
      </div>
    </section>

    <!-- 收藏区 -->
    <section v-if="favorites.length > 0" class="w-full max-w-4xl mt-10">
      <h2 class="font-serif text-ink text-lg mb-4 tracking-wide flex items-center gap-2">
        <span class="text-seal">★</span> 我的收藏（{{ favorites.length }}）
      </h2>
      <div class="bg-white/60 rounded-xl border border-clay/30 p-4 space-y-2">
        <div
          v-for="(f, i) in favorites"
          :key="i"
          class="flex items-start gap-3 p-2 rounded-lg hover:bg-paper/50 transition group"
        >
          <span class="text-xs text-tea shrink-0 mt-0.5 w-20">{{ platforms.find(p => p.key === f.platform)?.name }}</span>
          <span class="text-sm text-ink flex-1">{{ f.title }}</span>
          <button
            @click="copy(f.title)"
            class="text-xs text-tea opacity-0 group-hover:opacity-100 hover:text-seal transition shrink-0"
          >复制</button>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="mt-12 mb-4 text-center text-xs text-clay tracking-wide">
      <div class="ink-divider w-32 mb-3 mx-auto"></div>
      <p>TitleForge · Day 8 · Vibe Coding 熟手养成</p>
      <p class="mt-1">规则+模板生成 | 后续接入 DeepSeek AI</p>
    </footer>

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-10 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg bg-ink text-paper text-sm shadow-lg z-50 animate-fade-in"
    >{{ toast.msg }}</div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
