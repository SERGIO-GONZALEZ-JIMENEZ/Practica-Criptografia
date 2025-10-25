import { Block } from './block.js';

class Blockchain {
    // Usamos un Array nativo de JS, es más eficiente que SList
    #chain;

    constructor() {
        this.#chain = [];
        // Creamos el bloque génesis al instanciar la cadena
        this.addBlock([]); // Añade el bloque génesis
    }

    get chain() {
        return this.#chain;
    }

    /**
     * Crea el primer bloque de la blockchain
     */
    createGenesisBlock() {
        // "0".repeat(64) es el "0"*64 de JS
        return new Block(0, [], "0".repeat(64));
    }

    /**
     * Devuelve el último bloque de la cadena
     */
    readLastBlock() {
        if (this.#chain.length === 0) {
            // Esto solo debería pasar antes de añadir el génesis
            return this.createGenesisBlock();
        }
        // Acceder al último elemento de un array en JS
        return this.#chain[this.#chain.length - 1];
    }

    /**
     * Añade un nuevo bloque a la cadena con los votos dados
     */
    addBlock(votes) {
        const lastBlock = this.readLastBlock();
        const prevHash = lastBlock.hash;
        const newIndex = lastBlock.index + 1;
        
        const newBlock = new Block(newIndex, votes, prevHash);
        
        // .push() es el .add_block() de un Array en JS
        this.#chain.push(newBlock);
        console.log(`Bloque ${newIndex} añadido a la cadena.`);
    }

    /**
     * Valida la integridad de la blockchain
     */
    isChainValid() {
        // Iteramos desde el segundo bloque (índice 1)
        for (let i = 1; i < this.#chain.length; i++) {
            const currentBlock = this.#chain[i];
            const previousBlock = this.#chain[i - 1];

            // 1. Comprueba si el hash guardado es correcto
            if (currentBlock.hash !== currentBlock.getCalculatedHash()) {
                console.error(`Hash inválido en bloque ${currentBlock.index}`);
                return false;
            }

            // 2. Comprueba si el enlace con el bloque anterior es correcto
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.error(`Cadena rota en bloque ${currentBlock.index}`);
                return false;
            }
        }
        // Si el bucle termina, la cadena es válida
        return true;
    }
}

// --- Singleton ---
// Creamos UNA ÚNICA instancia de la Blockchain para todo el servidor.
// Esto es clave para que no se reinicie con cada petición.
export const blockchain = new Blockchain();