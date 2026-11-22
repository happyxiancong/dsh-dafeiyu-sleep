/**
 * dsh-dafeiyu-sleep —— 宿主半侧（Node，跑在 DSH 里）。
 *
 * 只做三件事：
 *  1. 读 AstrBot 睡觉插件的 state.json / config.json / 共享状态，给设置页看；
 *  2. 把「设疲劳值 / 让她睡 / 叫醒 / 改参数」写进 <AstrBot 根目录>\private\sleep-control.json，
 *     由 AstrBot 插件每 30 秒轮询执行（不开端口、不改运行中进程的内存状态）；
 *  3. 通过 ctx.webServer 暴露同源 /api/dsh-dafeiyu-sleep/*。
 *
 * 为什么不让 DSH 直接写 state.json：AstrBot 插件内存里有一份状态，每 30 秒
 * 会把内存写回文件，直接改文件会被覆盖。控制文件是唯一安全的通道。
 *
 * AstrBot 根目录是可配置的（默认 D:\dafeiyu），存在 ~/.dsh/dafeiyu-sleep/settings.json；
 * 也可以用环境变量 DAFEIYU_ROOT 覆盖。
 */
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'
import { homedir } from 'node:os'

export const name = 'dafeiyu-sleep'
export const inject = ['webServer']

const API_PREFIX = '/api/dsh-dafeiyu-sleep'
const DEFAULT_ROOT = 'D:\\dafeiyu'
const SETTINGS_FILE = join(homedir(), '.dsh', 'dafeiyu-sleep', 'settings.json')
const MAX_BODY = 64 * 1024

let rootCache = null

function sendJson(res, code, body) {
  const bytes = Buffer.from(JSON.stringify(body), 'utf8')
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(bytes.length),
    'cache-control': 'no-store',
  })
  res.end(bytes)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY) {
        req.destroy()
        reject(Object.assign(new Error('请求太大'), { status: 413 }))
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text.trim() === '' ? {} : JSON.parse(text))
      } catch (e) {
        reject(Object.assign(new Error(`请求体不是合法 JSON：${e.message}`), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

async function readJson(path) {
  try {
    const text = await readFile(path, 'utf8')
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true })
  const tmp = `${path}.tmp`
  await writeFile(tmp, JSON.stringify(value, null, 2), 'utf8')
  await rename(tmp, path)
}

/** 当前 AstrBot 根目录：环境变量 > 已保存设置 > 默认值。 */
async function readRoot() {
  const fromEnv = process.env.DAFEIYU_ROOT
  if (fromEnv && fromEnv.trim()) return fromEnv.trim()
  if (rootCache) return rootCache
  const saved = await readJson(SETTINGS_FILE)
  rootCache = saved && typeof saved.root === 'string' && saved.root.trim() ? saved.root.trim() : DEFAULT_ROOT
  return rootCache
}

async function saveRoot(root) {
  const clean = String(root || '').trim()
  if (!clean) throw Object.assign(new Error('目录不能为空'), { status: 400 })
  if (!isAbsolute(clean)) throw Object.assign(new Error('要填绝对路径，例如 D:\\dafeiyu'), { status: 400 })
  await writeJsonAtomic(SETTINGS_FILE, { root: clean })
  rootCache = clean
}

/** AstrBot 根目录 → 睡觉插件用到的四个文件。 */
function pathsFor(root) {
  return {
    root,
    state: join(root, 'astrbot', 'data', 'plugin_data', 'astrbot_plugin_dafeiyu_sleep', 'state.json'),
    config: join(root, 'astrbot', 'data', 'config', 'astrbot_plugin_dafeiyu_sleep_config.json'),
    share: join(root, 'private', 'sleep-state.json'),
    control: join(root, 'private', 'sleep-control.json'),
  }
}

/** 写控制文件；AstrBot 读到就删，执行完在日志里留一行。 */
async function writeControl(paths, payload) {
  const body = JSON.stringify({ ...payload, at: new Date().toISOString(), from: 'dsh-dafeiyu-sleep' }, null, 2)
  await mkdir(dirname(paths.control), { recursive: true })
  const tmp = `${paths.control}.tmp`
  await writeFile(tmp, body, 'utf8')
  await rename(tmp, paths.control)
}

const ACTIONS = new Set(['sleep', 'wake', 'continue', 'cancel_nap'])

export function apply(ctx) {
  ctx.effect(() => {
    const dispose = ctx.webServer.register({
      kind: 'prefix',
      path: API_PREFIX,
      handler: async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const route = url.pathname.slice(API_PREFIX.length) || '/'
        const method = req.method || 'GET'
        try {
          const root = await readRoot()
          const paths = pathsFor(root)

          if (route === '/state' && method === 'GET') {
            const [state, config, share] = await Promise.all([
              readJson(paths.state),
              readJson(paths.config),
              readJson(paths.share),
            ])
            return sendJson(res, 200, {
              ok: true,
              root,
              detected: existsSync(paths.state) || existsSync(paths.share),
              state,
              config,
              share,
              controlPending: existsSync(paths.control),
              now: new Date().toISOString(),
            })
          }
          if (route === '/root' && method === 'POST') {
            const body = await readBody(req)
            await saveRoot(body.root)
            return sendJson(res, 200, { ok: true, root: await readRoot() })
          }
          if (route === '/fatigue' && method === 'POST') {
            const body = await readBody(req)
            const value = Number(body.value)
            if (!Number.isFinite(value)) throw Object.assign(new Error('疲劳值要是数字'), { status: 400 })
            await writeControl(paths, { op: 'set_fatigue', value: Math.max(0, Math.min(100, Math.round(value * 10) / 10)) })
            return sendJson(res, 200, { ok: true, pending: true })
          }
          if (route === '/action' && method === 'POST') {
            const body = await readBody(req)
            const op = String(body.op || '')
            if (!ACTIONS.has(op)) throw Object.assign(new Error(`不认识的操作：${op}`), { status: 400 })
            await writeControl(paths, { op })
            return sendJson(res, 200, { ok: true, pending: true })
          }
          if (route === '/config' && method === 'POST') {
            const body = await readBody(req)
            const patch = body && typeof body.patch === 'object' && body.patch !== null ? body.patch : {}
            if (Object.keys(patch).length === 0) throw Object.assign(new Error('没有要改的参数'), { status: 400 })
            await writeControl(paths, { op: 'config', patch })
            return sendJson(res, 200, { ok: true, pending: true })
          }
          return sendJson(res, 404, { error: `未知接口：${route}` })
        } catch (e) {
          const code = typeof e?.status === 'number' ? e.status : 500
          return sendJson(res, code, { error: String(e?.message || e) })
        }
      },
    })
    return () => {
      if (typeof dispose === 'function') dispose()
    }
  }, 'dsh-dafeiyu-sleep: http')
}
