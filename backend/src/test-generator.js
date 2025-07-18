const { GeneratorFactory } = require('./generators');

async function main() {
    try {
        console.log('Starting Apache log generator...');
        const generator = await GeneratorFactory.createGenerator('apache');
        
        // Start generating log
        await generator.start();

        // Run for 60 seconds
        await new Promise(resolve => setTimeout(resolve, 60000));

        // Stop the generator
        await generator.stop();
        console.log('Generator stopped');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main(); 