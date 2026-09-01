import net from 'node:net';
import { parseArgsStringToArgv } from 'string-argv'; // modulo especializado en parseo de argumentos en strings
import { getosinfo } from './modules/osinfo.mjs';
import { getwatches, watch } from './modules/watch.mjs';
import { ps } from './modules/ps.mjs';
import { oscmd, loadWhiteList } from './modules/oscmd.mjs';
import { authenticate, loadTokenList } from './modules/auth.mjs';

// Lectura de variables de entorno
const port = process.env.PORT || 7777;
const whitelist = process.env.WHITELIST || "wlist.json";
const tokenlist = process.env.TOKENLIST || "tlist.json";

// Lectura de archivos de configuracion
loadWhiteList(whitelist);
loadTokenList(tokenlist);

// Datos de cliente socket
const clientData = socket => {return `${socket.remoteAddress}:${socket.remotePort}`;}

// Documentacion de Agente
const commandsDocumentation = [
    "--- Comandos Públicos ---",
    "login <token>           Inicia sesión en la conexión actual",
    "quit                    Cierra la conexión TCP con el servidor",
    "help                    Muestra ayuda en formato JSON",
    "help-cli                Muestra ayuda en texto plano, util para CLI",
    "",
    "--- COMANDOS RESTRINGIDOS (Requieren login) ---",
    "getosinfo [n]           Uso de CPU y RAM hace <n> segundos (default: 0)",
    "ps                      Lista los procesos activos del servidor",
    "oscmd <comando>         Ejecuta un comando del SO permitido en la whitelist",
    "watch <path> [timeout]  Inicia monitoreo en un path por <timeout> seg (default: 60)",
    "getwatches <token>      Obtiene cambios registrados para un token de monitoreo"
].join('\n');

// Respuesta estandar
const serverResponse = (msj,command,err = false) =>
    {
        return `\n${JSON.stringify({command: command, content: msj,err: err},null,2)}\n\n`
    }

// comandos de acceso publico
const publicCommands = new Set(['login', 'quit', 'help', 'help-cli','']);

// Obtencion de argumentos
const parseCommand = (text) => {return parseArgsStringToArgv(text)}


const server=net.createServer(
    socket => 
        {
            let auth = false;
            socket.setEncoding('utf8');
            console.log(`INFO - ${Date.now()}: Nueva conexión ${clientData(socket)}`)
            socket.write(`\nBenjamin Vargas - Server Agent 2026\n(Usa "help-cli" para consultar documentación)\n\n`);

             socket.on('data', async data=>
                {
                    const datastr = data.toString()
                    try
                    {
                        const command = parseCommand(datastr);
                        if (!publicCommands.has(command[0]) && !auth)
                            throw new Error("Necesitas estar autenticado para usar ese comando")

                        switch(command[0])
                        {
                            case '':
                                break;
                            case 'login':
                                if (authenticate(command[1]))
                                {
                                    auth=true;
                                    console.log(`ÌNFO - ${Date.now()}: login registrado ${clientData(socket)}, token: ${command[1]}`);
                                    socket.write(serverResponse("Login Exitoso! Bienvenido!\n",datastr));
                                }
                                break;
                            
                            case 'oscmd':
                                socket.write(serverResponse(await oscmd(command[1]),datastr));
                                console.log(`INFO - ${Date.now()}: Se ejecuto el comando ${cmd}`);
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
                                console.log(`INFO - ${Date.now()}: ${clientData(socket)} cerro sesión`);
                                socket.write(serverResponse("Hasta luego!", datastr));
                                socket.end();
                                break;

                            case 'help':
                                socket.write(serverResponse(commandsDocumentation,datastr));
                                break;
                            case 'help-cli':
                                socket.write(`\n${commandsDocumentation}\n\n`);
                                break;

                            default:
                                socket.write(serverResponse("No se encontró comando coincidente!",datastr,true));
                                break;
                        }
                    }
                    catch(error)
                    {
                        console.log(`ERROR - ${Date.now()}: ${clientData(socket)} ${error.message}`);
                        socket.write(serverResponse(error.message,datastr,true));
                    }

                })
        });

server.listen(port);
console.log(`\nINFO - ${Date.now()}: Servidor corriendo en 127.0.0.1:${port}`);