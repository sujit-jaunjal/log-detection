const { parentPort, workerData } = require('worker_threads');
const { setTimeout } = require('timers/promises');
const ApacheGenerator = require('./ApacheGenerator');

class LogWorker {
    constructor(config, workerId) {
        this.config = config;
        this.workerId = workerId;
        this.isRunning = false;
        this.isPaused = false;
        this.batchSize = config.batch_size;
        this.ratePerSecond = Math.floor(config.rate / config.worker_threads);
        this.intervalMs = 1000 / this.ratePerSecond;
        
        // Create an instance of the generator for log generation
        this.generator = new ApacheGenerator(config);
    }

    async generateBatch() {
        const logs = [];
        for (let i = 0; i < this.batchSize; i++) {
            logs.push(this.generator.generateLog());
        }
        return logs;
    }

    async start() {
        this.isRunning = true;
        
        while (this.isRunning) {
            const startTime = Date.now();
            
            try {
                if (!this.isPaused) {
                    // Generate and send a batch of logs
                    const logs = await this.generateBatch();
                    parentPort.postMessage(logs);

                    // Calculate sleep time to maintain desired rate
                    const endTime = Date.now();
                    const processingTime = endTime - startTime;
                    const sleepTime = Math.max(0, this.intervalMs - processingTime);
                    
                    await setTimeout(sleepTime);
                } else {
                    // If paused, wait for resume signal
                    await setTimeout(100);
                }
            } catch (error) {
                console.error(`Worker ${this.workerId} error:`, error);
                await setTimeout(1000); // Wait a bit before retrying
            }
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isRunning = false;
    }
}

// Create a single worker instance
const worker = new LogWorker(workerData.config, workerData.workerId);

// Handle messages from the parent thread
parentPort.on('message', async (message) => {
    try {
        switch (message) {
            case 'start':
                await worker.start();
                break;
            case 'pause':
                worker.pause();
                break;
            case 'resume':
                worker.resume();
                break;
            case 'stop':
                worker.stop();
                break;
        }
    } catch (error) {
        console.error(`Worker ${worker.workerId} message handling error:`, error);
        process.exit(1);
    }
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error(`Worker ${worker.workerId} uncaught exception:`, error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`Worker ${worker.workerId} unhandled rejection at:`, promise, 'reason:', reason);
    process.exit(1);
}); 