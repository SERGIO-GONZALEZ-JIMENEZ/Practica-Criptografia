import hashlib
from block import Block
from datetime import datetime

@dataclass(frozen=True)
class Blockchain:
    def __init__(self):
        self.__chain = [self.create_genesis_block()]

    @property
    def chain(self):
        return self.__chain

    def create_genesis_block(self):
        return Block(0, "Genesis Block", "0")

    def get_last_block(self):
        return self.__chain[-1]

    def add_block(self, data):
        last_block = self.get_last_block()
        new_block = Block(len(self.__chain), data, last_block.hash)
        self.__chain.append(new_block)

    def is_chain_valid(self):
        for i in range(1, len(self.__chain)):
            current = self.__chain[i]
            previous = self.__chain[i-1]
            if current.previous_hash != previous.hash:
                return False
            if current.hash != current.calculate_hash():
                return False
        return True