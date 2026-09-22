import mqtt from "mqtt";
import chalk from 'chalk';

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883"
const clientId = process.env.CLIENT_ID || `mqtt_client_${Date.now()}`
const qos = process.env.MQTT_QOS || 2;
const responseTopic = process.env.RESPONSE_TOPIC || `clients/${clientId}/responses`;

const pendingRequests = new Map();


const conf = {
    clientId:clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
    protocolVersion: 5 // protocolo para habilitar propiedades de mensaje
};

console.log(chalk.green.bgMagentaBright(`Conectando a ${brokerUrl}...`));
const client = mqtt.connect(brokerUrl,conf);


client.on('connect', () =>
     {
        console.log(chalk.bgMagentaBright(`Conectado a MQTT ${brokerUrl} con exito!`));
        client.subscribe(responseTopic,()=>{}); 
     });

const sendCommand = async (command,args,agentname) =>
    {
        return new Promise ((resolve,reject) =>
        {
            if (!client.connected)
            {
                return reject(new Error('El cliente MQTT no está conectado'));
            }

            const correlationId = Date.now().toString(); // ID de la petición

            const options = 
            { 
                qos: qos,
                properties:
                    {
                        responseTopic: responseTopic,
                        correlationData: Buffer.from(correlationId)
                    }
            };

            pendingRequests.set(
                correlationId,
                {
                    command: command+args,
                    timestamp: Date.now()
                }
            );

            client.publish(`request/commands/${agentname}/${command}`,args,options,
                (err) =>
                {
                    if(err) return reject(err);
                    resolve();
                }
            );
        });
    };

const close = () => {
  console.log(chalk.bgMagentaBright('Cerrando conexión MQTT'));
  client.end(false);

};

const onResponse = (callback) =>
    {
        client.on('message', async(topic, message, packet) => 
            {
                const correlationBuffer = packet.properties?.correlationData;
                if (!correlationBuffer)
                {
                    console.log(chalk.yellow("Mensaje recibido sin correlationData, ignorando..."));
                    return;
                }

                const correlationId = correlationBuffer.toString();

                // Verificamos si esta respuesta le pertenece a ESTE cliente
                if (pendingRequests.has(correlationId)) {

                    // Limpiar la solicitud del mapa ya que fue respondida
                    pendingRequests.delete(correlationId);

                    await callback(message.toString());
                }
            });
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
    sendCommand,
    onConnect,
    onResponse,
    close
};

export default mosquitto;