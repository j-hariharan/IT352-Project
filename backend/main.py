from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from firebase import db
from firebase_admin.firestore import FieldFilter

import jwt
from time import time
import os
from env import SECRET_KEY

# models
from models.Signup import Signup
from models.Login import Login
from models.Upload import Upload
from models.Share import Share


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/signup")
async def signup (data: Signup):
    q = db.collection("users").where(filter=FieldFilter("username", "==", data.username))
    docs = q.get()
    
    if len(docs) > 0:
        raise HTTPException(400, "Bad Request")
    
    _, uid = db.collection("users").add({
        "username": data.username,
        "password": data.password,
        "publicKey": data.publicKey,
        "role": data.role
    })
    
    return { "msg": "User Created" }


@app.post("/login")
async def login (data: Login):
    q = db.collection("users").where(filter=FieldFilter("username", "==", data.username))
    docs = q.get()

    if len(docs) == 0:
        raise HTTPException(404, "User not found")
    
    if data.password != docs[0].get("password"):
        raise HTTPException(401, "Wrong password")
    
    payload = {"uid": docs[0].id}
    token = jwt.encode(payload=payload, key=SECRET_KEY)

    return { "token": token, "role": docs[0].get("role") }


@app.post("/upload")
async def upload (data: Upload, req: Request):
    token = req.headers.get("Authorization")
    jwt_data = jwt.decode(jwt=token, key=SECRET_KEY, algorithms=['HS256', ])
    uid = jwt_data["uid"]

    userDoc = db.collection("users").document(uid).get()
    username = userDoc.get("username")

    _, docRef = db.collection("docs").add({
        "uploaded_by": username,
        "owner": data.owner,
        "encrypted_key": data.encrypted_key,
        "hash": data.hash,
        "filename": data.filename,
        "shared_to": False,
        "iv": data.iv
    })

    with open(f"data/{docRef.id}", "w") as f:
        f.write(data.file)

    return { "msg": "File uploaded" }


@app.post("/share/{doc_id}")
async def share (data: Share, doc_id: str, req: Request):
    doc = db.collection("docs").document(doc_id)

    doc.update({
        "shared_encrypted_key": data.encrypted_key,
        "shared_to": data.doctor,
        "share_expiry": int(time()*1000) + 5 * 60 * 1000
    })

    with open(f"data/{doc_id}_shared", "w") as f:
        f.write(data.file)

    return { "msg": "File shared" }

@app.post("/cancel/{doc_id}")
async def share (doc_id: str):
    doc = db.collection("docs").document(doc_id)

    doc.update({
        "shared_encrypted_key": None,
        "shared_to": False,
        "share_expiry": None
    })

    os.remove(f"data/{doc_id}_shared")

    return { "msg": "File shared" }


@app.get("/documents")
async def get_docs (req: Request):
    token = req.headers.get("Authorization")
    jwt_data = jwt.decode(jwt=token, key=SECRET_KEY, algorithms=['HS256', ])
    uid = jwt_data["uid"]

    userDoc = db.collection("users").document(uid).get()
    username = userDoc.get("username")
    role = userDoc.get("role")

    if role == "patient":
        docs = db.collection("docs").where(filter=FieldFilter("owner", "==", username)).get()
        docsData = []
        for doc in docs:
            with open(f"data/{doc.id}") as f:
                file = f.read()
            docsData.append({ **doc.to_dict(), **{"id": doc.id, "file": file} })
        
        return docsData
    
    if role == "doctor":
        docs = db.collection("docs").where(filter=FieldFilter("shared_to", "==", username)).get()
        docsData = []
        for doc in docs:
            with open(f"data/{doc.id}_shared") as f:
                file = f.read()
            docsData.append({ **doc.to_dict(), **{"id": doc.id, "file": file} })
        
        return docsData
    
    if role == "lab":        
        docs = db.collection("docs").where(filter=FieldFilter("uploaded_by", "==", username)).get()
        docsData = []
        for doc in docs:
            docsData.append({ **doc.to_dict(), **{"id": doc.id } })
        
        return docsData






@app.get("/pk/{username}")
async def get_pk (username):
    docs = db.collection("users").where(filter=FieldFilter("username", "==", username)).get()

    if len(docs) == 0:
        raise HTTPException(404, "User not found")
    
    return { "pk": docs[0].get("publicKey"), "role": docs[0].get("role") }
        
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)