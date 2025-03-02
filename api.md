# API

### 全局请求头参数

- `package-name`: 包名
- `uuid`: 用户唯一标识
- `model`: 机型
- `os-version`: 系统版本
- `channel-name`: 渠道

## 系统状态

### 请求地址

`POST https://apix.leleshuju.com/api/sys/status`

### 请求参数

- `adId`: 广告ID

### 返回数据

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 渠道开关
    "channel_power": "on",
    // 广告开关 每12小时 一个uuid及adid只展示一次
    "ad_power": "on"
  }
}
```

### sdk运行日志上报

### 请求地址

`POST https://apix.leleshuju.com/api/sdk/log`

### 请求参数
- `status`: // 状态: INIT_SUCCESS.初始化成功 INIT_FAIL.初始化失败 WAKE_UP.唤醒

### 返回数据

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 广告运行日志上报

### 请求地址

`POST https://apix.leleshuju.com/api/ad/log`

### 请求参数

- `adId`: 广告ID
- `status`: INIT_SUCCESS.初始化成功 INIT_FAIL.初始化失败 SHOW_SUCCESS.展现成功 SHOW_FAIL.展现失败 CLICK_SUCCESS.点击成功 CLICK_FAIL.点击失败 PLAY_SUCCESS 播放成功 PLAY_FAIL 播放失败 DIALOG_SUCCESS 显示框关闭成功 DIALOG_FAIL 显示框关闭失败

### 返回数据

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```
