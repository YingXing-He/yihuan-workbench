# 一键部署到 Gitee Pages（解决 GitHub Pages 在国内的卡顿/加载慢）
# 前置：① 已在 gitee.com 注册并完成实名认证；② 已创建同名公开仓库（如 yihuan-workbench）
# 用法（在 workbench 目录的 PowerShell 中）：
#   powershell -ExecutionPolicy Bypass -File deploy-gitee.ps1
#   powershell -ExecutionPolicy Bypass -File deploy-gitee.ps1 -User 你的gitee用户名
param(
  [string]$User,
  [string]$Repo = 'yihuan-workbench'
)
if (-not $User) { $User = Read-Host '请输入 Gitee 用户名' }
if (-not $User) { Write-Host '未输入用户名，已取消。'; exit 1 }

git remote remove gitee 2>$null
git remote add gitee "https://gitee.com/$User/$Repo.git"
Write-Host "已添加 Gitee 远程：https://gitee.com/$User/$Repo.git"

Write-Host "开始推送到 Gitee（如首次会要求输入 Gitee 账号密码 / 私人令牌）..."
git push -u gitee main

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "✅ 推送成功！接下来在 Gitee 网页操作："
  Write-Host "  1. 进入仓库 → 顶部「服务」→「Gitee Pages」"
  Write-Host "  2. 部署分支选 main，部署目录选「根目录 /」，点击「启动」"
  Write-Host "  3. 实名认证后约 1-5 分钟生效，得到 https://$User.gitee.io/$Repo/ 这样的地址"
  Write-Host "  4. 之后每次更新只需重新运行本脚本（或 git push gitee main）"
} else {
  Write-Host "❌ 推送失败，请检查：Gitee 用户名/仓库名是否正确、仓库是否已创建、网络与凭证。"
}
