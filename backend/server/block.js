import crypto from 'crypto';

export class Block {
    // Campos privados 
    #index;
    #vote;
    #previousHash;
    #timestamp;
    #hash;

    constructor(index, votes, previousHash) {
        this.#index = index;
        this.#vote = votes; // Esto será un array de votos
        this.#previousHash = previousHash;
        this.#timestamp = Math.floor(Date.now() / 1000); // Timestamp UNIX en segundos
        this.#hash = this.#calculateHash();
    }

    // Getters 
    get index() { return this.#index; }
    get previousHash() { return this.#previousHash; }
    get timestamp() { return this.#timestamp; }
    get vote() { return this.#vote; }
    get hash() { return this.#hash; }

    // Llama al método privado para calcular y devolver el hash.
    getCalculatedHash() {
        return this.#calculateHash();
    }

    // Método privado para calcular el hash del bloque (reemplaza a __calculate_hash)
    #calculateHash() {
        // JSON.stringify es el 'json.dumps' de JS
        const dataString = this.#index.toString() +
                         this.#previousHash +
                         this.#timestamp.toString() +
                         JSON.stringify(this.#vote); // Serializa el array de votos

        // 'crypto.createHash' es el 'hashlib.sha256' de JS
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    toString() {
        return `Block(index=${this.#index}, previousHash='${this.#previousHash}', hash='${this.#hash}')`;
    }
}