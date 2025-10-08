class Block:
    def __init__(self, index, previous_hash, timestamp, vote, hash):
        self.__index = index
        self.__previous_hash = previous_hash
        self.__timestamp = timestamp
        self.__vote = vote
        self.__hash = hash

    
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
    
    def __repr__(self):
        return f"Block(index={self.index}, previous_hash='{self.previous_hash}', timestamp={self.timestamp}, data='{self.data}', hash='{self.hash}')"