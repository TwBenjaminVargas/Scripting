import {spawn} from 'child_process';
import { parseArgsStringToArgv } from 'string-argv';
import { logD, logI } from './logger.mjs';
import fs from 'fs';

const snapshotCommand = process.env.SNAPSHOT_COMMAND || `ffmpeg -y -f v4l2 -i /dev/video0 -vf "select=gte(n\\,30)" -frames:v 1 -update 1 snapshot.jpg`;
const filepath = process.env.FILE_PATH || "./snapshot.jpg"
const formatSnapshotcommand = commandstr => { return parseArgsStringToArgv(commandstr) };
const pictureToB64 = ()=>
    {
        return fs.readFileSync(filepath, 'base64');
    }
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
                process.on('close', errlvl =>
                    {
                        if (errlvl !== 0)
                            reject(new Error(stderr || `Comando devolvio nivel de error ${errlvl}`));
                        logI(`Fotografia tomada, ruta: ${filepath}`)
                        try
                        {
                            resolve(pictureToB64());
                        }
                        catch (err)
                        {
                            reject(err);
                        }
                    });
            })

        
    };

export {takeShanpshot as snapshot};