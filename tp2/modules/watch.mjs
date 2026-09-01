import chokidar from 'chokidar'; //modulo de observacion de archivos
import fs from 'node:fs';

// mapa de archivos observados
const watchMap = new Map();

const watch = (path, timeout=60) =>
    {
        if (!fs.existsSync(path)) {
            throw new Error(`La ruta "${path}" no existe en el sistema.`);
        }

        if(timeout>3600)
            throw new Error("El maximo periodo de observacion es 1 hora");
 
        const watcher = chokidar.watch(path,{ignoreInitial:true}); //ignoreInitial ignora elementos que ya estaban

        const watchertoken = generateWatcherToken();
        watchMap.set(watchertoken,[]);

        watcher.on('all',(event, file)=>
            {
                watchMap.get(watchertoken).push({tipoEvento:event,archivo:file,tiempo:Date.now()})
            }
        )

        setTimeout(() => 
            {
                watcher.close();
                console.log(`INFO - ${Date.now()} - Finalizo observación de "${path}", token:${watchertoken}`);

            }, timeout * 1000);
        
        return watchertoken;
    };

const generateWatcherToken = () =>
    {
        const timestamp = Date.now();
        // genera un número entero aleatorio entre 1000 y 99999
        const randomNumber = Math.floor(1000 + Math.random() * 90000);
        return `${timestamp}_${randomNumber}`;
    }

const getwatches = token =>
    {
        if (watchMap.has(token))
            return watchMap.get(token);
        else
            return[];
    }

export {watch,getwatches};