import {spawn} from 'child_process';
import { parseArgsStringToArgv } from 'string-argv';
import { logD } from './logger.mjs';
import { log } from 'console';

let snapshotCommand = `ffmpeg -f v4l2 -i /dev/video0 -vf "select=gte(n\\,30)" -frames:v 1 -update 1 foto.jpg`;
const formatSnapshotcommand = commandstr => { return parseArgsStringToArgv(commandstr) };
const setSnapshotCommand = commandStr => {snapshotCommand = commandStr};
const takeShanpshot= async ()=>
    {
        return new Promise ( (resolve,reject) =>
            {
                logD(`Tomando snapshot con comando: ${snapshotCommand}`)
                const cmdarr = formatSnapshotcommand(snapshotCommand)
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


        
    };

export {takeShanpshot as snapshot, setSnapshotCommand};