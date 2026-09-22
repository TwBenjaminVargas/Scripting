
// Colores para consola
const COLORS = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
};

const LOGLEVEL = Object.freeze(
    {
        ERROR: 0,
        WARNING: 1,
        INFO: 2,
        DEBUG: 3,
    })

let currentLoggerLevel = process.env.LOG_LEVEL || LOGLEVEL.DEBUG;

const getFormattedDate = () =>
{
    const now = new Date();

    // Formato local numérico (YYYY-MM-DD HH:mm:ss)
    return new Intl.DateTimeFormat('sv-SE', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(now);
}
const log = (label,color,msj) =>
{
    console.log (`[${color}${COLORS.bright}${label}${COLORS.reset}][${COLORS.cyan}[${getFormattedDate()}${COLORS.reset}]: ${msj}`);
}

const isLogAllowed = loglvl => {return loglvl <= currentLoggerLevel}

const logE = (msj) => {if (isLogAllowed(LOGLEVEL.ERROR))log('ERROR',COLORS.red,msj);};
const logI = (msj) => {if (isLogAllowed(LOGLEVEL.INFO)) log('INFO',COLORS.green,msj)};
const logW = (msj) => {if (isLogAllowed(LOGLEVEL.WARNING)) log('WARN',COLORS.yellow,msj)};
const logD = (msj) => {if (isLogAllowed(LOGLEVEL.DEBUG)) log('DEBUG',COLORS.magenta,msj)};

export {logE,logI,logW,logD};