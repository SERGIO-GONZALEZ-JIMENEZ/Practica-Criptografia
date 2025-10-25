import datetime
import hashlib
import json

class Block:
    def __init__(self, index:int, votes:list, previous_hash: str):
        self.__index = index
        self.__vote = votes
        self.__previous_hash = previous_hash
        self.__timestamp = datetime.datetime.now(datetime.timezone.utc).timestamp()
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
        Uses the block's attributes to calculate its hash
        """
        block_data = {
            "index": self.__index,
            "previous_hash": self.__previous_hash,
            "timestamp": self.__timestamp,
            "vote": self.__vote
        }
        encoded = json.dumps(block_data, sort_keys=True).encode()
        return hashlib.sha256(encoded).hexdigest()

    def get_calculated_hash(self):
        """Llama al método privado y develve el hash"""
        return self.__calculate_hash
    
    def __repr__(self):
        return f"Block(index={self.index}, previous_hash='{self.previous_hash}', timestamp={self.timestamp}, hash='{self.hash}')"