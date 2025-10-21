"""Clase Nodo"""
class Node:
    def __init__(self, elem: object, next_node: 'Node' = None):
        self.elem = elem
        self.next = next_node
