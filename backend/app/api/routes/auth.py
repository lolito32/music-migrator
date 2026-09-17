from fastapi import APIRouter
from app.platforms.tidal.auth import start_device_flow, verify_session

router = APIRouter(prefix="/api/tidal/auth", tags=["Tidal Auth"])


@router.get("/login")
def login_tidal():
    """Inicia el proceso de autenticación de TIDAL."""
    return start_device_flow()


@router.get("/check")
def check_tidal_status():
    """Verifica si el usuario ya autorizó la cuenta en TIDAL."""
    return verify_session()