const protocols = {
    https: require('https'),
    http: require('http')
}

async function getBody(url, options = {}) {
    return new Promise((resolve, reject) => {
        let body = "";
        if (options.protocol) {
            protocols[options.protocol].get(url, callback => {
                callback.on("data", raw => body += String(raw));
                callback.on("end", () => {
                    resolve(body);
                });
            }).on('error', err => {
                if (err) reject(err);
            });
        }
    });
}

async function getCallback(url, options = {}) {
    return new Promise((resolve, reject) => {
        if (options.protocol) {
            protocols[options.protocol].get(url, callback => {
                resolve(callback);
            }).on('error', err => {
                reject(err);
            });
        }
    });
}

module.exports = {
    getBody,
    getCallback
}