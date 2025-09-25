from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import employees, skills, projects, availability, one_on_ones, dashboard

app = FastAPI(
    title="SES Support API",
    description="SES企業向けキャリア支援ツール API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://*.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(skills.router, prefix="/api/skills", tags=["skills"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(availability.router, prefix="/api/availability", tags=["availability"])
app.include_router(one_on_ones.router, prefix="/api/one-on-ones", tags=["one-on-ones"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "SES Support API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}