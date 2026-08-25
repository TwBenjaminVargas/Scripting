import fs from 'node:fs/promises';

let _pathToFile = "./db.json";
let _paginaCantidad = 3;
const URL = "https://randomuser.me/api/?results=:num";
const initialData = [];

const setPaginaCantidad = num => {_paginaCantidad = num};

const setFile = async (pathToFile) => { _pathToFile = pathToFile; };

const obtenerDatos = async ()=>
    {

        let contenidoExistente = [];

        try {
            try {
              await fs.writeFile(_pathToFile, JSON.stringify([]), { flag: 'wx' });
              console.log('--- El archivo no existía y fue creado ---');
            } catch (error) {
              if (error.code === 'EEXIST') {
                console.log('--- El archivo ya existía, leyendo contenido... ---');
              } else
                throw error;
            }

            const textoPrevio = await fs.readFile(_pathToFile, 'utf-8');
            console.log(`El contendio del archivo es ${textoPrevio}`);
            contenidoExistente = JSON.parse(textoPrevio);

            const url =URL.replace(":num", _paginaCantidad);
            const response = await fetch(url);

            // forma de indicar que el campo body.results es la variable newData
            const {results: newData } = await response.json();
            console.log(`Respuesta de ${url}:\n ${JSON.stringify(newData,null,2)}`);

            const datosActualizados = contenidoExistente.concat(newData);

            await fs.writeFile(_pathToFile, JSON.stringify(datosActualizados, null, 2), 'utf-8');

            console.log("Datos actualizados y guardados");
        }
        catch (error) {
            console.error('Error al obtener o guardar los datos:', error);
        }

    };

export { setPaginaCantidad, setFile, obtenerDatos };