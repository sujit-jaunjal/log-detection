const ApacheGenerator = require('./ApacheGenerator');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class GeneratorFactory {
    static async createGenerator(type) {
        try {
            // Load configuration
            const configPath = path.join(__dirname, '../../config/settings.yaml');
            const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
            
            switch (type.toLowerCase()) {
                case 'apache':
                    return new ApacheGenerator(config.log_generation.apache);
                // Add other generators here as they're implemented
                default:
                    throw new Error(`Unknown generator type: ${type}`);
            }
        } catch (error) {
            console.error('Error creating generator:', error);
            throw error;
        }
    }
}

module.exports = {
    GeneratorFactory,
    ApacheGenerator
}; 