from pydantic import BaseModel


class LoginRequest(BaseModel):
    """Admin login request schema."""
    username: str
    password: str


class TokenResponse(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"
