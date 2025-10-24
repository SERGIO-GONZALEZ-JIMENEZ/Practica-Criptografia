import time
import json
import hashlib
import base64

class Vote:
    def __init__(self, voter_pub_key, vote_aes, nonce_aes, tag_aes, signature):
        self.voter_pub_key = base64.b64decode(voter_pub_key).decode()
        self.vote_aes = vote_aes
        self.nonce_aes = nonce_aes
        self.tag_aes = tag_aes
        self.signature = signature
        self.timestamp = time.time()
        self.hash  = self.calculate_hash()

    def calculate_hash(self):
        vote_data = {
            'voter_pub_key': self.voter_pub_key,
            'vote_aes': self.vote_aes,
            'nonce_aes': self.nonce_aes,
            'tag_aes': self.tag_aes,
            'signature': self.signature,
            'timestamp': self.timestamp
        }
        vote_string = json.dumps(vote_data, sort_keys=True).encode()
        return hashlib.sha256(vote_string).hexdigest()
    
    def to_dict(self):
        return {
            'voter_pub_key': self.voter_pub_key,
            'vote_aes': self.vote_aes,
            'nonce_aes': self.nonce_aes,
            'tag_aes': self.tag_aes,
            'signature': self.signature,
            'timestamp': self.timestamp,
            'hash': self.hash
        }