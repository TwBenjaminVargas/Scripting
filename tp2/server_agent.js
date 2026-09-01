import net from 'node:net';
import os from 'node:os';

// Lectura de variables de entorno
const port = process.env.PORT || 7777;

// Datos de cliente socket
const clientData = socket => {return `${socket.remoteAddress}:${socket.remotePort}`;}

// Documentacion de Agente
const commandsDocumentation ="quit --> Cerrar conexión";

// Respuesta estandar
const serverResponse = (msj,command,err = false) =>
    {
        return `${JSON.stringify({err: err, command: command, content: msj},null,2)}\n`
    }


// Medicion de metricas
const serverMetrics = [];

setInterval(() => {
    
    // Metricas de memoria (Bytes a GB)
    const totalMemGB = (os.totalmem() / (1024 ** 3)).toFixed(2); // dos decimales
    const freeMemGB = (os.freemem() / (1024 ** 3)).toFixed(2);
    const freeMemPercent = ((os.freemem() / os.totalmem()) * 100).toFixed(2);

    const memdata = {total: totalMemGB, free: freeMemGB, freePercent: freeMemPercent};
    
    // Metricas y datos de CPU
    const cpus = os.cpus();
    const cpuAvgLoad= os.loadavg();

    const cpudata = {model: cpus[0].model, cores: cpus.length, avgload: cpuAvgLoad};
    
    const timestamp = Date.now()

    const sample = {time: timestamp, cpu: cpudata, memory: memdata};

    if (serverMetrics.length > 120)
        serverMetrics.shift(); // quita inicio

    serverMetrics.push(sample);
    
    console.log(`${timestamp} - Metricas de sistema tomadas`);


}, 30_000); // 30 segundos

// Obtencion de argumentos
const parseCommand = (text) =>
    {
        return text.trim().split(' ');
    }

// Comandos
const getosinfo = (time=0)=>
    {
        if (time < 0)
            throw new Error ("El tiempo ingresado no puede ser negativo");
        if (time > 3600)
            throw new Error ("El tiempo ingresado no puede superar la hora (3600 seg.)");
        if (time === 0)
            return serverMetrics.slice(-1);

        const samplesRequired = Math.ceil(time / 30) // redondeo hacia arriba

        return serverMetrics.slice(-samplesRequired) // tomar las ultimas muestras requeridas

    }


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
                                socket.write(serverResponse(getosinfo(Number(command[1])),data))
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