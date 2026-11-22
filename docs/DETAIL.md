# dsh-dafeiyu-sleep

设置页面板：看和改 AstrBot「大肥鱼睡觉」插件的状态与参数。

## 面板

- 状态卡：疲惫值、阈值刻度、醒/睡/等回话、下次醒点、上次醒点
- 快捷操作：去睡 / 叫醒 / 接着睡 / 取消等待
- 疲惫值编辑器：0–100 滑块 + 数字框
- 参数表：作息、疲惫值增速、困意阈值、睡眠时长、恢复速率
- AstrBot 目录：可配置，默认 `D:\dafeiyu`，存 `~/.dsh/dafeiyu-sleep/settings.json`，env `DAFEIYU_ROOT` 优先

## 数据流

```
DSH 面板 ──GET /state──▶ 读 state.json / config.json / sleep-state.json
DSH 面板 ──POST /fatigue|/action|/config──▶ 写 <root>\private\sleep-control.json
AstrBot 插件 ──每 30s 轮询──▶ 执行控制文件并删除
```

不占端口，不改 AstrBot 进程内存。状态最多滞后 30 秒。

## 依赖

AstrBot 插件 `astrbot_plugin_dafeiyu_sleep` 必须已安装并运行，否则面板显示「没找到睡觉插件的数据」。

## 验证

```bash
node --check lib/index.js
node --check lib/client.js
```

装进 DSH profile 后：设置 → 大肥鱼睡觉 → 应看到状态卡和参数表；改一次疲劳值，AstrBot 日志应出现「面板把疲劳值设成 …」。
