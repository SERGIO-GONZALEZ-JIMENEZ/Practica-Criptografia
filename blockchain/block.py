import datetime
import hashlib
from time import timezone
import json

class Block:
    def __init__(self, index, previous_hash, vote):
        self.__index = index
        self.__previous_hash = previous_hash
        self.__timestamp = datetime.timestamp(datetime.now(datetime.timezone.utc))
        self.__vote = vote
        self.__hash = self.__calculate_hash()

    
    @property
    def index(self):
        return self.__index
    @property
    def previous_hash(self):
        return self.__previous_hash
    @property
    def timestamp(self):
        return self.__timestamp
    @property
    def vote(self):
        return self.__vote
    @property
    def hash(self):
        return self.__hash
    

    def __calculate_hash(self):
        """
        Calcula el hash SHA-256 del contenido del bloque
        (excepto el propio hash, para evitar bucle).
        """
        block_data = {
            "index": self.__index,
            "previous_hash": self.__previous_hash,
            "timestamp": self.__timestamp,
            "vote": self.__votes
        }
        # Convertimos el bloque a JSON ordenado y calculamos su hash
        encoded = json.dumps(block_data, sort_keys=True).encode()
        return hashlib.sha256(encoded).hexdigest()
    
    def __repr__(self):
        return f"Block(index={self.index}, previous_hash='{self.previous_hash}', timestamp={self.timestamp}, data='{self.data}', hash='{self.hash}')"