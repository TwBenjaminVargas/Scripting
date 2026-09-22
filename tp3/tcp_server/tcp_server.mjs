import net from 'node:net';
import { parseArgsStringToArgv } from 'string-argv'; // modulo especializado en parseo de argumentos en strings
import { logE,logI, setLoggerLevel,LOGLEVEL, logD } from './modules/logger.mjs';
import { snapshot } from './modules/snapshot.mjs';
import mosquitto from './modules/mosquitto.mjs';

// Lectura de variables de entorno
const port = process.env.PORT || 7777;
const loggerLevel = process.env.LOG_LEVEL || LOGLEVEL.INFO

// establecer configuraciones
setLoggerLevel(loggerLevel)

// Datos de cliente socket
const clientData = socket => {return `${socket.remoteAddress}:${socket.remotePort}`;}


// Documentacion de Agente
const commandsDocumentation = [
    "--- ESTRUCTURA DE RESPUESTA JSON ---",
    "Todas las respuestas (salvo 'help') se envían con el siguiente formato:",
    "{",
    '  "command": "<comando enviado por el cliente>",',
    '  "content": "<resultado obtenido o mensaje de error>",',
    '  "err": true | false',
    "}",
    "",
    "--- COMANDOS ---",
    "snapshot                Toma una fotografia con la webcam",
    "help                    Muestra este menú formateado en JSON",
    "quit                    Cierra la conexión TCP con el servidor",
    "help-cli                Muestra este menú en texto plano directo"
].join('\n');

// Respuesta estandar
const serverResponse = (msj,command,err = false) =>
    {
        return `\n${JSON.stringify({command: command, content: msj,err: err},null,2)}\n\n`
    }

// Obtencion de argumentos
const parseCommand = (text) => {return parseArgsStringToArgv(text)}

const server=net.createServer(
    socket => 
        {
            socket.setEncoding('utf8');
            logI(`Nueva conexión ${clientData(socket)}`)
            socket.write(`\nBenjamin Vargas - Server Agent 2026\n(Usa "help-cli" para consultar documentación)\n\n`);

             socket.on('data', async data=>
                {
                    const datastr = data.toString().trim();
                    try
                    {
                        const command = parseCommand(datastr);
                        logI(`${clientData(socket)} solicito comando ${datastr}`)
                        switch(command[0])
                        {
                            case '':
                                break;
                            case 'snapshot':
                                const imgb64 = await snapshot();
                                logD(`Imagen codificada en Base64: [${imgb64.toString().slice(0,30)}]...`)
                                mosquitto.publish(imgb64);
                                socket.write(serverResponse("OK", datastr));
                                break;

                            case 'help':
                                socket.write(serverResponse(commandsDocumentation,datastr));
                                break;
                            
                            case 'quit':
                                logI(`Cliente: ${clientData(socket)} cerro sesión`)
                                socket.write(serverResponse("OK", datastr));
                                socket.end();
                                mosquitto.close();
                                break;

                            default:
                                socket.write(serverResponse("No se encontró comando coincidente!",datastr,true));
                                break;
                        }
                    }
                    catch(error)
                    {
                        logE(`Cliente ${clientData(socket)} Mensaje: ${error.message}`)
                        socket.write(serverResponse(error.message,datastr,true));
                    }

                })
        });

server.listen(port);
logI(`Servidor corriendo en 127.0.0.1:${port}`)