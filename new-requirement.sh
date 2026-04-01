#!/bin/bash
# 创建新需求文件夹
# 用法: ./new-requirement.sh 需求名称
#
# 示例:
#   ./new-requirement.sh agent-workflow-builder
#   ./new-requirement.sh chat-interface
#   ./new-requirement.sh dashboard-redesign

if [ -z "$1" ]; then
  echo "❌ 请输入需求名称"
  echo "用法: ./new-requirement.sh <需求名称>"
  echo "示例: ./new-requirement.sh agent-workflow-builder"
  exit 1
fi

NAME="$1"
DATE=$(date +%Y%m%d)
DIR="requirements/${DATE}-${NAME}"

if [ -d "$DIR" ]; then
  echo "❌ 文件夹已存在: $DIR"
  exit 1
fi

# 从模板复制
cp -r requirements/.template "$DIR"

echo "✅ 已创建: $DIR/"
echo ""
echo "  📄 $DIR/requirement.json  ← 填写需求"
echo "  📋 $DIR/README.md         ← 进度追踪"
echo ""
echo "下一步: 编辑 requirement.json，然后运行:"
echo ""
echo "  cd \"$(pwd)\""
echo "  claude"
echo "  /agent mira-design-team"
echo "  需求：请阅读 $DIR/requirement.json"
