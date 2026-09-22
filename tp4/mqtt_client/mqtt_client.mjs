import readline from 'node:readline';
import chalk from 'chalk';
import minimist from 'minimist';
import mosquitto from './modules/mosquitto.mjs';

// Parsear argumentos de consola
const argv = minimist(process.argv.slice(2));

const clientId = process.env.CLIENT_ID || `mqtt_client_${Date.now()}`;

// Tomar el agente recibido por -a o por variable de entorno
const agentName = argv.a || process.env.AGENT_NAME;

if (!agentName) {
    console.log(chalk.red.bold('Error: Debe especificar el nombre del agente con el parámetro -a [agente]'));
    console.log(chalk.yellow('Ejemplo: node client.js -h localhost -p 1883 -a agente86'));
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.bold.cyan(`${clientId} > `) // Custom prompt con color
});

mosquitto.onConnect(() => 
    {
        console.log(chalk.green.bold('\n=== Bienvenido al Cliente MQTT ===\n'));
        console.log(chalk.cyan('\nUsa quit para salir del cliente.\n'));
        // Mostrar el prompt
        rl.prompt();
    });


rl.on('line', async (line) => {
            const input = line.trim();
            const command = input.split(' ');

            switch (command[0]) {
                case 'help':
                    mosquitto.sendCommand('help', '', agentName);
                    break;
            
                case 'ls':
                    mosquitto.sendCommand('ls', command[1] || '.', agentName);
                    break;
                
                case 'quit':
                    console.log(chalk.yellow('Saliendo...'));
                    rl.close();
                    mosquitto.close();
                    process.exit(0);
                    
                default:
                    if (input !== '') {
                        console.log(chalk.red(`Comando no reconocido: '${command}'`));
                    }
                    // Volver a mostrar el prompt para la siguiente orden
                    rl.prompt();
                    break;
            }

    });

mosquitto.onResponse((message) => 
{
    console.log(chalk.yellow(`\n${message}\n`));
    rl.prompt();
});
