import hashlib
import json
import time
from typing import List, Dict, Any

class Block:
    def __init__(self, index: int, timestamp: float, data: Dict[str, Any], previous_hash: str):
        """
        Initialize a new block in the blockchain
        
        Args:
            index: Position of the block in the chain
            timestamp: When the block was created
            data: The data stored in the block (authentication events)
            previous_hash: Hash of the previous block
        """
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()
        
    def calculate_hash(self) -> str:
        """Calculate SHA-256 hash of the block"""
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash
        }, sort_keys=True).encode()
        
        return hashlib.sha256(block_string).hexdigest()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert block to dictionary for serialization"""
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "hash": self.hash
        }

class Blockchain:
    def __init__(self):
        """Initialize a new blockchain with a genesis block"""
        self.chain: List[Block] = []
        self.create_genesis_block()
        
    def create_genesis_block(self) -> None:
        """Create the first block in the chain"""
        genesis_block = Block(0, time.time(), {"message": "Genesis Block for ZKP Authentication System"}, "0")
        self.chain.append(genesis_block)
        
    def get_latest_block(self) -> Block:
        """Get the most recent block in the chain"""
        return self.chain[-1]
    
    def add_block(self, data: Dict[str, Any]) -> Block:
        """
        Add a new block to the chain with the provided data
        
        Args:
            data: Authentication event data to store in the block
            
        Returns:
            The newly created block
        """
        previous_block = self.get_latest_block()
        new_index = previous_block.index + 1
        new_timestamp = time.time()
        new_hash = previous_block.hash
        
        new_block = Block(new_index, new_timestamp, data, new_hash)
        self.chain.append(new_block)
        return new_block
    
    def is_chain_valid(self) -> bool:
        """
        Verify the integrity of the blockchain
        
        Returns:
            True if the chain is valid, False otherwise
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]
            
            # Verify current block's hash
            if current_block.hash != current_block.calculate_hash():
                return False
            
            # Verify chain linkage
            if current_block.previous_hash != previous_block.hash:
                return False
        
        return True
    
    def to_json(self) -> str:
        """
        Convert the blockchain to JSON for storage/transmission
        
        Returns:
            JSON string representation of the blockchain
        """
        return json.dumps([block.to_dict() for block in self.chain], indent=4)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'Blockchain':
        """
        Create a blockchain from a JSON string
        
        Args:
            json_str: JSON representation of the blockchain
            
        Returns:
            Initialized blockchain object
        """
        blockchain = cls()
        # Clear the genesis block
        blockchain.chain = []
        
        blocks_data = json.loads(json_str)
        for block_data in blocks_data:
            block = Block(
                block_data["index"],
                block_data["timestamp"],
                block_data["data"],
                block_data["previous_hash"]
            )
            block.hash = block_data["hash"]
            blockchain.chain.append(block)
            
        return blockchain
    
    def save_to_file(self, filename: str = "blockchain_data.json") -> None:
        """Save the blockchain to a file"""
        with open(filename, 'w') as file:
            file.write(self.to_json())
    
    @classmethod
    def load_from_file(cls, filename: str = "blockchain_data.json") -> 'Blockchain':
        """Load a blockchain from a file"""
        try:
            with open(filename, 'r') as file:
                json_str = file.read()
                return cls.from_json(json_str)
        except FileNotFoundError:
            # If file doesn't exist, create a new blockchain
            return cls()

# Authentication event types
class AuthEvent:
    REGISTRATION = "REGISTRATION"
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILURE = "LOGIN_FAILURE"
    ZKP_VERIFICATION = "ZKP_VERIFICATION"
    ROLE_CHANGE = "ROLE_CHANGE"
    
    @staticmethod
    def create_event(event_type: str, username: str, details: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a standardized authentication event
        
        Args:
            event_type: Type of authentication event
            username: User associated with the event
            details: Additional event-specific information
            
        Returns:
            Formatted event data
        """
        if details is None:
            details = {}
            
        return {
            "type": event_type,
            "username": username,
            "timestamp": time.time(),
            "details": details
        } 