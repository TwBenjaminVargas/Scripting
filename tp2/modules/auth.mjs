import fs from 'node:fs/promises';

let allowedtokens = null;

const loadTokenList = async (path) =>
    {
        if(!path.trim())
            throw new Error(`Es necesario especificar un path`);

        const data = await fs.readFile(path, 'utf8');
        allowedtokens = JSON.parse(data);
    }

const authenticate = token =>
    {
        if (!allowedtokens)
            throw new Error(`Token list no inicializada`);
        
        if(!token.trim())
            throw new Error(`Es necesario especificar un token`);

        if(allowedtokens.tokens.includes(token))
            return true;
        else
            throw new Error(`Token no autorizado`);
    }

export {loadTokenList, authenticate};    
