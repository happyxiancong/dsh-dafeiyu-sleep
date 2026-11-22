# dsh-dafeiyu-sleep

给 [AstrBot](https://github.com/AstrBotDevs/AstrBot) 的「大肥鱼睡觉」插件配一块 DSH 设置页：**疲惫值、睡没睡、什么时候醒、作息参数，一页看完改完**。

它不自己发消息，也不占端口。只做两件事：

- 读 AstrBot 睡觉插件写下的状态文件，显示成面板；
- 把你在面板上的改动写成一个控制文件，由 AstrBot 插件下一轮（30 秒内）执行。

> 这个面板是 AstrBot 插件 `astrbot_plugin_dafeiyu_sleep` 的配套界面。**没装那个插件，面板会是空的。**

## 装之前

1. 已经装好 AstrBot，并且装上了睡觉插件 `astrbot_plugin_dafeiyu_sleep`（疲惫值 + 困了才睡 + 睡前/醒后报备那个）。
2. 知道 AstrBot 的安装根目录。典型的目录长这样：

```
D:\dafeiyu\
├─ astrbot\data\plugin_data\astrbot_plugin_dafeiyu_sleep\state.json
├─ astrbot\data\config\astrbot_plugin_dafeiyu_sleep_config.json
└─ private\sleep-state.json
```

## 装

在 DSH 的 **插件市场**里搜 `dsh-dafeiyu-sleep`，或者 **Plugins → Add plugin** 指向本仓库目录。

装好后打开 **设置 → 大肥鱼睡觉**。

## 第一次用：填 AstrBot 目录

面板顶部有一行「AstrBot 目录」，默认 `D:\dafeiyu`。你的 AstrBot 装在别处就改成你的根目录，点「保存目录」。

保存到 `~/.dsh/dafeiyu-sleep/settings.json`；也可以用环境变量 `DAFEIYU_ROOT` 覆盖（优先级最高）。

目录没指对时，面板会提示「没找到睡觉插件的数据」，不会乱写东西。

## 面板能干什么

- **状态**：疲惫值（0–100）、进度条和「困到多少倒下」的阈值刻度、醒着/睡着/等回话、这一觉几点醒、上次醒的时间。
- **现在动她**：去睡（走正常睡前流程，会发睡前话）、叫醒（发醒后报备）、接着睡、取消「再睡会儿」的等待。
- **改疲惫值**：滑块或数字，0–100，AstrBot 下一轮生效。
- **改参数**：白天/夜间每小时涨多少、私聊/群消息消耗、恢复速率、心情阈值上下限、至少睡多久、最多睡多久、关机判定分钟数等。保存会写回 AstrBot 的插件配置文件，重启不丢。

## 它是怎么改到 AstrBot 的

AstrBot 插件内存里有一份状态，每 30 秒写回一次文件；直接改 `state.json` 会被覆盖。所以这里走控制文件：

```
<AstrBot 根目录>\private\sleep-control.json
```

面板写这个文件 → AstrBot 睡觉插件每轮检查 → 读到就执行并删掉 → 日志里留一行「面板把疲劳值设成 55.0」之类。

好处是 DSH 和 AstrBot 不用互相开端口，也不碰对方进程内存。代价是最多 30 秒延迟。

## 常见问题

**面板一直「加载中…」/ 连不上宿主接口**
刚装完插件重启一次 DSH。

**显示「没找到睡觉插件的数据」**
AstrBot 目录填错了，或者还没装 `astrbot_plugin_dafeiyu_sleep`。检查上面「装之前」里的那几个文件在不在。

**改了没反应**
看 AstrBot 的 `run.log`，搜「面板」。如果日志里没有，多半是目录指错或插件没在跑。

## License

MIT
