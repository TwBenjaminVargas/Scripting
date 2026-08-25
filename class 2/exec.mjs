import {spawn as procExterno} from 'child_process';
const ls=procExterno('ls', ['-lsh']);
ls.stdout.setEncoding('utf8');
ls.stdout.on('data', data=> { console.log(`stdout: ${data}`) });

ls.on('close', errorLevel => { console.log('Finalizando proceso con código de error:', errorLevel) });
