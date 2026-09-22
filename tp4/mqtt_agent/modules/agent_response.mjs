const standardResponse = (command,agentName,payload) =>
    {
        return `\n${JSON.stringify({date: new Date().toISOString(), command: command, name: agentName, payload: payload},null,2)}\n\n`
    }

const standarPayloadJson = (message,result) =>
    {
        return {message: message, result: result};
    }

export {standardResponse,standarPayloadJson};