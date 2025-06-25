const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const LogIngestor = require('./ingestion');
const LogProcessor = require('./processor');
const RuleEngine = require('../rules/engine');
// const Alerter = require('./alerter'); // To be added later

class Monitor {
    constructor(io) {
        this.io = io;
        const configPath = path.join(__dirname, '../../config/settings.yaml');
        this.config = yaml.load(fs.readFileSync(configPath, 'utf8'));
        this.logIngestor = new LogIngestor(this.config.monitoring);
        this.logProcessor = LogProcessor;
        this.ruleEngine = new RuleEngine();
        // this.alerter = new Alerter();
    }

    start() {
        console.log("Starting monitoring system...");
        this.logIngestor.start();

        this.logIngestor.on('new-logs', ({ filePath, logs }) => {
            const parsedLogs = this.logProcessor.process(logs);
            
            // Send raw parsed logs to frontend for live view
            this.io.emit('new-logs', parsedLogs);

            // Evaluate logs against rules, emit alerts immediately
            this.ruleEngine.evaluate(parsedLogs, (alert) => {
                console.log('--- NEW ALERT ---');
                console.log(alert);
                this.io.emit('alerts', [alert]);
            });
        });

        this.logIngestor.on('error', (error) => {
            console.error("Error in log ingestor:", error);
        });
    }
}

module.exports = Monitor; 