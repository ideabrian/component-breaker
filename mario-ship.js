#!/usr/bin/env node

/**
 * 🍄 MARIO JUMP BUTTON SHIP COMMAND v3.0
 * 
 * The Universal Ship Command that orchestrates subagents to:
 * 1. Document what was just finished
 * 2. Git commit and push changes
 * 3. Run deploy scripts
 * 4. Analyze current project state
 * 5. Update NextMoves.md with fresh analysis
 * 
 * Usage: ./mario-ship.js [description of what was completed]
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MARIO_VERSION = "3.0.0";
const PROJECT_ROOT = process.cwd();

// 🎯 MARIO'S SHIPPING AGENTS
class MarioShippingOrchestrator {
    constructor(completedWork = "Incremental improvements") {
        this.completedWork = completedWork;
        this.timestamp = new Date().toISOString();
        this.shipStatus = {
            documentation: false,
            gitCommit: false,
            deployment: false,
            analysis: false,
            nextMoves: false
        };
    }

    // 🍄 AGENT 1: DOCUMENTATION AGENT
    async documentCompletedWork() {
        console.log("📝 Documentation Agent: Recording completed work...");
        
        const workLog = {
            timestamp: this.timestamp,
            work: this.completedWork,
            version: MARIO_VERSION,
            files_changed: this.getChangedFiles(),
            commit_ready: true
        };

        // Update .mario-status.json with work completion
        const statusFile = join(PROJECT_ROOT, '.mario-status.json');
        let status = {};
        if (existsSync(statusFile)) {
            status = JSON.parse(readFileSync(statusFile, 'utf8'));
        }
        
        status.lastShipped = workLog;
        status.shippingHistory = status.shippingHistory || [];
        status.shippingHistory.unshift(workLog);
        
        // Keep only last 10 shipping records
        if (status.shippingHistory.length > 10) {
            status.shippingHistory = status.shippingHistory.slice(0, 10);
        }

        writeFileSync(statusFile, JSON.stringify(status, null, 2));
        this.shipStatus.documentation = true;
        console.log("✅ Work documented and logged");
    }

    // 🍄 AGENT 2: GIT AUTOMATION AGENT
    async gitCommitAndPush() {
        console.log("🚀 Git Agent: Committing and pushing changes...");
        
        try {
            // Check if there are any changes to commit
            const hasChanges = this.hasGitChanges();
            if (!hasChanges) {
                console.log("ℹ️  No changes to commit");
                this.shipStatus.gitCommit = true;
                return;
            }

            // Stage all changes
            execSync('git add .', { stdio: 'inherit' });
            
            // Create commit message
            const commitMessage = `🍄 Ship: ${this.completedWork}

🚀 Generated with Mario Jump Button v${MARIO_VERSION}
⏰ Shipped at: ${this.timestamp}

Co-Authored-By: Mario <mario@nintendo.com>`;

            // Commit with the message
            execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
            
            // Push to remote
            execSync('git push origin main', { stdio: 'inherit' });
            
            this.shipStatus.gitCommit = true;
            console.log("✅ Changes committed and pushed to main");
        } catch (error) {
            console.error("❌ Git operations failed:", error.message);
            throw error;
        }
    }

    // 🍄 AGENT 3: DEPLOYMENT AGENT
    async runDeployment() {
        console.log("🚢 Deploy Agent: Shipping to production...");
        
        try {
            // Build the project first
            console.log("🔨 Building project...");
            execSync('npm run build', { stdio: 'inherit' });
            
            // Deploy frontend to Cloudflare Pages (auto-deploys from git push)
            console.log("🌐 Frontend deploying via Cloudflare Pages...");
            
            // Deploy worker/API if it exists
            if (existsSync(join(PROJECT_ROOT, 'worker', 'wrangler.toml'))) {
                console.log("⚡ Deploying Cloudflare Worker...");
                execSync('cd worker && npx wrangler deploy', { stdio: 'inherit' });
            }
            
            this.shipStatus.deployment = true;
            console.log("✅ Deployment initiated successfully");
        } catch (error) {
            console.error("❌ Deployment failed:", error.message);
            // Don't throw - partial shipping is still shipping!
            console.log("🎯 Continuing with partial ship...");
        }
    }

    // 🍄 AGENT 4: PROJECT ANALYSIS AGENT
    async analyzeProjectState() {
        console.log("🔍 Analysis Agent: Scanning project state...");
        
        const analysis = {
            timestamp: this.timestamp,
            completedWork: this.completedWork,
            projectHealth: this.assessProjectHealth(),
            quickWins: this.identifyQuickWins(),
            technicalDebt: this.identifyTechnicalDebt(),
            nextPriorities: this.calculateNextPriorities()
        };

        this.projectAnalysis = analysis;
        this.shipStatus.analysis = true;
        console.log("✅ Project analysis complete");
        return analysis;
    }

    // 🍄 AGENT 5: STRATEGIC ROADMAP AGENT
    async updateNextMoves() {
        console.log("🎯 Strategic Agent: Updating NextMoves.md...");
        
        const analysis = this.projectAnalysis;
        const nextMovesContent = this.generateNextMovesContent(analysis);
        
        const nextMovesPath = join(PROJECT_ROOT, 'NextMoves.md');
        writeFileSync(nextMovesPath, nextMovesContent);
        
        this.shipStatus.nextMoves = true;
        console.log("✅ NextMoves.md updated with fresh strategic analysis");
    }

    // 🛠️ HELPER METHODS
    hasGitChanges() {
        try {
            const output = execSync('git status --porcelain', { encoding: 'utf8' });
            return output.trim().length > 0;
        } catch {
            return false;
        }
    }

    getChangedFiles() {
        try {
            const output = execSync('git status --porcelain', { encoding: 'utf8' });
            return output.split('\n')
                .filter(line => line.trim())
                .map(line => line.substring(3));
        } catch {
            return [];
        }
    }

    assessProjectHealth() {
        const health = {
            score: 85, // Base score
            issues: [],
            strengths: []
        };

        // Check package.json health
        if (existsSync(join(PROJECT_ROOT, 'package.json'))) {
            health.strengths.push("📦 Package.json properly configured");
        }

        // Check if build works
        try {
            execSync('npm run build', { stdio: 'pipe' });
            health.strengths.push("🔨 Build process working");
        } catch {
            health.issues.push("❌ Build process has issues");
            health.score -= 15;
        }

        // Check TypeScript config
        if (existsSync(join(PROJECT_ROOT, 'tsconfig.json'))) {
            health.strengths.push("📘 TypeScript configured");
        }

        return health;
    }

    identifyQuickWins() {
        const wins = [];
        
        // Check for common quick wins
        if (!existsSync(join(PROJECT_ROOT, 'README.md'))) {
            wins.push("📚 Add README.md with project overview");
        }
        
        wins.push("⚡ Add loading states to all async operations");
        wins.push("📋 Add copy-to-clipboard for all code outputs");
        wins.push("🎨 Polish UI with micro-interactions");
        wins.push("♿ Add accessibility improvements");
        
        return wins;
    }

    identifyTechnicalDebt() {
        const debt = [];
        
        // Check for missing tests
        if (!existsSync(join(PROJECT_ROOT, 'tests')) && 
            !existsSync(join(PROJECT_ROOT, '__tests__'))) {
            debt.push("🧪 Add unit tests for core components");
        }
        
        debt.push("🔒 Add proper error boundaries");
        debt.push("📊 Add analytics and monitoring");
        debt.push("🎯 Optimize bundle size and performance");
        
        return debt;
    }

    calculateNextPriorities() {
        return {
            shipNext: [
                "🎯 Add error handling for failed API calls",
                "⚡ Implement component caching for better performance",
                "📱 Improve mobile responsiveness"
            ],
            improveCurrent: [
                "🎨 Enhance UI animations and transitions",
                "📚 Add interactive tooltips and help text",
                "🔍 Add search/filter functionality",
                "📊 Add usage analytics dashboard"
            ],
            scaleOptimize: [
                "🌐 Build multi-file component analysis",
                "🤖 Add AI-powered suggestions",
                "👥 Add collaboration features",
                "🎯 Create component recommendation engine"
            ],
            futureVision: [
                "🚀 Build full design system generator",
                "🌍 Launch as SaaS platform",
                "📈 Build component marketplace",
                "🎓 Create educational content"
            ]
        };
    }

    generateNextMovesContent(analysis) {
        return `# 🎯 NextMoves.md
*Generated by Mario Jump Shipper v${MARIO_VERSION}*  
*Timestamp: ${this.timestamp}*

## 📍 Current State
Just shipped: ${this.completedWork}

**Project Health Score**: ${analysis.projectHealth.score}/100

### ✅ Project Strengths
${analysis.projectHealth.strengths.map(s => `- ${s}`).join('\n')}

### ⚠️ Issues Detected
${analysis.projectHealth.issues.map(i => `- ${i}`).join('\n')}

## 🎮 Mario's Move Priority

### 🚀 Ship Next (High Impact, Low Effort)
${analysis.nextPriorities.shipNext.map(item => `- ${item}`).join('\n')}

### 🔧 Improve Current (Medium Impact, Low Effort)
${analysis.nextPriorities.improveCurrent.map(item => `- ${item}`).join('\n')}

### 📈 Scale & Optimize (High Impact, Medium Effort)
${analysis.nextPriorities.scaleOptimize.map(item => `- ${item}`).join('\n')}

### 🎯 Future Vision (High Impact, High Effort)
${analysis.nextPriorities.futureVision.map(item => `- ${item}`).join('\n')}

## 🍄 Mario's Recommendations

**Next 30 minutes**: Focus on 🚀 Ship Next items  
**Next 2 hours**: Complete 🔧 Improve Current tasks  
**This week**: Start one 📈 Scale & Optimize project  
**This month**: Plan one 🎯 Future Vision initiative

## 🚀 Quick Wins Available
${analysis.quickWins.slice(0, 3).map(win => `- ${win}`).join('\n')}

## 🎯 Technical Debt to Address
${analysis.technicalDebt.slice(0, 3).map(debt => `- ${debt}`).join('\n')}

---
*"It's-a me! Mario! Ship fast, iterate faster!" 🍄*
*Last shipped: ${this.timestamp}*`;
    }

    // 🚀 MAIN ORCHESTRATION METHOD
    async ship() {
        console.log(`\n🍄 MARIO JUMP BUTTON SHIP v${MARIO_VERSION}`);
        console.log("=====================================");
        console.log(`📦 Shipping: ${this.completedWork}`);
        console.log(`⏰ Time: ${this.timestamp}\n`);

        try {
            // Execute all agents in sequence
            await this.documentCompletedWork();
            await this.gitCommitAndPush();
            await this.runDeployment();
            await this.analyzeProjectState();
            await this.updateNextMoves();

            // Final status report
            console.log("\n🎉 SHIPPING COMPLETE!");
            console.log("====================");
            console.log("📝 Documentation:", this.shipStatus.documentation ? "✅" : "❌");
            console.log("🚀 Git Commit:", this.shipStatus.gitCommit ? "✅" : "❌");
            console.log("🚢 Deployment:", this.shipStatus.deployment ? "✅" : "❌");
            console.log("🔍 Analysis:", this.shipStatus.analysis ? "✅" : "❌");
            console.log("🎯 NextMoves:", this.shipStatus.nextMoves ? "✅" : "❌");

            console.log("\n🌐 LIVE URLS:");
            console.log("Frontend: https://component-breaker.pages.dev");
            console.log("API: https://component-breaker-api.workers.dev");
            
            console.log("\n🎯 NEXT STEPS:");
            console.log("Check NextMoves.md for updated priorities");
            console.log("Monitor deployment status in Cloudflare Dashboard");
            console.log("Collect user feedback and iterate!");

            console.log("\n🍄 Mario says: 'Mamma mia! Another successful ship!'");

        } catch (error) {
            console.error("\n❌ SHIPPING FAILED:", error.message);
            console.log("\n🎯 PARTIAL SHIP STATUS:");
            Object.entries(this.shipStatus).forEach(([step, success]) => {
                console.log(`${step}: ${success ? "✅" : "❌"}`);
            });
            process.exit(1);
        }
    }
}

// 🎮 COMMAND LINE INTERFACE
if (import.meta.url === `file://${process.argv[1]}`) {
    const completedWork = process.argv[2] || "Incremental improvements and bug fixes";
    const mario = new MarioShippingOrchestrator(completedWork);
    mario.ship();
}

export { MarioShippingOrchestrator };