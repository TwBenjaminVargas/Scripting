import net from 'node:net';
import { getosinfo } from './modules/osinfo.mjs';

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
        return `\n${JSON.stringify({err: err, command: command, content: msj},null,2)}\n\n`
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
                    const command = parseCommand(data);
                    switch(command[0])
                    {
                        case '':
                            break;
                        case 'getosinfo':
                            try
                            {
                                socket.write(serverResponse(getosinfo(Number(command[1]) || 0),data))
                            }
                            catch (error)
                            {
                                console.log(`${clientData(socket)} - Error: ${error.message}`);
                                socket.write(serverResponse(error.message,data,true));
                            }
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

                })
        });

server.listen(port);
console.log(`Servidor corriendo en 127.0.0.1:${port}`);
/*Ideas a añadir:
        * entrada de puerto por paremtros de consola
        * tiempo de toma de muestras por parametro de consola
        * funcion de cuerpo de respuesta
*/