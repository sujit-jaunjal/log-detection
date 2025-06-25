class LogProcessor {
    constructor() {
        // Regex for Apache Combined Log Format
        this.apacheLogRegex = /^(\S+) (\S+) (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(\S+)\s?(\S+)?\s?(\S+)?" (\d{3}) (\d+|-)\s?"?([^"]*)"?\s?"?([^"]*)?"?$/;
    }

    parse(logLine) {
        const match = this.apacheLogRegex.exec(logLine);

        if (!match) {
            // Could be a different log format or a malformed line
            return { raw: logLine, error: 'unparsed' };
        }

        return {
            raw: logLine,
            ip: match[1],
            identity: match[2],
            user: match[3],
            timestamp: match[4],
            method: match[5],
            path: match[6],
            protocol: match[7],
            status: parseInt(match[8], 10),
            bytes: match[9] === '-' ? 0 : parseInt(match[9], 10),
            referer: match[10],
            userAgent: match[11]
        };
    }

    process(logs) {
        return logs.map(log => this.parse(log));
    }
}

module.exports = new LogProcessor(); 