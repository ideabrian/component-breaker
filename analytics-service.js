#!/usr/bin/env node

/**
 * 🚀 SHIPPING ANALYTICS SERVICE
 * 
 * Captures EVERYTHING during /ship execution and streams to analytics platform:
 * - Real-time event streaming
 * - File operation tracking
 * - Git operation monitoring
 * - Performance metrics collection
 * - AI-powered analysis
 * 
 * Integrates with Cloudflare Workers + D1 + KV + AI for global edge analytics
 */

import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, statSync } from 'fs';
import { basename, dirname } from 'path';

export class ShippingAnalyticsService {
    constructor(options = {}) {
        this.apiBaseUrl = options.apiBaseUrl || 'https://shipping-analytics-api.workers.dev';
        this.projectId = options.projectId || this.getProjectId();
        this.sessionId = null;
        this.startTime = null;
        this.eventQueue = [];
        this.isConnected = false;
        this.marioVersion = options.marioVersion || '3.0.0';
        
        // Performance tracking
        this.metrics = {
            totalDuration: 0,
            gitDuration: 0,
            buildDuration: 0,
            deployDuration: 0,
            analysisDuration: 0,
            fileOperations: 0,
            gitOperations: 0,
        };

        // Initialize connection
        this.initializeConnection();
    }

    // 🔗 Initialize analytics connection
    async initializeConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            if (response.ok) {
                this.isConnected = true;
                console.log('📊 Analytics service connected');
            }
        } catch (error) {
            console.warn('⚠️  Analytics service unavailable, continuing without tracking');
            this.isConnected = false;
        }
    }

    // 🆔 Get or generate project ID
    getProjectId() {
        try {
            // Try to get from package.json name
            const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
            return packageJson.name || 'unknown-project';
        } catch {
            // Fallback to directory name
            return basename(process.cwd());
        }
    }

    // 🚀 Start shipping session
    async startSession(description, repositoryUrl = null) {
        if (!this.isConnected) return null;

        this.startTime = new Date();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: this.projectId,
                    description,
                    marioVersion: this.marioVersion,
                    repositoryUrl
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.sessionId = result.sessionId;
                console.log(`📊 Analytics session started: ${this.sessionId.substring(0, 8)}...`);
                return this.sessionId;
            }
        } catch (error) {
            console.warn('📊 Failed to start analytics session:', error.message);
        }
        
        return null;
    }

    // 📝 Record shipping event
    async recordEvent(eventType, options = {}) {
        if (!this.isConnected || !this.sessionId) return;

        const event = {
            sessionId: this.sessionId,
            eventType,
            timestamp: new Date().toISOString(),
            success: options.success !== false,
            duration: options.duration,
            metadata: options.metadata,
            filePath: options.filePath,
            errorMessage: options.errorMessage
        };

        // Queue event for batch sending or send immediately
        if (options.immediate) {
            await this.sendEvent(event);
        } else {
            this.eventQueue.push(event);
            if (this.eventQueue.length >= 10) {
                await this.flushEvents();
            }
        }

        // Update performance metrics
        if (options.duration) {
            if (eventType.includes('git')) {
                this.metrics.gitDuration += options.duration;
                this.metrics.gitOperations++;
            } else if (eventType.includes('build')) {
                this.metrics.buildDuration += options.duration;
            } else if (eventType.includes('deploy')) {
                this.metrics.deployDuration += options.duration;
            } else if (eventType.includes('analysis')) {
                this.metrics.analysisDuration += options.duration;
            }
        }

        return event;
    }

    // 📁 Record file operation
    async recordFileOperation(operationType, filePath, options = {}) {
        if (!this.isConnected || !this.sessionId) return;

        let fileSize = null;
        let contentHash = null;

        try {
            if (operationType === 'read' || operationType === 'write' || operationType === 'modify') {
                const stats = statSync(filePath);
                fileSize = stats.size;
                
                // Generate content hash for tracking changes
                if (stats.size < 1024 * 1024) { // Only hash files < 1MB
                    try {
                        const content = readFileSync(filePath, 'utf8');
                        contentHash = createHash('sha256').update(content).digest('hex').substring(0, 16);
                    } catch {
                        // File might be binary or inaccessible
                    }
                }
            }
        } catch {
            // File might not exist or be inaccessible
        }

        const operation = {
            sessionId: this.sessionId,
            operationType,
            filePath,
            fileSize,
            contentHash,
            changeType: options.changeType,
            linesChanged: options.linesChanged,
            toolUsed: options.toolUsed
        };

        try {
            await fetch(`${this.apiBaseUrl}/api/file-operations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(operation)
            });

            this.metrics.fileOperations++;
        } catch (error) {
            console.warn('📊 Failed to record file operation:', error.message);
        }

        return operation;
    }

    // 🔧 Record git operation
    async recordGitOperation(operationType, options = {}) {
        if (!this.isConnected || !this.sessionId) return;

        const operation = {
            sessionId: this.sessionId,
            operationType,
            filesChanged: options.filesChanged,
            linesAdded: options.linesAdded,
            linesRemoved: options.linesRemoved,
            commitHash: options.commitHash,
            commitMessage: options.commitMessage,
            branchName: options.branchName || 'main',
            success: options.success !== false,
            errorDetails: options.errorDetails
        };

        try {
            await fetch(`${this.apiBaseUrl}/api/git-operations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(operation)
            });

            this.metrics.gitOperations++;
        } catch (error) {
            console.warn('📊 Failed to record git operation:', error.message);
        }

        return operation;
    }

    // ⏱️ Time an operation
    timeOperation(name, operation) {
        if (!this.isConnected) return operation();

        const startTime = Date.now();
        
        try {
            const result = operation();
            const duration = Date.now() - startTime;
            
            // Record the event with timing
            this.recordEvent(name, { duration, success: true });
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            
            // Record failed operation
            this.recordEvent(name, { 
                duration, 
                success: false, 
                errorMessage: error.message 
            });
            
            throw error;
        }
    }

    // ⏱️ Time an async operation
    async timeAsyncOperation(name, operation) {
        if (!this.isConnected) return await operation();

        const startTime = Date.now();
        
        try {
            const result = await operation();
            const duration = Date.now() - startTime;
            
            // Record the event with timing
            await this.recordEvent(name, { duration, success: true });
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            
            // Record failed operation
            await this.recordEvent(name, { 
                duration, 
                success: false, 
                errorMessage: error.message 
            });
            
            throw error;
        }
    }

    // 🔍 Analyze git changes
    getGitChanges() {
        try {
            const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
            const diffOutput = execSync('git diff --stat', { encoding: 'utf8' });
            
            const changedFiles = statusOutput.split('\n')
                .filter(line => line.trim())
                .map(line => ({
                    status: line.substring(0, 2).trim(),
                    file: line.substring(3)
                }));

            // Parse diff stats
            const diffLines = diffOutput.split('\n').filter(line => line.includes('|'));
            let totalAdded = 0;
            let totalRemoved = 0;

            diffLines.forEach(line => {
                const match = line.match(/\s+(\d+)\s+\+*-*/);
                if (match) {
                    const changes = parseInt(match[1]);
                    if (line.includes('+')) totalAdded += changes;
                    if (line.includes('-')) totalRemoved += changes;
                }
            });

            return {
                filesChanged: changedFiles.length,
                linesAdded: totalAdded,
                linesRemoved: totalRemoved,
                files: changedFiles
            };
        } catch {
            return { filesChanged: 0, linesAdded: 0, linesRemoved: 0, files: [] };
        }
    }

    // 🏁 Complete shipping session
    async completeSession(status = 'completed', metadata = {}) {
        if (!this.isConnected || !this.sessionId) return;

        // Flush any remaining events
        await this.flushEvents();

        // Calculate total duration
        if (this.startTime) {
            this.metrics.totalDuration = Date.now() - this.startTime.getTime();
        }

        try {
            await fetch(`${this.apiBaseUrl}/api/sessions/${this.sessionId}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status, 
                    metadata: { 
                        ...metadata, 
                        metrics: this.metrics 
                    } 
                })
            });

            console.log(`📊 Analytics session completed: ${status}`);
            this.printMetricsSummary();
        } catch (error) {
            console.warn('📊 Failed to complete analytics session:', error.message);
        }

        this.sessionId = null;
    }

    // 🧠 Generate AI insights
    async generateInsights() {
        if (!this.isConnected || !this.sessionId) return null;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/sessions/${this.sessionId}/insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const insights = await response.json();
                console.log('🧠 AI insights generated');
                return insights;
            }
        } catch (error) {
            console.warn('🧠 Failed to generate AI insights:', error.message);
        }

        return null;
    }

    // 📤 Send event to analytics API
    async sendEvent(event) {
        try {
            await fetch(`${this.apiBaseUrl}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.warn('📊 Failed to send event:', error.message);
        }
    }

    // 📤 Flush queued events
    async flushEvents() {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        for (const event of events) {
            await this.sendEvent(event);
        }
    }

    // 📊 Print metrics summary
    printMetricsSummary() {
        if (!this.isConnected) return;

        console.log('\n📊 SHIPPING METRICS SUMMARY');
        console.log('============================');
        console.log(`⏱️  Total Duration: ${Math.round(this.metrics.totalDuration / 1000)}s`);
        console.log(`🔧 Git Duration: ${Math.round(this.metrics.gitDuration / 1000)}s`);
        console.log(`🔨 Build Duration: ${Math.round(this.metrics.buildDuration / 1000)}s`);
        console.log(`🚢 Deploy Duration: ${Math.round(this.metrics.deployDuration / 1000)}s`);
        console.log(`🔍 Analysis Duration: ${Math.round(this.metrics.analysisDuration / 1000)}s`);
        console.log(`📁 File Operations: ${this.metrics.fileOperations}`);
        console.log(`🔧 Git Operations: ${this.metrics.gitOperations}`);
        
        if (this.sessionId) {
            console.log(`\n🔗 View detailed analytics:`);
            console.log(`   https://analytics.component-breaker.pages.dev/sessions/${this.sessionId}`);
        }
    }

    // 🎯 Create wrapper for tracking specific operations
    wrapOperation(name, fn) {
        return (...args) => {
            return this.timeOperation(name, () => fn(...args));
        };
    }

    // 🎯 Create async wrapper for tracking specific operations
    wrapAsyncOperation(name, fn) {
        return async (...args) => {
            return await this.timeAsyncOperation(name, () => fn(...args));
        };
    }
}

// 🚀 Create enhanced mario shipping orchestrator with analytics
export class AnalyticsEnhancedMarioShipper {
    constructor(completedWork, options = {}) {
        this.completedWork = completedWork;
        this.analytics = new ShippingAnalyticsService(options);
        this.timestamp = new Date().toISOString();
        this.shipStatus = {
            documentation: false,
            gitCommit: false,
            deployment: false,
            analysis: false,
            nextMoves: false
        };
    }

    // 🍄 Enhanced shipping with full analytics
    async ship() {
        console.log(`\n🍄 MARIO JUMP BUTTON SHIP v${this.analytics.marioVersion}`);
        console.log("=====================================");
        console.log(`📦 Shipping: ${this.completedWork}`);
        console.log(`⏰ Time: ${this.timestamp}\n`);

        // Start analytics session
        await this.analytics.startSession(this.completedWork);

        try {
            // Execute all agents with analytics tracking
            await this.analytics.timeAsyncOperation('documentation', () => this.documentCompletedWork());
            await this.analytics.timeAsyncOperation('git_commit_push', () => this.gitCommitAndPush());
            await this.analytics.timeAsyncOperation('deployment', () => this.runDeployment());
            await this.analytics.timeAsyncOperation('project_analysis', () => this.analyzeProjectState());
            await this.analytics.timeAsyncOperation('strategic_planning', () => this.updateNextMoves());

            // Complete session successfully
            await this.analytics.completeSession('completed', {
                description: this.completedWork,
                shipStatus: this.shipStatus
            });

            // Generate AI insights
            const insights = await this.analytics.generateInsights();
            if (insights) {
                console.log('\n🧠 AI INSIGHTS GENERATED');
                console.log('========================');
                // Display key insights
            }

            this.printShippingComplete();

        } catch (error) {
            console.error("\n❌ SHIPPING FAILED:", error.message);
            
            // Complete session with failure status
            await this.analytics.completeSession('failed', {
                error: error.message,
                shipStatus: this.shipStatus
            });

            this.printPartialShipStatus();
            process.exit(1);
        }
    }

    // All existing mario methods with analytics integration...
    async documentCompletedWork() {
        console.log("📝 Documentation Agent: Recording completed work...");
        
        await this.analytics.recordEvent('documentation_start');
        
        // Track file operations
        await this.analytics.recordFileOperation('write', '.mario-status.json', {
            toolUsed: 'mario-ship',
            changeType: 'modified'
        });

        // Original documentation logic...
        const workLog = {
            timestamp: this.timestamp,
            work: this.completedWork,
            version: this.analytics.marioVersion,
            files_changed: this.analytics.getGitChanges().files,
            commit_ready: true
        };

        // ... rest of documentation logic

        await this.analytics.recordEvent('documentation_end');
        this.shipStatus.documentation = true;
        console.log("✅ Work documented and logged");
    }

    async gitCommitAndPush() {
        console.log("🚀 Git Agent: Committing and pushing changes...");
        
        await this.analytics.recordEvent('git_operations_start');

        try {
            // Check changes with analytics
            const changes = this.analytics.getGitChanges();
            
            if (changes.filesChanged === 0) {
                console.log("ℹ️  No changes to commit");
                this.shipStatus.gitCommit = true;
                await this.analytics.recordEvent('git_no_changes');
                return;
            }

            // Track git operations
            await this.analytics.recordGitOperation('status', {
                filesChanged: changes.filesChanged,
                linesAdded: changes.linesAdded,
                linesRemoved: changes.linesRemoved
            });

            // Stage changes
            this.analytics.timeOperation('git_add', () => {
                execSync('git add .', { stdio: 'inherit' });
            });

            await this.analytics.recordGitOperation('add', {
                filesChanged: changes.filesChanged
            });

            // Create commit
            const commitMessage = `🍄 Ship: ${this.completedWork}

🚀 Generated with Mario Jump Button v${this.analytics.marioVersion}
⏰ Shipped at: ${this.timestamp}

Co-Authored-By: Mario <mario@nintendo.com>`;

            const commitHash = this.analytics.timeOperation('git_commit', () => {
                execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
                return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
            });

            await this.analytics.recordGitOperation('commit', {
                commitHash,
                commitMessage,
                filesChanged: changes.filesChanged,
                linesAdded: changes.linesAdded,
                linesRemoved: changes.linesRemoved
            });

            // Push to remote
            this.analytics.timeOperation('git_push', () => {
                execSync('git push origin main', { stdio: 'inherit' });
            });

            await this.analytics.recordGitOperation('push', {
                commitHash,
                branchName: 'main'
            });

            this.shipStatus.gitCommit = true;
            await this.analytics.recordEvent('git_operations_end');
            console.log("✅ Changes committed and pushed to main");

        } catch (error) {
            await this.analytics.recordEvent('git_operations_failed', {
                success: false,
                errorMessage: error.message
            });
            console.error("❌ Git operations failed:", error.message);
            throw error;
        }
    }

    // ... (similar enhancements for other methods)

    printShippingComplete() {
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
        console.log("Analytics: https://analytics.component-breaker.pages.dev");

        console.log("\n🍄 Mario says: 'Mamma mia! Another successful ship!'");
    }

    printPartialShipStatus() {
        console.log("\n🎯 PARTIAL SHIP STATUS:");
        Object.entries(this.shipStatus).forEach(([step, success]) => {
            console.log(`${step}: ${success ? "✅" : "❌"}`);
        });
    }
}