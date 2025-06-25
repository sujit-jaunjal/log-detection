const BaseGenerator = require('./BaseGenerator');
const faker = require('faker');
const moment = require('moment');

class ApacheGenerator extends BaseGenerator {
    constructor(config) {
        super(config);
        this.httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        this.responseStatuses = {
            success: [200, 201, 204],
            clientError: [400, 401, 403, 404],
            serverError: [500, 502, 503]
        };
        this.commonPaths = [
            '/', '/login', '/register', '/api/users', '/api/products',
            '/admin', '/checkout', '/cart', '/search', '/profile'
        ];
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
        ];
    }

    generateSuspiciousLog() {
        // Generate suspicious patterns like SQL injection attempts, path traversal, etc.
        const suspiciousPatterns = [
            () => ({
                path: '/admin/../../etc/passwd',
                method: 'GET',
                status: 403,
                bytes: 0
            }),
            () => ({
                path: '/login',
                method: 'POST',
                status: 401,
                bytes: 0,
                query: "username=admin'--"
            }),
            () => ({
                path: '/api/users',
                method: 'GET',
                status: 403,
                bytes: 0,
                query: "id=1 OR 1=1"
            })
        ];

        return suspiciousPatterns[Math.floor(Math.random() * suspiciousPatterns.length)]();
    }

    generateNormalLog() {
        return {
            path: faker.random.arrayElement(this.commonPaths),
            method: faker.random.arrayElement(this.httpMethods),
            status: faker.random.arrayElement(this.responseStatuses.success),
            bytes: faker.datatype.number({ min: 1024, max: 10240 })
        };
    }

    formatLog(logData) {
        const timestamp = moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
        const ip = faker.internet.ip();
        const userAgent = faker.random.arrayElement(this.userAgents);
        
        // Combined Log Format
        return `${ip} - - [${timestamp}] "${logData.method} ${logData.path}${logData.query ? '?' + logData.query : ''} HTTP/1.1" ${logData.status} ${logData.bytes} "${faker.internet.url()}" "${userAgent}"`;
    }

    generateLog() {
        // Determine if this should be a suspicious log based on configuration
        const isSuspicious = Math.random() * 100 < this.config.patterns.suspicious;
        const logData = isSuspicious ? this.generateSuspiciousLog() : this.generateNormalLog();
        return this.formatLog(logData);
    }
}

module.exports = ApacheGenerator; 