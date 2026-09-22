import mqtt from "mqtt";
import { logD, logI } from "./logger.mjs";
import {availableCommands} from './commands.mjs';

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883"
const agentName = process.env.AGENT_NAME || `mqtt_agent_${Date.now()}`
const qos = process.env.MQTT_QOS || 2;


const conf = {
    clientId:agentName,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    protocolVersion: 5 // protocolo para habilitar propiedades de mensaje
};

logD(`Conectando a ${brokerUrl}`)
const client = mqtt.connect(brokerUrl,conf);

// activar subscripciones a topics establecidos
client.on('connect', () =>
     {
        logI(`Conectado a MQTT ${brokerUrl}`);
        for (const command of availableCommands)
        {
            client.subscribe(`request/commands/${agentName}/${command}`,()=>{logI(`Suscrito al topico request/commands/${agentName}/${command}`)});
        };
     });

const onCommandReceived = (callback) =>
    {
        client.on('message', async(topic, message, packet) => 
            {
                logI(`Mensaje recibido en el topico ${topic}`);

                const responseTopic = packet.properties?.responseTopic;
                const correlationData = packet.properties?.correlationData;
                logD(`responseTopic: ${responseTopic}, correlationData: ${correlationData}`);

                await callback(topic,message.toString(), responseTopic, correlationData);
            });
    };

const publish = async (content, topic, correlationData = null) =>
    {
        return new Promise ((resolve,reject) =>
        {
            if (!client.connected) 
            {
                return reject(new Error('El cliente MQTT no está conectado'));
            }

            const options = { qos: qos};

            // si hay correlationData se añade a propiedades
            if (correlationData) {
                options.properties = {
                    // MQTT v5 exige que correlationData sea un Buffer o Uint8Array
                    correlationData: Buffer.isBuffer(correlationData) 
                        ? correlationData 
                        : Buffer.from(String(correlationData))
                };
            }
            client.publish(topic,content,options,
                (err) =>
                {
                    if(err) return reject(err);
                    logI(`Contenido publicado con exito en el topico ${topic}`);
                    resolve();
                }
            );
        });
    };

const close = () => {
  logD('Cerrando conexión MQTT');
  // force: false asegura que se envíe el paquete DISCONNECT antes de cerrar el socket TCP
  client.end(false);

};

const onConnect = (callback) => {
    if (client.connected) {
        callback();
    } else {
        client.on('connect', callback);
    }
};

const mosquitto = 
{
    publish,
    onConnect,
    close,
    onCommandReceived
};

export default mosquitto;