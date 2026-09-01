import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';

let whitelist = null;

const loadWhiteList = async (path) =>
    {
        if(!path.trim())
            throw new Error(`Es necesario especificar un path`);

        const data = await fs.readFile(path, 'utf8');
        whitelist = JSON.parse(data);
    }
const oscmd = cmd =>
    {
        if (!whitelist)
            throw new Error(`Whitelist no inicializada`);
        
        if(!cmd.trim())
            throw new Error(`Es necesario especificar un comando`);

        console.log(`INFO - ${Date.now()}: Se intenta ejecutar el comando ${cmd}`);
        const cmdarr = cmd.trim().split(' ');
        if(whitelist.commands.includes(cmdarr[0]))
        {    
            return new Promise ( (resolve,reject) =>
                {
                    const process = spawn(cmdarr[0], cmdarr.slice(1));
                    process.stdout.setEncoding('utf8');
                    process.stderr.setEncoding('utf8');

                    let stdout = "";
                    let stderr = "";
                    process.stdout.on('data', data => {stdout +=data;});
                    process.stderr.on('data', data => {stderr += data});
                    process.on('error', err => reject(err));
                    process.on('close', errlvl => errlvl !== 0 
                        ? reject(new Error(stderr || `Comando devolvio nivel de error ${errlvl}`)) 
                        : resolve(stdout));

                })
                
        }
        else
            throw new Error(`Comando no autorizado`);
    }

export {loadWhiteList, oscmd};