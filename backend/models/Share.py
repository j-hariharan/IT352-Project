from pydantic import BaseModel

class Share (BaseModel):
    file: str
    encrypted_key: str
    doctor: str