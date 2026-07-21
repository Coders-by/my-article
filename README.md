# my-article

一个适合慢读的个人文章库。

## 页面结构

- `index.html`：文章库首页，支持分类筛选与关键词搜索。
- `reader.html?id=...`：统一阅读入口。
- `articles/`：文章内容。
  - `convergence.html`：越聪明的系统，越需要收敛
  - `compound.html`：让开发长出复利
  - `language.html`：语言停顿的间隙

项目不依赖构建工具，直接用静态服务器打开即可：

```bash
python3 -m http.server 8000
```
