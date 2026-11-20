from pathlib import Path
import sqlite3
from fastapi import FastAPI, Header, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


# --- 1. ENVIRONMENT CONFIGURATION ---
class Settings(BaseSettings):
    app_name: str = "Project Aries Proxy API"
    allowed_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    admin_api_key: str
    db_path: str = str(BASE_DIR / "agents.db")

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore",
    )


settings = Settings()

app = FastAPI(title=settings.app_name, version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 2. SQLITE DATABASE INITIALIZATION ---
def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_handle TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            description TEXT NOT NULL,
            tech_stack TEXT NOT NULL,
            github_url TEXT NOT NULL,
            architecture_notes TEXT
        )
    """)

    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        default_projects = [
            (
                "dna-analyzer",
                "DNA Sequence Pattern Analyzer",
                "Active",
                "Bioinformatics string processing software using Context-Free Grammars and Java DFA Minimization.",
                "Java,CFG,Algorithms",
                "https://github.com/toonkari",
                "Implements rigorous finite state automata parsing for nucleotide base alphabets.",
            ),
            (
                "project-aries",
                "Project Aries Portfolio",
                "Active",
                "Responsive personal portfolio featuring ZZZ tech-noir glassmorphism, FastAPI backend, and dynamic HUD components.",
                "React,FastAPI,CSS",
                "https://github.com/toonkari",
                "Built with full-screen CSS scroll-snapping and an asymmetric Inter-Knot design layout.",
            ),
        ]
        cursor.executemany(
            "INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?)",
            default_projects,
        )

    conn.commit()
    conn.close()


init_db()


# --- 3. SECURITY DEPENDENCY ---
def verify_admin_key(x_api_key: str | None = Header(default=None)) -> str:
    if not x_api_key or x_api_key != settings.admin_api_key:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Invalid or missing Proxy API Key.",
        )
    return x_api_key


# --- 4. PYDANTIC SCHEMAS ---
class ProxyMessage(BaseModel):
    sender_handle: str
    message: str


# --- 5. API ENDPOINTS ---
@app.get("/api/projects")
def get_projects():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects")
    rows = cursor.fetchall()
    conn.close()

    projects = [
        {
            "id": row["id"],
            "title": row["title"],
            "status": row["status"],
            "description": row["description"],
            "techStack": row["tech_stack"].split(","),
            "githubUrl": row["github_url"],
            "architectureNotes": row["architecture_notes"],
        }
        for row in rows
    ]
    return {"projects": projects}


@app.get("/api/projects/{project_id}")
def get_project_detail(project_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Project clearance not found")

    return {
        "id": row["id"],
        "title": row["title"],
        "status": row["status"],
        "description": row["description"],
        "techStack": row["tech_stack"].split(","),
        "githubUrl": row["github_url"],
        "architectureNotes": row["architecture_notes"],
    }


@app.post("/api/proxy-message")
def receive_proxy_message(payload: ProxyMessage):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO messages (sender_handle, message) VALUES (?, ?)",
            (payload.sender_handle, payload.message),
        )
        conn.commit()
        conn.close()

        return {
            "status": "success",
            "acknowledgement": f"Transmission saved to secure database. Acknowledged, proxy {payload.sender_handle}.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database logging failed: {str(e)}")


# --- PROTECTED ADMIN ENDPOINT ---
@app.get("/api/messages")
def get_proxy_messages(api_key: str = Security(verify_admin_key)):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()

    messages = [
        {
            "id": row["id"],
            "sender": row["sender_handle"],
            "message": row["message"],
            "timestamp": row["timestamp"],
        }
        for row in rows
    ]
    return {"transmissions": messages}