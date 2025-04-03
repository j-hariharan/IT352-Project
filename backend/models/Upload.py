from pydantic import BaseModel

class Upload (BaseModel):
    file: str
    filename: str
    encrypted_key: str
    hash: str
    owner: str
    iv: str