const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const readline = require('readline');

const BATCH_SIZE = 1000; // Process 1000 lines at a time

class LogIngestor extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.watchers = new Map();
        this.fileSizes = new Map();
    }

    start() {
        const projectRoot = path.join(__dirname, '..', '..');
        const watchPatterns = this.config.watch_patterns.map(p => path.join(projectRoot, p));

        const watcher = chokidar.watch(watchPatterns, {
            persistent: true,
            ignoreInitial: false, // process files that already exist
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
            }
        });

        watcher
            .on('add', filePath => this.handleNewFile(filePath))
            .on('change', filePath => this.handleFileChange(filePath))
            .on('error', error => this.emit('error', `Watcher error: ${error}`));

        console.log(`Log Ingestor: Watching for logs in ${watchPatterns.join(', ')}`);
    }

    async handleNewFile(filePath) {
        console.log(`Log Ingestor: New file detected ${filePath}`);
        // Process the whole file as new logs
        await this.handleFileChange(filePath, true);
    }

    async handleFileChange(filePath, fromStart = false) {
        const currentSize = fs.statSync(filePath).size;
        const lastSize = fromStart ? 0 : (this.fileSizes.get(filePath) || 0);

        if (currentSize > lastSize) {
            const readStream = fs.createReadStream(filePath, { start: lastSize, encoding: 'utf-8' });

            const rl = readline.createInterface({
                input: readStream,
                crlfDelay: Infinity
            });

            let newLinesBatch = [];
            rl.on('line', (line) => {
                if (line) {
                    newLinesBatch.push(line);
                }
                if (newLinesBatch.length >= BATCH_SIZE) {
                    this.emit('new-logs', { filePath, logs: newLinesBatch });
                    newLinesBatch = [];
                }
            });

            rl.on('close', () => {
                if (newLinesBatch.length > 0) {
                    this.emit('new-logs', { filePath, logs: newLinesBatch });
                }
                this.fileSizes.set(filePath, currentSize);
            });

            readStream.on('error', (err) => {
                this.emit('error', `Read stream error: ${err}`);
            });
        }
    }
}

module.exports = LogIngestor; 