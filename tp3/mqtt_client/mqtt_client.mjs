import mqtt from "mqtt";
import fs from 'fs';

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883"
const clientId = process.env.CLIENT_ID || `snapshot_server_${Date.now()}`
const topic = process.env.MQTT_TOPIC || "snapshot";
const outputPath = process.env.OUTPUT_PATH || "./pictures/"

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
    console.log(`Carpeta creada en: ${outputPath}`);
}

const conf = {
    clientId:clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000
};

const getFilename = ()=> {
    const iso = new Date().toISOString(); 
    // ejemplo: "2026-09-21T15:30:45.123Z"

    const filename = iso
        .slice(0, 19)                   // recortar "2026-09-21T15:30:45"
        .replace(/[-T:]/g, '')          // Quitar -, T y : -> "20260921153045"
        .replace(/(\d{8})(\d{6})/, '$1_$2'); // Insertar guion bajo -> "20260921_153045"

    return `${filename}.jpg`;
}

const base64ToPicture = (b64str) => 
    {
        const imageBuffer = Buffer.from(b64str, 'base64');

        fs.writeFileSync(`${outputPath}${getFilename()}`, imageBuffer);
        console.log(`\x1b[93mImagen guardada exitosamente en: ${outputPath}${getFilename()}\x1b[0m`);
    }

console.log(`Conectando a ${brokerUrl}`)
const client = mqtt.connect(brokerUrl,conf);

client.on('connect', () => 
{
    console.log(`Exito! conectado a MQTT ${brokerUrl}`)
    client.subscribe(topic, () =>
        {
            console.log(`Suscrito al topico ${topic}`)
        });
});


client.on('message', (topic, message) => 
    {
        console.log(`Mensaje recibido en el topico ${topic}: [${message.toString().slice(0,30)}...]`);
        base64ToPicture(message.toString());
    });

