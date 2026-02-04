"""
FastAPI application entry point for the Anvaya Club API.
Configures middleware, exception handlers, and routes.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import init_db
from app.api import public, admin
from app.exceptions import AnvayaException

# =============================================================================
# Configuration
# =============================================================================

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# =============================================================================
# Lifespan Management
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan handler.
    Initializes the database on startup.
    """
    logger.info("Starting Anvaya Club API...")
    await init_db()
    logger.info("Database initialized successfully")
    yield
    logger.info("Shutting down Anvaya Club API...")

# =============================================================================
# Application Setup
# =============================================================================

app = FastAPI(
    title="Anvaya Club API",
    description="Backend API for Anvaya Club Display Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# =============================================================================
# CORS Middleware
# =============================================================================

cors_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Exception Handlers
# =============================================================================

@app.exception_handler(AnvayaException)
async def anvaya_exception_handler(
    request: Request, 
    exc: AnvayaException
) -> JSONResponse:
    """
    Handle all custom Anvaya exceptions.
    Returns a structured JSON error response.
    """
    logger.warning(
        f"AnvayaException: {exc.error_code} - {exc.message} "
        f"(path: {request.url.path})"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict(),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(
    request: Request, 
    exc: Exception
) -> JSONResponse:
    """
    Handle unexpected exceptions.
    Logs the full error and returns a generic message to the client.
    """
    logger.exception(
        f"Unhandled exception on {request.method} {request.url.path}: {exc}"
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "error_code": "INTERNAL_SERVER_ERROR",
        },
    )

# =============================================================================
# Routes
# =============================================================================

app.include_router(public.router, prefix="/api", tags=["Public"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# =============================================================================
# Health Check Endpoints
# =============================================================================

@app.get("/", tags=["Health"])
async def root() -> dict:
    """Root endpoint - basic API information."""
    return {
        "message": "Anvaya Club API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}

# =============================================================================
# Development Server
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting development server on port {settings.port}")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
    )
