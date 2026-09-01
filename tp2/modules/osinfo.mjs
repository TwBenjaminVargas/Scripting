import os from 'node:os';


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

// Medicion de metricas
const serverMetrics = [];


// Comando
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

export {getosinfo}

