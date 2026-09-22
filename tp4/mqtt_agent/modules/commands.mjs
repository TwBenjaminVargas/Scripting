import { spawn } from 'child_process';
const availableCommands = ['help', 'ls'];
const getCommandFromTopic = (topic) => 
    {
        const parts = topic.split('/');
        return parts[parts.length - 1];
    };

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
    "ls                      Mustra el contenido del path especificado en el payload (ej: {\"path\":\"/home/user\"})",
    "help                    Muestra este menú formateado en JSON"
].join('\n');

// Devuelve una tupla (err,resultado) donde err es true si hubo error y resultado es el contenido o el mensaje de error
const executeCommand = async (command, args="") =>
    {
        try
        {
            switch(command)
            {
                case 'help':
                    return [false, commandsDocumentation];
                case 'ls':
                    return [false, await ls(args.trim())];
                default:
                    return [true,"Comando no reconocido"];
            }

        }
        catch(err)
        {
            return [true,`Error al ejecutar el comando: ${err.message}`];
        }

    }
const ls = (args) =>
    {
        return new Promise ( (resolve,reject) =>
            {
                const process = spawn('ls',args ? args.split(" "):["."], {shell:true});
                process.stdout.setEncoding('utf8');
                process.stderr.setEncoding('utf8');
                let stdout = "";
                let stderr = "";
                process.stdout.on('data', data => {stdout +=data;});
                process.stderr.on('data', data => {stderr += data});
                process.on('error', err => reject(err));
                process.on('close', errlvl =>
                    {
                        if (errlvl !== 0)
                            reject(new Error(stderr || `Comando devolvio nivel de error ${errlvl}`));
                        const items = stdout
                        .split('\n')
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                         resolve(items);                     

                    });
            });
    }



export {availableCommands, executeCommand, getCommandFromTopic, commandsDocumentation};