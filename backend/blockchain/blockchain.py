import hashlib
from .block import Block
from datetime import datetime
from backend.utils.slist.slist import SList
from dataclasses import dataclass
from typing import cast # Para error tipo object y Block
import json

"""@dataclass(frozen=True)"""
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
        return Block(0, [], "0"*64)

    def read_last_block(self) -> Block:
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
        return cast(Block, current.elem)

    def add_block(self, votes: list):
        """
        Adds a new block to the chain with a given number of votes
        """
        last_block : Block = self.read_last_block()
        # Ensure last_block is a Block instance before accessing .hash; otherwise use genesis block hash
        prev_hash = last_block.hash
        # El índice del nuevo bloque será el índice anterior más 1
        new_index = last_block.index + 1
        new_block = Block(new_index, votes, prev_hash)
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
            current_block = cast(Block, current.elem)
            next_block = cast(Block, current.next.elem)
            if current_block.hash != next_block.previous_hash:
                return False
            if current_block.hash != current_block.get_calculated_hash():
                return False
            current = current.next
        last_block = cast(Block, current.elem)
        if last_block.hash != last_block.get_calculated_hash():
            return False
        return True

    # Para pasar dict a json
    def to_json(self):
        block_array = []
        current = self.__chain.head

        while current:
            block = cast(Block, current.elem)

            block_array.append(block.to_dict())
            current = current.next
        
        return json.dumps(block_array, indent=4)
    