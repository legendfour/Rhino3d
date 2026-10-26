# Rhino 交互模型网页展示

这是一个可直接运行和发布的静态网页项目。它内置了轻型机械装配示例；放入 Rhino 导出的 GLB 后，网页会优先展示你的模型。访客不需要安装软件或登录即可打开公开链接。页面提供旋转、缩放、部件选择、聚焦、隐藏/显示、材质切换和分解视图。

## 文件结构

```text
rhino-web-viewer/
├─ index.html                 网页入口
├─ styles.css                 页面样式
├─ src/
│  ├─ main.js                 模型加载、点击选择和交互逻辑
│  └─ config.js               标题、部件名称和交互按钮配置
├─ assets/
│  └─ model.glb               放置 Rhino 导出的模型（需自行导出）
└─ .github/workflows/deploy.yml  GitHub Pages 自动发布
```

目前没有 `assets/model.glb` 时会显示内置示例模型。Three.js 通过 CDN 加载，访客浏览网页时需要联网。

## 一、在 Rhino 中准备模型

1. **整理部件和名称。** 将希望单独点击、隐藏或分解的几何体作为独立 Rhino 对象；用容易辨认的对象名称或图层名称命名。可用 `Properties` 属性面板里的对象名称字段设置名字，例如 `Base`、`Column`、`Arm`、`Head`、`Wheel`。这些名称会用来匹配交互配置。
2. **检查方向和材质。** Rhino 是 Z 轴向上；导出时启用 **Map Rhino Z to glTF Y**，网页里模型会保持竖直。需要颜色时给对象设置材质或显示颜色。
3. **导出 GLB。** 选中要展示的对象，执行 `Export Selected`（或 `Save As`），文件类型选 `GL Transmission Format (*.glb; *.gltf)`，保存为 `model.glb`。在导出选项里启用 **Export materials**、**Use display color for objects with no material set**、**Export layers**、**Export vertex normals**；确认开放网格也需要展示时启用 **Export open meshes**。如果模型文件较大，可启用 Draco 压缩，再检查浏览器效果。
4. 将导出的 `model.glb` 放到本项目的 `assets` 文件夹，覆盖（或新建）同名文件。保持文件名完全一致。
5. 若需要核对导出效果，可在 Rhino 中重新打开导出的 GLB；或在网页本地预览。NURBS 曲面在导出时会按 Rhino 文档的渲染网格设置转换成网格，过密模型会让网页加载变慢。

> Rhino 8 原生支持 GLB/glTF 导入和导出。若使用更早版本且没有 GLB 导出选项，可用 Rhino 的 OBJ 导出再通过 Blender 转换为 GLB；优先使用 Rhino 8 的原生导出以减少转换步骤。

## 二、配置部件介绍和交互按钮

打开 `src/config.js`。`title` 是页面标题；`parts` 中每项包括：

- `id`：稳定的部件标识。示例模型的分解动画会识别 `base`、`column`、`arm`、`head`、`wheel`。
- `match`：用于匹配 GLB 中对象名称的词语，忽略大小写。例如 Rhino 对象名为 `Upper Arm`，可使用 `['arm', '摆臂']`。
- `name`、`description`、`color`：侧栏名称、说明和标记颜色。

把 Rhino 对象命名为和示例对应的英文关键词（或配置中的中文关键词），网页会自动把同类对象放进同一部件。每个对象仍须是独立对象，才能单独点击。`actions` 可修改三个侧栏按钮：`explode` 展开部件、`materials` 切换哑光/金属效果、`reset` 恢复显示。

分解动画适用于对象原点/几何中心大致对应各部件中心的常见装配模型。如果模型的部件分类不同，改 `src/main.js` 中 `setExploded()` 的 `offsets`（按 `parts[].id` 设置各方向位移），或删除分解按钮并保留其他交互即可。按钮动作由 `actions[].type` 对应到 `act()`，可继续按需扩展。

## 三、本地预览

不要双击 `index.html` 用 `file://` 打开，因为浏览器会限制 ES 模块和模型文件加载。用任意本地静态服务器预览，例如：

1. 安装 Node.js（LTS 版本即可）。
2. 在项目目录打开终端，执行 `npx vite --host 0.0.0.0`。
3. 按终端显示的地址在浏览器打开网页（通常是 `http://localhost:5173`）。首次运行可能需要联网下载 Vite。也可在 VS Code 安装 Live Server 扩展后，右键 `index.html` 选择 **Open with Live Server**。

## 四、发布到公开链接（GitHub Pages）

项目已带自动发布工作流 `.github/workflows/deploy.yml`，无需编写代码。

1. 登录 GitHub，创建一个 **Public** 仓库，例如 `rhino-interactive-model`。
2. 将本项目所有文件上传到仓库根目录（包括 `index.html`、`src`、`assets` 和 `.github/workflows`）。上传自己的 `assets/model.glb` 后再发布。
3. 打开仓库 **Settings → Pages**，将 **Build and deployment → Source** 设为 **GitHub Actions**。
4. 打开 **Actions** 页面，等待 `Deploy to GitHub Pages` 工作流完成。完成后在 **Settings → Pages** 可看到公开链接，通常为 `https://你的用户名.github.io/仓库名/`。
5. 后续替换模型或修改配置后，将更改上传到默认分支，工作流会自动更新网站。将该网址发给访客即可。

GitHub Pages 适合公开展示的静态项目。公开仓库里的模型文件可被下载，请不要放入不希望公开的设计资料。大体量模型可能超过托管或访客网络的实际加载能力；建议在 Rhino 网格设置中控制精度，并使用 GLB/Draco 压缩。

## 常见问题

- **仍然显示示例模型：** 确认模型路径为 `assets/model.glb`、名称大小写正确，且发布后文件确实已上传。浏览器开发者工具的网络面板也可查看 GLB 是否 404。
- **点击不到某些部件：** 检查该部件是否作为独立对象导出；避免只用图层分组而对象合并。`Export layers` 会保留图层信息，但网页当前的部件匹配以导出的网格对象名称为准。
- **模型横倒或朝向不对：** 重新导出并检查 **Map Rhino Z to glTF Y**；也可以在 Rhino 中调整模型方向后重新导出。
- **模型太大或加载慢：** 降低渲染网格细分精度；移除不展示的对象；尝试 Draco 压缩并在浏览器中确认能正常加载。
- **材质外观与 Rhino 不同：** glTF 使用 PBR 材质，部分 Rhino 渲染器特性不会完整保留。建议用基础金属度/粗糙度材质，并检查导出的 GLB。

## 技术路线与局限

Rhino 8 导出 GLB → Three.js 的 `GLTFLoader` 加载模型 → `OrbitControls` 提供鼠标/触屏视角控制 → 按对象名配置点击和按钮行为 → GitHub Pages 发布静态文件。模型几何和交互都在访客浏览器内运行，不依赖数据库或服务端。复杂时间轴动画、用户权限、私有模型访问或内容管理后台不包含在本项目中。
