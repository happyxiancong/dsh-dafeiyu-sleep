/**
 * dsh-dafeiyu-sleep —— 浏览器半侧（手写的 __ModuleLoader__ bundle，无需构建）。
 * 设置 → 大肥鱼睡觉：疲劳值 / 睡没睡 / 阈值 / 醒点一眼看完，数值和参数都能改。
 * 与宿主只走同源 fetch（/api/dsh-dafeiyu-sleep/*）。修改后用 `node --check lib/client.js` 验证语法。
 */

window.__ModuleLoader__.load({
  id: 'dsh-dafeiyu-sleep',
  factory: function (require) {
    var module = { exports: {} }
    var React = require('react')
    var h = React.createElement
    var Component = React.Component
    var useCallback = React.useCallback
    var useEffect = React.useEffect
    var useRef = React.useRef
    var useState = React.useState

    var API = '/api/dsh-dafeiyu-sleep'
    var POLL_MS = 15000

    var CSS = [
      '.bb-root{--bb-fg:var(--dsw-alias-label-primary,#1f1c18);--bb-muted:var(--dsw-alias-label-secondary,#6f6558);--bb-faint:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-dimmed,#8a7f6e));',
      '--bb-card:var(--dsw-alias-bg-layer-1,#fffdf8);--bb-bar:var(--dsw-alias-bg-layer-2,#f4efe4);--bb-field:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-layer-2,#fbf7ef));',
      '--bb-line:var(--dsw-alias-border-l2,#e3daca);--bb-line-soft:var(--dsw-alias-border-l1,#ece5d8);--bb-hover:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.10));',
      '--bb-brand:var(--dsw-alias-brand-primary,var(--dsw-alias-button-primary-fill,#3b5bdb));--bb-brand-fg:var(--dsw-alias-label-primary-foreground,#fff);',
      '--bb-ok:var(--dsw-alias-state-success-primary,#2f6b46);--bb-warn:var(--dsw-alias-state-warn-primary,#8a6a2f);--bb-err:var(--dsw-alias-state-error-primary,#a83a2c);',
      '--bb-err-bg:color-mix(in srgb,var(--bb-err) 9%,transparent);--bb-err-line:color-mix(in srgb,var(--bb-err) 32%,transparent);',
      'display:flex;flex-direction:column;gap:16px;padding:4px 0 28px;color:var(--bb-fg);font-size:13px;line-height:1.55}',
      '.bb-head{display:flex;align-items:center;gap:12px}',
      '.bb-logo{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--bb-brand) 12%,transparent);color:var(--bb-brand);flex:none}',
      '.bb-grow{flex:1;min-width:0}',
      '.bb-h1{font-size:16px;font-weight:600;letter-spacing:.2px}',
      '.bb-sub{color:var(--bb-muted);font-size:12px;margin-top:2px}',
      '.bb-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;border:1px solid var(--bb-line);background:var(--bb-card);color:var(--bb-muted);font-size:12px;white-space:nowrap}',
      '.bb-dot{width:7px;height:7px;border-radius:50%;background:var(--bb-faint);flex:none}',
      '.bb-dot-ok{background:var(--bb-ok)}', '.bb-dot-sleep{background:#6b7bd6}', '.bb-dot-warn{background:var(--bb-warn)}',
      '.bb-card{border:1px solid var(--bb-line);border-radius:14px;background:var(--bb-card);padding:16px}',
      '.bb-fatigue{display:flex;align-items:flex-end;gap:10px}',
      '.bb-big{font-size:40px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}',
      '.bb-unit{color:var(--bb-faint);font-size:13px;padding-bottom:3px}',
      '.bb-bar{position:relative;height:12px;border-radius:999px;background:var(--bb-bar);margin-top:12px;overflow:visible}',
      '.bb-fill{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:linear-gradient(90deg,var(--bb-ok),var(--bb-warn));transition:width .4s ease}',
      '.bb-fill-hot{background:linear-gradient(90deg,var(--bb-warn),var(--bb-err))}',
      '.bb-tick{position:absolute;top:-4px;bottom:-4px;width:2px;border-radius:2px;background:var(--bb-brand);opacity:.85}',
      '.bb-tick-label{position:absolute;top:18px;transform:translateX(-50%);font-size:11px;color:var(--bb-muted);white-space:nowrap}',
      '.bb-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:34px;color:var(--bb-muted);font-size:12px}',
      '.bb-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:14px}',
      '.bb-cell{border:1px solid var(--bb-line-soft);border-radius:10px;padding:10px 12px;background:var(--bb-field)}',
      '.bb-cell-k{color:var(--bb-faint);font-size:11px}',
      '.bb-cell-v{font-size:16px;font-weight:600;margin-top:2px;font-variant-numeric:tabular-nums}',
      '.bb-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
      '.bb-btn{appearance:none;border:1px solid var(--bb-line);background:var(--bb-card);color:var(--bb-fg);border-radius:10px;padding:7px 14px;font-size:13px;cursor:pointer}',
      '.bb-btn:hover{background:var(--bb-hover)}',
      '.bb-btn:disabled{opacity:.5;cursor:not-allowed}',
      '.bb-btn-primary{border-color:transparent;background:var(--bb-brand);color:var(--bb-brand-fg)}',
      '.bb-btn-primary:hover{background:var(--bb-brand);opacity:.92}',
      '.bb-h2{font-size:13px;font-weight:600;margin:0 0 10px}',
      '.bb-note{color:var(--bb-muted);font-size:12px}',
      '.bb-field{display:flex;flex-direction:column;gap:4px;min-width:120px}',
      '.bb-field-k{color:var(--bb-muted);font-size:12px}',
      '.bb-input{appearance:none;border:1px solid var(--bb-line);background:var(--bb-field);color:var(--bb-fg);border-radius:8px;padding:6px 9px;font-size:13px;font-variant-numeric:tabular-nums;width:100%;box-sizing:border-box}',
      '.bb-input:focus{outline:2px solid color-mix(in srgb,var(--bb-brand) 45%,transparent);outline-offset:0;border-color:transparent}',
      '.bb-slider{width:100%;accent-color:var(--bb-brand)}',
      '.bb-groups{display:grid;gap:16px}',
      '.bb-group{border-top:1px solid var(--bb-line-soft);padding-top:12px}',
      '.bb-group:first-child{border-top:none;padding-top:0}',
      '.bb-fields{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}',
      '.bb-error{border:1px solid var(--bb-err-line);background:var(--bb-err-bg);color:var(--bb-err);border-radius:10px;padding:10px 12px;font-size:12px}',
      '.bb-toast{position:fixed;right:24px;bottom:24px;z-index:60;border:1px solid var(--bb-line);background:var(--bb-card);color:var(--bb-fg);border-radius:10px;padding:10px 14px;font-size:12px;box-shadow:0 8px 28px rgba(0,0,0,.16);max-width:360px}',
      '.bb-toast-err{border-color:var(--bb-err-line);color:var(--bb-err)}',
    ].join('')

    function cx() {
      var out = []
      for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i])
      return out.join(' ')
    }
    function readJson(res) {
      return res.text().then(function (t) {
        var d = null
        try { d = t === '' ? null : JSON.parse(t) } catch (e) { d = null }
        if (!res.ok) throw new Error(d && d.error ? d.error : 'HTTP ' + res.status)
        return d
      })
    }
    function apiGet(p) { return fetch(API + p, { cache: 'no-store' }).then(readJson) }
    function apiPost(p, body) {
      return fetch(API + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) }).then(readJson)
    }
    function errText(e) { return e && e.message ? e.message : String(e) }
    function pad2(n) { return (n < 10 ? '0' : '') + n }
    function fmtTime(iso) {
      if (!iso) return '—'
      var d = new Date(iso)
      if (isNaN(d.getTime())) return '—'
      return pad2(d.getHours()) + ':' + pad2(d.getMinutes())
    }
    function fmtDate(iso) {
      if (!iso) return ''
      var d = new Date(iso)
      if (isNaN(d.getTime())) return ''
      return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + fmtTime(iso)
    }
    function fatigueColor(v) {
      if (v >= 65) return 'var(--bb-err)'
      if (v >= 40) return 'var(--bb-warn)'
      return 'var(--bb-ok)'
    }

    var DEFAULTS = {
      wake_time: '07:00',
      earliest_sleep: '22:00',
      latest_sleep: '09:00',
      mood_threshold_base: 65,
      mood_threshold_min: 52,
      mood_threshold_max: 78,
      wake_satisfied_fatigue: 20,
      nap_choice_fatigue: 45,
      nap_wait_minutes: 5,
      min_sleep_minutes: 30,
      max_sleep_hours: 12,
      max_nap_hours: 4,
      min_overnight_sleep_hours: 7,
      awake_gain_per_hour: 2.2,
      late_gain_per_hour: 6,
      message_gain: 0.15,
      group_message_gain: 0.05,
      recovery_per_hour: 7,
      offline_minutes: 10,
      initial_fatigue: 30,
    }

    var GROUPS = [
      {
        title: '作息',
        items: [
          { key: 'wake_time', label: '最早醒（HH:MM）', type: 'text' },
          { key: 'earliest_sleep', label: '允许困到睡的起点（HH:MM）', type: 'text' },
          { key: 'latest_sleep', label: '最晚睡回笼觉（HH:MM）', type: 'text' },
        ],
      },
      {
        title: '疲惫值怎么涨',
        items: [
          { key: 'awake_gain_per_hour', label: '白天每小时 +', type: 'number' },
          { key: 'late_gain_per_hour', label: '22:00-07:00 每小时 +', type: 'number' },
          { key: 'message_gain', label: '私聊一条消息 +', type: 'number' },
          { key: 'group_message_gain', label: '群里一条消息 +', type: 'number' },
        ],
      },
      {
        title: '什么时候算困',
        items: [
          { key: 'mood_threshold_base', label: '心情阈值基准', type: 'number' },
          { key: 'mood_threshold_min', label: '阈值下限', type: 'number' },
          { key: 'mood_threshold_max', label: '阈值上限', type: 'number' },
        ],
      },
      {
        title: '睡多久 / 醒来',
        items: [
          { key: 'wake_satisfied_fatigue', label: '醒来还困的线', type: 'number' },
          { key: 'nap_choice_fatigue', label: '困到多少才问再睡', type: 'number' },
          { key: 'nap_wait_minutes', label: '等回话的分钟数', type: 'number' },
          { key: 'min_overnight_sleep_hours', label: '过夜至少睡（小时）', type: 'number' },
          { key: 'min_sleep_minutes', label: '一次至少睡（分钟）', type: 'number' },
          { key: 'max_sleep_hours', label: '一觉最多（小时）', type: 'number' },
          { key: 'max_nap_hours', label: '小睡最多（小时）', type: 'number' },
        ],
      },
      {
        title: '恢复',
        items: [
          { key: 'recovery_per_hour', label: '睡着每小时 -', type: 'number' },
          { key: 'offline_minutes', label: '多久没动静算关机（分钟）', type: 'number' },
        ],
      },
    ]

    function pickConfig(config) {
      var out = {}
      var src = config && typeof config === 'object' ? config : {}
      Object.keys(DEFAULTS).forEach(function (k) {
        var v = src[k]
        if (k === 'wake_time' || k === 'earliest_sleep' || k === 'latest_sleep') {
          out[k] = typeof v === 'string' && /^\d{1,2}:\d{2}$/.test(v) ? v : DEFAULTS[k]
        } else {
          out[k] = Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : DEFAULTS[k]
        }
      })
      return out
    }

    function Icon(props) {
      var size = props.size || 18
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
        h('path', { d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z' }))
    }

    function Toast(props) {
      if (!props.toast) return null
      return h('div', { className: cx('bb-toast', props.toast.err && 'bb-toast-err'), role: 'status' }, props.toast.text)
    }

    function Boundary(props) {
      return h(ErrorBoundary, null, props.children)
    }
    // 用 class 捕获渲染错误（hooks 没有 componentDidCatch）
    class ErrorBoundary extends Component {
      constructor(p) { super(p); this.state = { error: null } }
      static getDerivedStateFromError(error) { return { error: error } }
      componentDidCatch(error) { try { console.error('[dsh-dafeiyu-sleep] 渲染失败：', error) } catch (e) { /* 忽略 */ } }
      render() {
        if (this.state.error) return h('div', { className: 'bb-error' }, '页面渲染出错：' + String(this.state.error.message || this.state.error) + '（刷新页面通常能恢复）')
        return this.props.children
      }
    }

    function Section() {
      var [data, setData] = useState(null)
      var [error, setError] = useState('')
      var [toast, setToast] = useState(null)
      var [busy, setBusy] = useState('')
      var [fatigueDraft, setFatigueDraft] = useState(50)
      var [draft, setDraft] = useState(DEFAULTS)
      var [rootDraft, setRootDraft] = useState('')
      var toastTimer = useRef(null)
      var inited = useRef(false)

      var showToast = useCallback(function (text, isErr) {
        clearTimeout(toastTimer.current)
        setToast({ text: text, err: !!isErr })
        toastTimer.current = setTimeout(function () { setToast(null) }, isErr ? 6000 : 3000)
      }, [])

      var reload = useCallback(function () {
        return apiGet('/state').then(function (s) { setData(s); setError('') }, function (e) { setError(errText(e)) })
      }, [])

      useEffect(function () {
        reload()
        var t = setInterval(reload, POLL_MS)
        return function () { clearInterval(t); clearTimeout(toastTimer.current) }
      }, [])

      useEffect(function () {
        if (data && !inited.current) {
          inited.current = true
          var st = data.state || {}
          setFatigueDraft(Math.round(Number(st.fatigue) || 0))
          setDraft(pickConfig(data.config))
          if (typeof data.root === 'string') setRootDraft(data.root)
        }
      }, [data])

      function setField(key, value) {
        setDraft(function (prev) {
          var next = {}
          Object.keys(prev).forEach(function (k) { next[k] = prev[k] })
          next[key] = value
          return next
        })
      }

      function act(op, label) {
        setBusy(op)
        apiPost('/action', { op: op }).then(function () {
          showToast(label + '：已交给 AstrBot，最多 30 秒生效')
          setTimeout(reload, 1200)
        }, function (e) {
          showToast('没成功：' + errText(e), true)
        }).then(function () { setBusy('') })
      }

      function saveRoot() {
        var v = String(rootDraft || '').trim()
        if (v === '') { showToast('先填 AstrBot 根目录', true); return }
        setBusy('root')
        apiPost('/root', { root: v }).then(function (r) {
          showToast('目录已保存：' + r.root)
          setRootDraft(r.root)
          setTimeout(reload, 800)
        }, function (e) {
          showToast('没成功：' + errText(e), true)
        }).then(function () { setBusy('') })
      }

      function applyFatigue() {
        var v = Number(fatigueDraft)
        if (!Number.isFinite(v)) { showToast('疲劳值要是数字', true); return }
        setBusy('fatigue')
        apiPost('/fatigue', { value: v }).then(function () {
          showToast('疲劳值已改成 ' + Math.round(v) + '，AstrBot 下一轮认')
          setTimeout(reload, 1200)
        }, function (e) {
          showToast('没成功：' + errText(e), true)
        }).then(function () { setBusy('') })
      }

      function saveParams() {
        var patch = {}
        GROUPS.forEach(function (g) {
          g.items.forEach(function (it) {
            var v = draft[it.key]
            if (v === undefined || v === '') return
            patch[it.key] = it.type === 'text' ? String(v).trim() : Number(v)
          })
        })
        setBusy('config')
        apiPost('/config', { patch: patch }).then(function () {
          showToast('参数已提交，AstrBot 下一轮（30 秒内）生效')
          setTimeout(reload, 1200)
        }, function (e) {
          showToast('没成功：' + errText(e), true)
        }).then(function () { setBusy('') })
      }

      if (error && !data) {
        return h('div', { className: 'bb-root' }, [
          h('div', { key: 'h', className: 'bb-head' }, [
            h('div', { key: 'l', className: 'bb-logo' }, h(Icon, { size: 20 })),
            h('div', { key: 't', className: 'bb-grow' }, h('div', { className: 'bb-h1' }, '大肥鱼睡觉')),
          ]),
          h('div', { key: 'e', className: 'bb-error' }, '连不上插件宿主接口：' + error + '。刚装好的话重启一次 DSH。'),
        ])
      }
      if (!data) {
        return h('div', { className: 'bb-root' }, h('div', { className: 'bb-note' }, '加载中…'))
      }

      var st = data.state || {}
      var cfg = draft
      var fatigue = Number(st.fatigue) || 0
      var threshold = Number(st.sleep_threshold) || Number(cfg.mood_threshold_base) || 65
      var sleeping = st.phase === 'sleeping'
      var napPending = !!st.pending_nap_until
      var missing = data.detected === false
      var pill = sleeping
        ? h('span', { key: 'p', className: 'bb-pill' }, [h('span', { key: 'd', className: 'bb-dot bb-dot-sleep' }), '睡着 · 约 ' + fmtTime(st.wake_at) + ' 醒'])
        : napPending
          ? h('span', { key: 'p', className: 'bb-pill' }, [h('span', { key: 'd', className: 'bb-dot bb-dot-warn' }), '醒着 · 等回话到 ' + fmtTime(st.pending_nap_until)])
          : h('span', { key: 'p', className: 'bb-pill' }, [h('span', { key: 'd', className: 'bb-dot bb-dot-ok' }), '醒着'])
      var barColor = fatigue >= 65 ? 'bb-fill bb-fill-hot' : 'bb-fill'
      var pending = data.controlPending

      return h('div', { className: 'bb-root' }, [
        h('div', { key: 'head', className: 'bb-head' }, [
          h('div', { key: 'l', className: 'bb-logo' }, h(Icon, { size: 20 })),
          h('div', { key: 't', className: 'bb-grow' }, [
            h('div', { key: 'a', className: 'bb-h1' }, '大肥鱼睡觉'),
            h('div', { key: 'b', className: 'bb-sub' }, '疲惫值、睡没睡、什么时候醒，全在这儿调。改完 30 秒内 AstrBot 认。'),
          ]),
          pill,
        ]),

        h('div', { key: 'root', className: 'bb-card' }, [
          h('div', { key: 't', className: 'bb-h2' }, 'AstrBot 目录'),
          h('div', { key: 'r', className: 'bb-row' }, [
            h('input', {
              key: 'i', className: 'bb-input', style: { flex: '1 1 260px' },
              value: rootDraft, placeholder: 'D:\\dafeiyu', spellCheck: false,
              onChange: function (e) { setRootDraft(e.target.value) },
            }),
            h('button', { key: 'b', type: 'button', className: 'bb-btn', disabled: busy !== '', onClick: saveRoot }, busy === 'root' ? '保存中…' : '保存目录'),
          ]),
          h('div', { key: 'n', className: 'bb-note', style: { marginTop: '8px' } }, '填 AstrBot 的安装根目录（里面应有 astrbot\\data 和 private）。默认 D:\\dafeiyu。'),
        ]),

        missing ? h('div', { key: 'missing', className: 'bb-error' }, '这个目录下没找到睡觉插件的数据：确认 AstrBot 装在这里，并且装了 astrbot_plugin_dafeiyu_sleep。') : null,

        error ? h('div', { key: 'err', className: 'bb-error' }, '读状态失败：' + error) : null,

        missing ? null : h('div', { key: 'state', className: 'bb-card' }, [
          h('div', { key: 'f', className: 'bb-fatigue' }, [
            h('div', { key: 'n', className: 'bb-big', style: { color: fatigueColor(fatigue) } }, String(Math.round(fatigue))),
            h('div', { key: 'u', className: 'bb-unit' }, '/100 疲惫'),
            h('div', { key: 's', className: 'bb-grow' }),
            h('div', { key: 'h', className: 'bb-note' }, sleeping ? '睡着中，醒点 ' + fmtTime(st.wake_at) : napPending ? '再睡会儿的等待中' : '醒着'),
          ]),
          h('div', { key: 'bar', className: 'bb-bar' }, [
            h('div', { key: 'fill', className: barColor, style: { width: Math.max(0, Math.min(100, fatigue)) + '%' } }),
            h('div', { key: 'tick', className: 'bb-tick', style: { left: Math.max(0, Math.min(100, threshold)) + '%' } }),
            h('div', { key: 'tl', className: 'bb-tick-label', style: { left: Math.max(0, Math.min(100, threshold)) + '%' } }, '困到 ' + Math.round(threshold) + ' 倒下'),
          ]),
          h('div', { key: 'legend', className: 'bb-legend' }, [
            h('span', { key: 'a' }, '阈值按此刻心情算'),
            h('span', { key: 'b' }, '上次醒：' + (st.last_wake_at ? fmtDate(st.last_wake_at) : '—')),
            h('span', { key: 'c' }, '状态更新：' + (data.share && data.share.updated_at ? fmtDate(data.share.updated_at) : '—')),
          ]),
          h('div', { key: 'grid', className: 'bb-grid' }, [
            h('div', { key: 'g1', className: 'bb-cell' }, [h('div', { className: 'bb-cell-k' }, '现在'), h('div', { className: 'bb-cell-v' }, sleeping ? '在睡' : napPending ? '等回话' : '醒着')]),
            h('div', { key: 'g2', className: 'bb-cell' }, [h('div', { className: 'bb-cell-k' }, '下一次醒点'), h('div', { className: 'bb-cell-v' }, sleeping ? fmtTime(st.wake_at) : '—')]),
            h('div', { key: 'g3', className: 'bb-cell' }, [h('div', { className: 'bb-cell-k' }, '这一觉的阈值'), h('div', { className: 'bb-cell-v' }, Math.round(threshold) + '')]),
            h('div', { key: 'g4', className: 'bb-cell' }, [h('div', { className: 'bb-cell-k' }, '睡眠开始'), h('div', { className: 'bb-cell-v' }, st.sleep_started_at ? fmtTime(st.sleep_started_at) : '—')]),
          ]),
          pending ? h('div', { key: 'p', className: 'bb-note', style: { marginTop: '10px' } }, '面板的改动已排队，等 AstrBot 下一轮执行。') : null,
        ]),

        missing ? null : h('div', { key: 'quick', className: 'bb-card' }, [
          h('div', { key: 't', className: 'bb-h2' }, '现在动她'),
          h('div', { key: 'r', className: 'bb-row' }, [
            h('button', { key: 's', type: 'button', className: 'bb-btn', disabled: sleeping || busy !== '', onClick: function () { act('sleep', '让她去睡') } }, '现在去睡'),
            h('button', { key: 'w', type: 'button', className: 'bb-btn', disabled: !sleeping || busy !== '', onClick: function () { act('wake', '叫醒') } }, '叫醒'),
            h('button', { key: 'c', type: 'button', className: 'bb-btn', disabled: busy !== '', onClick: function () { act('continue', '接着睡') } }, '接着睡'),
            h('button', { key: 'n', type: 'button', className: 'bb-btn', disabled: !napPending || busy !== '', onClick: function () { act('cancel_nap', '取消等待') } }, '取消等待'),
          ]),
          h('div', { key: 'n', className: 'bb-note', style: { marginTop: '8px' } }, '「现在去睡」会走正常睡前流程（她会真发一句睡前话）；叫醒会发醒后报备。'),
        ]),

        missing ? null : h('div', { key: 'fatigue', className: 'bb-card' }, [
          h('div', { key: 't', className: 'bb-h2' }, '把疲惫值改成'),
          h('div', { key: 'r', className: 'bb-row', style: { alignItems: 'flex-end' } }, [
            h('input', {
              key: 'slider', type: 'range', min: 0, max: 100, step: 1,
              className: 'bb-slider', style: { flex: '1 1 180px' },
              value: Number(fatigueDraft),
              onChange: function (e) { setFatigueDraft(Number(e.target.value)) },
            }),
            h('div', { key: 'num', className: 'bb-field', style: { flex: '0 0 90px' } }, [
              h('input', {
                key: 'i', type: 'number', min: 0, max: 100, className: 'bb-input',
                value: Number(fatigueDraft),
                onChange: function (e) { setFatigueDraft(Number(e.target.value)) },
              }),
            ]),
            h('button', { key: 'b', type: 'button', className: 'bb-btn bb-btn-primary', disabled: busy !== '', onClick: applyFatigue }, '应用'),
          ]),
          h('div', { key: 'n', className: 'bb-note', style: { marginTop: '8px' } }, '设到阈值以上、又在允许时段，她下一轮就会自己倒下；设低就是让她清醒。'),
        ]),

        missing ? null : h('div', { key: 'params', className: 'bb-card' }, [
          h('div', { key: 't', className: 'bb-h2' }, '作息参数'),
          h('div', { key: 'g', className: 'bb-groups' }, GROUPS.map(function (g) {
            return h('div', { key: g.title, className: 'bb-group' }, [
              h('div', { key: 'gt', className: 'bb-note', style: { marginBottom: '8px' } }, g.title),
              h('div', { key: 'f', className: 'bb-fields' }, g.items.map(function (it) {
                return h('label', { key: it.key, className: 'bb-field' }, [
                  h('span', { key: 'k', className: 'bb-field-k' }, it.label),
                  h('input', {
                    key: 'i',
                    className: 'bb-input',
                    type: it.type === 'text' ? 'text' : 'number',
                    step: it.type === 'text' ? undefined : 'any',
                    value: draft[it.key],
                    onChange: function (e) { setField(it.key, e.target.value) },
                  }),
                ])
              })),
            ])
          })),
          h('div', { key: 'r', className: 'bb-row', style: { marginTop: '14px' } }, [
            h('button', { key: 'b', type: 'button', className: 'bb-btn bb-btn-primary', disabled: busy !== '', onClick: saveParams }, busy === 'config' ? '保存中…' : '保存参数'),
            h('span', { key: 'n', className: 'bb-note' }, '保存会写回 AstrBot 的插件配置，重启也不丢。'),
          ]),
        ]),

        h(Toast, { key: 'toast', toast: toast }),
      ])
    }

    function apply(ctx) {
      ctx.effect(function () {
        var id = 'dsh-dafeiyu-sleep-styles'
        var el = document.getElementById(id)
        if (el === null) {
          el = document.createElement('style')
          el.id = id
          el.setAttribute('data-plugin', 'dsh-dafeiyu-sleep')
          document.head.appendChild(el)
        }
        el.textContent = CSS
        return function () { var x = document.getElementById(id); if (x && x.parentNode) x.parentNode.removeChild(x) }
      }, 'dsh-dafeiyu-sleep: styles')
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register({
          name: 'settings.section',
          id: 'dafeiyu-sleep',
          order: 49,
          label: function () { return '大肥鱼睡觉' },
        }, function () { return h(Boundary, null, h(Section)) })
      })
    }

    module.exports = {
      name: 'dafeiyu-sleep',
      inject: ['slots'],
      apply: apply,
      __test: { Section: Section, ErrorBoundary: ErrorBoundary, pickConfig: pickConfig, fmtTime: fmtTime },
    }
    return module.exports
  },
})
