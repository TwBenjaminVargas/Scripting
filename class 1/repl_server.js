// Servidor REPL basado en clase de practico
const PORT=1234; 
const repl=require('repl');
const net=require('net');
const server=net.createServer(
    (socket)=>{
        repl.start('ben socket>',socket);
    }
);
console.log(`Servidor REPL escuchando en ${PORT}`);
server.listen(PORT);
