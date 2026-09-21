import mqtt from "mqtt";
import { logD, logI } from "./logger.mjs";

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883"
const clientId = process.env.CLIENT_ID || `snapshot_server_${Date.now()}`
const topic = process.env.MQTT_TOPIC || "snapshot";


const conf = {
    clientId:clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000
};

logD(`Conectando a ${brokerUrl}`)
const client = mqtt.connect(brokerUrl,conf);
client.on('connect', () => 
{
    logI(`Conectado a MQTT ${brokerUrl}`)
});

const publish = async (content) =>
    {
        return new Promise ((resolve,reject) =>
        {
            if (!client.connected) 
            {
                return reject(new Error('El cliente MQTT no está conectado'));
            }
            client.publish(topic,content,{qos: 2},
                (err) =>
                {
                    if(err) return reject(err);
                    resolve();
                }
            )
        });
    }

const close = () => {
  logD('Cerrando conexión MQTT');
  // force: false asegura que se envíe el paquete DISCONNECT antes de cerrar el socket TCP
  client.end(false);

};
const mosquitto = 
{
    publish,
    close
};

export default mosquitto;