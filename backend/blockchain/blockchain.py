import hashlib
from block import Block
from datetime import datetime
from utils.slist import SList
from dataclasses import dataclass

@dataclass(frozen=True)
class Blockchain:
    def __init__(self):
        self.__chain = SList()

    @property
    def chain(self):
        return self.__chain

    def create_genesis_block(self):
        """
        Creates the first block of the blockchain
        """
        return Block(0, "0"*64, "0")

    def read_last_block(self):
        """
        Returns the last block in the chain
        """
        if self.__chain.is_empty():
            return self.create_genesis_block()
        current = self.__chain.head
        if current is None:
            return self.create_genesis_block()
        while current.next:
            current = current.next
        return current.elem

    def add_block(self, votes: list):
        """
        Adds a new block to the chain with a given number of votes
        """
        last_block = self.read_last_block()
        new_block = Block(len(self.__chain), votes, last_block.hash)
        self.__chain.add_block(new_block)

    def is_chain_valid(self):
        """
        Validates the integrity of the blockchain
        """
        if self.__chain.is_empty():
            return True
        current = self.__chain.head
        if current is None:
            return True
        while current.next:
            current_block = current.elem
            next_block = current.next.elem
            if current_block.hash != next_block.previous_hash:
                return False
            if current_block.hash != current_block._Block__calculate_hash():
                return False
            current = current.next
        last_block = current.elem
        if last_block.hash != last_block._Block__calculate_hash():
            return False
        return True