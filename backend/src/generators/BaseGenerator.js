const { Worker } = require('worker_threads');
const { Transform, Writable } = require('stream');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

class BaseGenerator {
    constructor(config) {
        this.config = config;
        this.workers = [];
        this.outputStream = null;
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'generator-error.log', level: 'error' }),
                new winston.transports.Console()
            ]
        });
        this.writeQueue = [];
        this.isProcessingQueue = false;
    }

    async initialize() {
        // Ensure logs directory exists
        const logDir = path.dirname(this.config.output_file);
        await fs.promises.mkdir(logDir, { recursive: true });

        // Create a write stream with high watermark for performance
        this.outputStream = fs.createWriteStream(this.config.output_file, {
            flags: 'a', // append mode
            highWaterMark: 64 * 1024 // 64KB buffer
        });

        // Setup worker threads
        await this.setupWorkers();
    }

    async setupWorkers() {
        const workerPath = path.join(__dirname, 'LogWorker.js');
        
        for (let i = 0; i < this.config.worker_threads; i++) {
            const worker = new Worker(workerPath, {
                workerData: {
                    workerId: i,
                    config: this.config
                }
            });

            worker.on('message', async (logs) => {
                try {
                    await this.queueLogs(logs);
                } catch (error) {
                    this.logger.error(`Error processing logs from worker ${i}:`, error);
                }
            });

            worker.on('error', (error) => {
                this.logger.error(`Worker ${i} error:`, error);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    this.logger.error(`Worker ${i} stopped with exit code ${code}`);
                }
            });

            this.workers.push(worker);
        }
    }

    async queueLogs(logs) {
        // Add logs to the queue
        this.writeQueue.push(...logs.map(log => log + '\n'));
        
        // Start processing queue if not already processing
        if (!this.isProcessingQueue) {
            this.isProcessingQueue = true;
            await this.processQueue();
        }
    }

    async processQueue() {
        while (this.writeQueue.length > 0) {
            const log = this.writeQueue[0];
            
            if (this.outputStream.write(log)) {
                // If write was successful, remove the log from queue
                this.writeQueue.shift();
            } else {
                // Wait for drain event before continuing
                await new Promise(resolve => this.outputStream.once('drain', resolve));
            }
        }
        
        this.isProcessingQueue = false;
    }

    async start() {
        await this.initialize();
        
        // Start log generation in each worker
        this.workers.forEach(worker => {
            worker.postMessage('start');
        });

        this.logger.info(`Started log generation with ${this.config.worker_threads} workers`);
    }

    async stop() {
        // Stop all workers
        await Promise.all(this.workers.map(worker => worker.terminate()));
        
        // Process any remaining logs in the queue
        if (this.writeQueue.length > 0) {
            await this.processQueue();
        }

        // Close the output stream
        if (this.outputStream) {
            await new Promise(resolve => this.outputStream.end(resolve));
        }

        this.logger.info('Stopped log generation');
    }

    // Method to be implemented by specific generators
    generateLog() {
        throw new Error('generateLog method must be implemented by specific generators');
    }
}

module.exports = BaseGenerator; 