const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { LRUCache } = require('lru-cache');

class RuleEngine {
    constructor() {
        this.rules = [];
        // Use an LRU cache to limit the number of group keys in memory
        this.thresholdState = new LRUCache({ max: 100000 }); // 100k unique keys max
        this.loadRules();
    }

    loadRules() {
        const rulesDir = path.join(__dirname, '../../config/rules');
        const files = fs.readdirSync(rulesDir);

        for (const file of files) {
            if (path.extname(file) === '.yaml' || path.extname(file) === '.yml') {
                const filePath = path.join(rulesDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const loadedRules = yaml.load(fileContent);
                if (Array.isArray(loadedRules)) {
                    this.rules.push(...loadedRules.filter(r => r.enabled));
                }
            }
        }
        console.log(`Rule Engine: Loaded ${this.rules.length} active rules.`);
    }

    evaluate(parsedLogs, onAlert) {
        for (const log of parsedLogs) {
            for (const rule of this.rules) {
                const alert = this.evaluateRule(log, rule);
                if (alert) {
                    onAlert(alert);
                }
            }
        }
    }

    evaluateRule(log, rule) {
        switch (rule.type) {
            case 'pattern':
                return this.evaluatePatternRule(log, rule);
            case 'threshold':
                return this.evaluateThresholdRule(log, rule);
            default:
                return null;
        }
    }

    evaluatePatternRule(log, rule) {
        for (const condition of rule.conditions) {
            const logValue = log[condition.field];
            if (!logValue) continue;

            switch (condition.operator) {
                case 'contains_any':
                    for (const v of condition.value) {
                        if (logValue.includes(v)) {
                            return this.createAlert(log, rule, `Pattern match found: '${v}' in field '${condition.field}'`);
                        }
                    }
                    break;
                case 'equals':
                    if (logValue === condition.value) {
                        return this.createAlert(log, rule, `Value match found: '${logValue}' in field '${condition.field}'`);
                    }
                    break;
            }
        }
        return null;
    }

    evaluateThresholdRule(log, rule) {
        // First, check if the log meets the simple conditions
        let matchesConditions = true;
        for (const condition of rule.conditions) {
            if (log[condition.field] !== condition.value) {
                matchesConditions = false;
                break;
            }
        }
        if (!matchesConditions) return null;

        // Now, handle the threshold logic
        const groupByKey = log[rule.aggregation.group_by];
        const stateKey = `${rule.name}_${groupByKey}`;
        
        if (!this.thresholdState.has(stateKey)) {
            this.thresholdState.set(stateKey, []);
        }

        const timestamps = this.thresholdState.get(stateKey);
        const now = moment();
        const timespan = moment.duration(rule.aggregation.timespan).asMilliseconds();

        // Add current timestamp and filter out old ones
        timestamps.push(now);
        const recentTimestamps = timestamps.filter(ts => now.diff(ts) <= timespan);
        this.thresholdState.set(stateKey, recentTimestamps);

        // Prune state if empty
        if (recentTimestamps.length === 0) {
            this.thresholdState.delete(stateKey);
        }

        if (recentTimestamps.length >= rule.aggregation.count) {
            // Threshold met, clear state for this key to avoid repeated alerts
            this.thresholdState.set(stateKey, []); 
            return this.createAlert(log, rule, `Threshold of ${rule.aggregation.count} events in ${rule.aggregation.timespan} met for ${rule.aggregation.group_by}: ${groupByKey}`);
        }

        return null;
    }

    createAlert(log, rule, triggerReason) {
        return {
            ruleName: rule.name,
            priority: rule.priority,
            description: rule.description,
            timestamp: new Date().toISOString(),
            trigger: triggerReason,
            log: log
        };
    }
}

module.exports = RuleEngine; 