import net from 'node:net';
import { getosinfo } from './modules/osinfo.mjs';
import { getwatches, watch } from './modules/watch.mjs';

// Lectura de variables de entorno
const port = process.env.PORT || 7777;

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
const parseCommand = (text) => {return text.trim().split(' ');}

const server=net.createServer(
    socket => 
        {
            socket.setEncoding('utf8');
            console.log(`Nueva conexión: ${clientData(socket)}`)
            socket.write(`\nBenjamin Vargas - Server Agent 2026\n(Usa "help" para consultar documentación)\n\n`);

             socket.on('data', data=>
                {
                    try
                    {

                        const command = parseCommand(data);
                        switch(command[0])
                        {
                            case '':
                                break;
                            
                            case 'watch':
                                if(!command[1].trim())
                                    throw new Error("Debes especificar al menos un path");
                                const watchtoken = watch(command[1],Number(command[2]) || 60);
                                console.log(`INFO: ${clientData(socket)} inicio monitoreo de "${command[1]}", token: ${watchtoken}, timeout: ${command[2]}s`)
                                socket.write(serverResponse(`Tu token de seguimiento es ${watchtoken}`,data));
                                break;
                            case 'getwatches':
                                if(!command[1].trim())
                                    throw new Error("Debes especificar el token se seguimiento");
                                socket.write(serverResponse(getwatches(command[1]),data));
                                break;
                            case 'getosinfo':
                                socket.write(serverResponse(getosinfo(Number(command[1]) || 0),data));
                                break;
                            case 'quit':
                                console.log(`${clientData(socket)} - Cerro sesión`);
                                socket.write(serverResponse("Hasta luego!", data));
                                socket.end();
                                break;
                            case 'help':
                                socket.write(serverResponse(commandsDocumentation,data));
                                break;
                            default:
                                socket.write(serverResponse("No se encontró comando coincidente!",data,true));
                                break;
                        }
                    }
                    catch(error)
                    {
                        console.log(`${clientData(socket)} - Error: ${error.message}`);
                        socket.write(serverResponse(error.message,data,true));
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