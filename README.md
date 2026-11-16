# Vim 分屏搜索高亮同步

在内存包装 VSCodeVim 1.32.4 的原生搜索绘制，以每个 TextEditor 的 WeakMap 缓存替代共享文档缓存。

可见编辑器、活动标签、文档和配置变化触发去抖刷新；没有常驻周期轮询，不移动焦点或选区。

## 安装

这是独立 Git 仓库，可单独上传 GitHub。构建仅依赖 Bash、Python 3 标准库；逻辑模块使用 Node 18+。安装位置为实际运行 VS Code 窗口的 UI 端，当前部署目标为 Windows Code 1.145.2 + WSL Ubuntu 26.04。

```sh
bash package.sh
code --install-extension dist/local.vim-search-highlight-sync-0.1.0.vsix --force
```

Windows 上建议用 Windows Code CLI 安装。WSL 的 `code` 默认可能转交远程端，不要据此误判 UI 扩展安装位置。`package.json` 声明 `extensionKind: ["ui"]`。

`config/settings.json` 和 `config/keybindings.json` 是本功能配置片段，必须按键/映射合并，不能整份覆盖已有配置。完整键位与保留 JSONC 注释的合并、备份、回滚工具见同级独立仓库 `vscode-custom-keybindings`。安装后由用户在合适时机 Reload Window；本脚本不会重启编辑器。

## 测试

```sh
node --test test/*.test.js
```

联合回归：`cd ../vscode-custom-keybindings && bash test/run-integration.sh`。测试创建独立 Xvnc、用户配置、扩展目录和工作区；不使用登录态，不向日常桌面发送按键。Linux Code 测试运行副本与 VSCodeVim 1.32.4 的位置可通过 `EDITOR_TOOLS_TEST_CODE` / `EDITOR_TOOLS_TEST_VIM` 指定。

2026-11-16 的联合结果：SV、Visual、分屏搜索、颜色标记次数/固定坐标、marker 一次撤销、Enter、快速分屏、Leader 共存、局部编辑区/终端限制均通过 Linux Code 1.145.2 集成检查。**这不等于 Windows 拼音和真实 Codex 提交已验收。** 原始结果在联合仓库的 `test-results/`，该目录不加入 Git。

## 停用与卸载

```sh
code --uninstall-extension local.vim-search-highlight-sync
```

在统一键位仓库执行受保护回滚，或仅删本仓库 config 中对应的键/映射。若安装后用户继续编辑了配置，回滚器拒绝覆盖后续修改，应根据备份合并恢复。

## 兼容范围和限制

依赖 VSCodeVim 私有接口，其他版本保持原行为。集成测试验证绘制函数调用及选区保持，尚未用截图逐像素比较每种主题。

备份、测试日志、运行副本、VSIX、编译产物不纳入 Git。没有复制浏览器/Codex 凭据。源码按 MIT 许可提供。
