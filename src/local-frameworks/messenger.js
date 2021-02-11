const { Constants } = require('discord.js');

const CustomAPIErrors = {
    MISSING_PERMISSIONS: "Missing permissions"
};

function MessageErrorHandler(listener, error) {
        for (let key in Constants.APIErrors) {
            if (error.code === Constants.APIErrors[key]) {
                // return CustomAPIErrors[key];
                return listener.channel.send(CustomAPIErrors[key])
                    .catch(() => { return null; })
                    .then(m => {
                        if (m !== null) {
                            m.delete({ timeout: 5000})
                        }
                    });
            }
        }
}

class messenger {
    constructor(options = {}) {
        this.options = options;
        if (options.listener) {
            this.options.listener = options.listener
        }
        if (options.client) {
            this.options.client = options.client
        }
        this.options.channel = options.channel ? options.channel : "";
    }

    MessageErrorHandlerConstr(error) {
        if (this.options.listener) {
            let listener = this.options.listener;
            for (let key in Constants.APIErrors) {
                if (error.code === Constants.APIErrors[key]) {
                    return listener.channel.send(CustomAPIErrors[key])
                        .catch(() => { return null; })
                        .then(m => {
                            if (m !== null) {
                                m.delete({ timeout: 5000})
                            }
                        });
                }
            }
        }
    }

    sendMessageConstr(input) {
        if (this.options.listener) {
            let listener = this.options.listener;
            return listener.channel.send(input).catch(error => {
                this.MessageErrorHandlerConstr(error);
            });
        }
    }

    sendTempDefaultMessageConstr(input) {
        if (this.options.listener) {
            let listener = this.options.listener;
            listener.channel.send(input).catch(error => {
                this.MessageErrorHandlerConstr(error);
            }).then(m => {
                if (m) { m.delete({ timeout: 5000 }) }
            });
        }
    }

    sendTempDefaultMessageChannelConstr(input) {
        if (this.options.channel) {
            let channel = this.options.channel;
            channel.send(input).catch(error => {
                this.MessageErrorHandlerConstr(error);
            }).then(m => {
                if (m) { m.delete({ timeout: 5000 }) }
            });
        }
    }

    sendTempMessageConstr(input, ms) {
        if (this.options.listener) {
            let listener = this.options.listener;
            return listener.channel.send(input).catch(error => {
                this.MessageErrorHandlerConstr(error);
            }).then(m => {
                if (m) { m.delete({ timeout: ms }) }
            });
        }
    }

    sendReplyConstr(input) {
        if (this.options.listener) {
            let listener = this.options.listener;
            return listener.reply(input).catch(error => {
                this.MessageErrorHandlerConstr(error);
            });
        }
    }

    sendTempDefaultReplyConstr(input) {
        if (this.options.listener) {
            let listener = this.options.listener;
            return listener.reply(input).catch(error => {
                this.MessageErrorHandlerConstr(error);
            }).then(m => {
                if (m) { m.delete({ timeout: 5000 }) }
            });
        }
    }

    MessageErrorHandlerInst(listener, error) {
        for (let key in Constants.APIErrors) {
            if (error.code === Constants.APIErrors[key]) {
                return listener.channel.send(CustomAPIErrors[key])
                    .catch(() => { return null; })
                    .then(m => {
                        if (m !== null) {
                            m.delete({ timeout: 5000})
                        }
                    });
            }
        }
    }

    sendMessageInst(listener, input) {
        return listener.channel.send(input).catch(error => {
           MessageErrorHandler(listener, error);
        });
    }

    sendTempMessageDefaultInst(listener, input) {
        return listener.channel.send(input).catch(error => {
            MessageErrorHandler(listener, error);
        }).then(m => {
            if (m) { m.delete({ timeout: 5000 }) }
        });
    }
}

module.exports = messenger;
