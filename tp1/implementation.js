import {obtenerDatos, setFile, setPaginaCantidad} from  "./modules/fetchDB.mjs"
import minimist from 'minimist';
// process.argv.slice(2) elimina los dos primeros argumentos de Node
const argv = minimist(process.argv.slice(2), {
  
  // valores por defecto y alias
  default: {
    c: 3,            
    f: './data.json'  
  },
  alias: {
    c: 'cantidad',
    f: 'file'
  }
});

async function main() {
  // Pasar los parámetros parseados a la configuración del módulo
  setPaginaCantidad(argv.c);
  setFile(argv.f);

  await obtenerDatos();
}

main();