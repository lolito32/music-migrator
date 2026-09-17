import os
import json
from pathlib import Path
import tidalapi

# Definir la ruta del archivo de sesión por defecto dentro del módulo
SESSION_FILE = os.environ.get(
    "TIDAL_SESSION_FILE",
    str(Path(__file__).resolve().parent / "tidal_session.json"),
)

# Instancia global del cliente/sesión de TIDAL
session = tidalapi.Session()

# Device code del flujo en curso (se caduca al autorizar o expirar el link)
_device_code = None


def save_session(session_obj: tidalapi.Session, filepath: str = SESSION_FILE):
    """Guarda las credenciales OAuth en un archivo JSON local."""
    data = {
        "token_type": session_obj.token_type,
        "access_token": session_obj.access_token,
        "refresh_token": session_obj.refresh_token,
        "expiry_time": session_obj.expiry_time.isoformat() if session_obj.expiry_time else None,
        "is_pkce": session_obj.is_pkce,
    }
    with open(filepath, "w") as f:
        json.dump(data, f, indent=4)


def load_saved_session(filepath: str = SESSION_FILE) -> bool:
    """Carga la sesión desde el JSON si existe y la valida."""
    if os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
            loaded = session.load_oauth_session(
                token_type=data.get("token_type"),
                access_token=data.get("access_token"),
                refresh_token=data.get("refresh_token"),
                is_pkce=data.get("is_pkce", False),
            )
            return loaded and session.check_login()
        except Exception as e:
            print(f"[!] Error al cargar sesión previa: {e}")
            return False
    return False


def _logged_user_name():
    """Devuelve el nombre del usuario logueado si está disponible."""
    user = session.user
    return f"{user.first_name} {user.last_name}" if user else "Usuario"


def _exchange_device_code(device_code: str) -> str:
    """Hace una única comprobación del device code contra TIDAL.

    Si TIDAL ya autorizó el código, canjea el token e inicializa la sesión.
    No espera ni duerme: se llama repetidas veces desde el polling.

    Devuelve "ok" si canjeó el token, "expired" si el link caducó, o "pending"
    si el usuario aún no ha autorizado.
    """
    response = session.request_session.post(
        session.config.api_oauth2_token,
        data={
            "client_id": session.config.client_id,
            "client_secret": session.config.client_secret,
            "device_code": device_code,
            "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
            "scope": "r_usr w_usr w_sub",
        },
    )
    if response.ok:
        session.process_auth_token(response.json(), is_pkce_token=False)
        return "ok"

    try:
        error = response.json().get("error")
    except Exception:
        error = None
    if error == "expired_token":
        return "expired"

    return "pending"


def start_device_flow():
    """Inicia el Device Flow OAuth para ser expuesto vía API."""
    global _device_code

    if load_saved_session():
        return {
            "status": "authenticated",
            "user": _logged_user_name(),
            "message": "Sesión previamente guardada activa",
        }

    try:
        link_login = session.get_link_login()
    except Exception as e:
        print(f"[!] Error al iniciar Device Flow: {e}")
        return {
            "status": "error",
            "message": "No se pudo iniciar la conexión con Tidal. Inténtalo de nuevo.",
        }

    _device_code = link_login.device_code
    return {
        "status": "pending",
        "verification_url": f"https://{link_login.verification_uri_complete}",
        "user_code": link_login.user_code,
        "expires_in": int(link_login.expires_in),
        "message": "Abre la URL e ingresa en TIDAL para autorizar",
    }


def verify_session():
    """Confirma si el usuario completó la autenticación en el navegador y guarda el JSON."""
    global _device_code

    if session.check_login():
        save_session(session)
        return {
            "status": "authenticated",
            "user": _logged_user_name(),
        }

    if _device_code:
        try:
            result = _exchange_device_code(_device_code)
        except Exception as e:
            print(f"[!] Error al verificar Device Flow: {e}")
            _device_code = None
            return {"status": "error", "message": "No se pudo comprobar el estado de la autorización."}

        if result == "ok":
            save_session(session)
            return {
                "status": "authenticated",
                "user": _logged_user_name(),
            }
        if result == "expired":
            _device_code = None
            return {
                "status": "expired",
                "message": "El código expiró. Vuelve a iniciar la conexión con Tidal.",
            }

    return {"status": "pending", "message": "Autenticación aún no completada"}