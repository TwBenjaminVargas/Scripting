import net from 'node:net';
import { parseArgsStringToArgv } from 'string-argv'; // modulo especializado en parseo de argumentos en strings
import { getosinfo } from './modules/osinfo.mjs';
import { getwatches, watch } from './modules/watch.mjs';
import { ps } from './modules/ps.mjs';
import { oscmd, loadWhiteList } from './modules/oscmd.mjs';

// Lectura de variables de entorno
const port = process.env.PORT || 7777;
const whitelist = process.env.WHITELIST || "wlist.json";
loadWhiteList(whitelist);

// Datos de cliente socket
const clientData = socket => {return `${socket.remoteAddress}:${socket.remotePort}`;}

// Documentacion de Agente
const commandsDocumentation ="getosinfo <n> --> informacion de memoria y cpu del servidor hace n segundos\n" +
                            "quit --> Cerrar conexión\n";

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
            console.log(`INFO - ${Date.now()}: Nueva conexión ${clientData(socket)}`)
            socket.write(`\nBenjamin Vargas - Server Agent 2026\n(Usa "help" para consultar documentación)\n\n`);

             socket.on('data', async data=>
                {
                    const datastr = data.toString()
                    try
                    {
                        const command = parseCommand(datastr);
                        
                        switch(command[0])
                        {
                            case '':
                                break;
                            
                            case 'oscmd':
                                socket.write(serverResponse(await oscmd(command[1]),datastr));
                                break;

                            case 'ps':
                                socket.write(serverResponse(await ps(),datastr));
                                break;
                    
                            case 'watch':
                                if(!command[1].trim())
                                    throw new Error("Debes especificar al menos un path");
                                const watchtoken = watch(command[1],Number(command[2]) || 60);
                                console.log(`INFO - ${Date.now()}: ${clientData(socket)} inicio monitoreo de "${command[1]}", token: ${watchtoken}, timeout: ${command[2]}s`)
                                socket.write(serverResponse(`Tu token de seguimiento es ${watchtoken}`,datastr));
                                break;
                                
                            case 'getwatches':
                                if(!command[1].trim())
                                    throw new Error("Debes especificar el token se seguimiento");
                                socket.write(serverResponse(getwatches(command[1]),datastr));
                                break;

                            case 'getosinfo':
                                socket.write(serverResponse(getosinfo(Number(command[1]) || 0),datastr));
                                break;

                            case 'quit':
                                console.log(`${clientData(socket)} - Cerro sesión`);
                                socket.write(serverResponse("Hasta luego!", datastr));
                                socket.end();
                                break;

                            case 'help':
                                socket.write(serverResponse(commandsDocumentation,datastr));
                                break;

                            default:
                                socket.write(serverResponse("No se encontró comando coincidente!",datastr,true));
                                break;
                        }
                    }
                    catch(error)
                    {
                        console.log(`ERROR - ${Date.now()} :${clientData(socket)} ${error.message}`);
                        socket.write(serverResponse(error.message,datastr,true));
                    }

                })
        });

server.listen(port);
console.log(`Servidor corriendo en 127.0.0.1:${port}`);
/*Ideas a añadir:
        * entrada de puerto por paremtros de consola
        * tiempo de toma de muestras por parametro de consola
        * funcion de cuerpo de respuesta
*/