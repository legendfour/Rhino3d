// Edit this file to change the title, part labels, descriptions and button actions.
// Each `match` is compared with the exported glTF object name (case-insensitive).
export const config = {
  title: '轻型机械装配 · 交互展示',
  modelUrl: './assets/model.glb',
  parts: [
    { id: 'base', match: ['base', '底座'], name: '承载底座', description: '承载整机结构的基础组件。', color: '#8d9bb2' },
    { id: 'column', match: ['column', '立柱'], name: '支撑立柱', description: '连接底座与上部机构的支撑件。', color: '#b8f36b' },
    { id: 'arm', match: ['arm', '摆臂'], name: '连接摆臂', description: '可通过分解视图观察其装配位置。', color: '#8898ff' },
    { id: 'head', match: ['head', '机头'], name: '上部机头', description: '模型的上部功能组件。', color: '#ef9d6b' },
    { id: 'wheel', match: ['wheel', '旋钮'], name: '调节旋钮', description: '点击选中后可单独聚焦或隐藏。', color: '#54c7b5' }
  ],
  actions: [
    { id: 'explode', label: '分解装配', detail: '查看部件组成关系', icon: '✣', type: 'explode' },
    { id: 'materials', label: '材质预览', detail: '切换展示材质', icon: '◈', type: 'materials' },
    { id: 'reset', label: '恢复完整模型', detail: '重置模型显示状态', icon: '↺', type: 'reset' }
  ]
};
