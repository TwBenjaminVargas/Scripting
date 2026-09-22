import readline from 'node:readline';
import chalk from 'chalk';
import Table from 'cli-table3';

// 1. Crear la interfaz con historial activado
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.bold.cyan('agente86> ') // Custom prompt con color
});

console.log(chalk.green.bold('=== Bienvenido al Cliente CLP ===\n'));

// Mostrar el prompt por primera vez
rl.prompt();

// 2. Manejar los inputs del usuario (guarda historial automáticamente)
rl.on('line', async (line) => {
    const input = line.trim();
    const [command, ...args] = input.split(' ');

    switch (command) {
        case 'help':
            console.log(chalk.yellow('\nComandos disponibles:'));
            console.log('  ls [path] : Lista archivos y carpetas');
            console.log('  quit      : Salir de la aplicación\n');
            break;

        case 'ls':
            console.log(chalk.dim(`Ejecutando ls en ${args[0] || '.'}...`));
            
            // Simulación de respuesta tabulada formateada
            const table = new Table({ head: ['Nombre / Ruta', 'Tipo'] });
            table.push(
                ['/algun/path/archivo.txt', chalk.green('file')],
                ['/algun/path/folder', chalk.blue('folder')]
            );
            console.log(table.toString());
            break;

        case 'quit':
            console.log(chalk.red('Saliendo...'));
            rl.close();
            process.exit(0);

        default:
            if (input !== '') {
                console.log(chalk.red(`Comando no reconocido: '${command}'`));
            }
            break;
    }

    // Volver a mostrar el prompt para la siguiente orden
    rl.prompt();
});