import net from 'node:net';

const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || "7777"
const period = process.env.PERIOD || 10000
const YELLOW_BRIGHT = "\x1b[93m";
const RESET = "\x1b[0m";

const client = new net.Socket()
client.connect(port,host,()=>{console.log(`\nConectado con ${host}:${port}`)});

client.on('data', (data) => {console.log(`\nrespuesta servidor:${YELLOW_BRIGHT}\n\n ${data.toString().trim()}${RESET}`);});

client.on('error', (err) => {console.error(`\nerror: ${err.message}\n`);});

client.on('close', () => {console.log('\nConexión cerrada.\n'); process.exit(0)});

setInterval(()=> {
    console.log(`\nenviando comando "snapshot" a servidor TCP\n`);
    client.write("snapshot");
},period)