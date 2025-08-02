#!/bin/bash

# 🍄 MARIO'S ONE-COMMAND INSTALLER 🍄
# "It's-a me! I install-a the working agents!"

echo "🍄 MARIO SAYS: Installing Agent Registry..."

# Get Claude Code config directory
CLAUDE_CONFIG_DIR="$HOME/.claude"
MCP_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Create config directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Check if config file exists
if [ ! -f "$MCP_CONFIG_FILE" ]; then
    echo "Creating new Claude Code config..."
    cat > "$MCP_CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "mario-agents": {
      "command": "node",
      "args": ["/Users/maxyolo/Documents/projects/component-breaker/claude-agents-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF
else
    echo "📝 Claude Code config exists. Please manually add this to your mcpServers:"
    echo ""
    echo '"mario-agents": {'
    echo '  "command": "node",'
    echo '  "args": ["/Users/maxyolo/Documents/projects/component-breaker/claude-agents-mcp/dist/index.js"],'
    echo '  "env": {'
    echo '    "NODE_ENV": "production"'
    echo '  }'
    echo '}'
    echo ""
fi

echo "🚀 MARIO'S MAGIC COMPLETE!"
echo ""
echo "🎯 Next Steps:"
echo "1. Restart Claude Code"
echo "2. Try: 'Use the cloudflare-workers-architect agent to deploy my app'"
echo "3. WAHOO! 🍄"
echo ""
echo "🍄 Mario says: 'It's-a working! Ship-a da real agents!'"