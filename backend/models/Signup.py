from pydantic import BaseModel

class Signup (BaseModel):
    username: str
    password: str
    publicKey: str
    role: str