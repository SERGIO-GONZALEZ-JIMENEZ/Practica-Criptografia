"""Clase Single Linked List"""
from backend.utils.slist.node import Node

class SList:
    def __init__(self):
        self.head = None
        self.size = 0
    
    def is_empty(self) -> bool:
        return self.size == 0
    
    def add_block(self, elem: object) -> None:
        new_node = Node(elem)
        if self.is_empty():
            self.head = new_node
        else:
            current = self.head
            if current is None:
                return
            while current.next:
                current = current.next
            current.next = new_node
        self.size += 1
    
    def remove_block(self) -> None:
        if not self.is_empty():
            if self.size == 1:
                self.head = None
            else:
                current = self.head
                if current is None:
                    return
                while current.next and current.next.next:
                    current = current.next
                current.next = None
            self.size -= 1


        