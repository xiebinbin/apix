# API

## 创建访问记录

### 请求地址

`POST https://apix.leleshuju.com/api/access-record/create`

### 请求头参数

- `package-name`: 包名
- `uuid`: 用户唯一标识

### 返回数据

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "result": true
  }
}
```
