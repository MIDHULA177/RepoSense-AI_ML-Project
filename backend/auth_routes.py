from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from backend.database import get_db, User
from backend.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth")


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=req.name, email=req.email, password=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token({"sub": user.email})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": user.email})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}
