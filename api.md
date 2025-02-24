# API

### 请求头参数

- `package-name`: 包名
- `uuid`: 用户唯一标识

## 广告运行状态(展现前请求，确认是否可以展现)

### 请求地址

`POST https://apix.leleshuju.com/api/access-statistic/status`


### 返回数据

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "result": true // true 可 false 不可
  }
}
```

### 广告运行统计 (广告展现执行后的回调 确认是否成功)

### 请求地址

`POST https://apix.leleshuju.com/api/ad-statistic/run`

### 请求参数

- `adId`: 广告ID
- `status`: 状态 1: 成功 2: 失败

### 返回数据

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

### 初始化统计 （上报初始化状态）

### 请求地址

`POST https://apix.leleshuju.com/api/ad-statistic/init`

### 请求参数

- `adId`: 广告ID
- `status`: 状态 1: 成功 2: 失败

### 返回数据

```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```
