import readline from 'node:readline';
import chalk from 'chalk';

import mosquitto from './modules/mosquitto.mjs';

const clientId = process.env.CLIENT_ID || `mqtt_client_${Date.now()}`

const exitWhitoutAgent = () => 
    {
        console.log(chalk.redBright('Error: No se ha especificado un nombre de agente.'));
        process.exit(1);
    }

const agentName = process.env.AGENT_NAME || exitWhitoutAgent();
    
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
