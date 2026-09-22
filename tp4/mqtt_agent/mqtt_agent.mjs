import mosquitto from './modules/mosquitto.mjs';
import { standarPayloadJson, standardResponse } from './modules/agent_response.mjs';
import {logI} from './modules/logger.mjs';
import {executeCommand, getCommandFromTopic} from './modules/commands.mjs';

const agentName = process.env.AGENT_NAME || `mqtt_agent_${Date.now()}`;
const NameReportTopic = process.env.MQTT_NAME_REPORT_TOPIC || "response/agents/online";

mosquitto.onConnect(() => {
    mosquitto.publish(standardResponse(
        null ,
        agentName,
        standarPayloadJson("Agente en linea","Ok")),
        NameReportTopic);
});


mosquitto.onCommandReceived(async (topic, message, responseTopic, correlationData) => {
    logI(`Comando recibido en ${topic}: ${message}`);
    const result = await executeCommand(getCommandFormTopic(topic), message)
    logI(`Resultado: ${result}`);

    mosquitto.publish(standardResponse(
        getCommandFromTopic(topic),
        agentName,
        standarPayloadJson(result[1],result[0] ? "Error" : "Ok")),
        responseTopic,
        correlationData);

});

