const colors = require('colors');
const util = require('util');
colors.setTheme({
    log: 'grey',
    info: 'green',
    warn: 'yellow',
    debug: 'cyan',
    error: 'red',
});

class Logger {
    constructor(override) {
        if (override) {
            for (const prop of ['log', 'info', 'error', 'debug', 'warn']) {
                console[prop] = this[prop].bind(this);
            }
        }
    }

    log(...args) {
        this._log(args, colors.log);
    }

    info(...args) {
        this._log(args, colors.info);
    }

    error(...args) {
        this._log(args, colors.error);
    }


    warn(...args) {
        this._log(args, colors.warn);
    }


    debug(...args) {
        this._log(args, colors.debug);
    }

    _log(args, color = colors.log) {
        const msg = args.map((a) => {
            if (typeof a !== 'string') {
                return util.inspect(a);
            }

            return a;
        }).join(' ');
        const formatted = this._format(msg, color);

        return process.stdout.write(`${formatted}\n`);
    }


    _format(msg, color) {
        const time = this._getTime();

        return `${time} ${color ? color(msg) : msg}`;
    }

    _getTime(color = true) {
        const date = new Date();

        let hour = date.getHours();
        hour = (hour < 10 ? '0' : '') + hour;

        let min = date.getMinutes();
        min = (min < 10 ? '0' : '') + min;

        let sec = date.getSeconds();
        sec = (sec < 10 ? '0' : '') + sec;

        const time = `${hour}:${min}:${sec}`;

        if (color) {
            return `${colors.white('[')}${colors.grey(time)}${colors.white(']')}`;
        }

        return `[${time}]`;
    }
}

module.exports = (new Logger(true));

const structs = {};

module.exports = structs;