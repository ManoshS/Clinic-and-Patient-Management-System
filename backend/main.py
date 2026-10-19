import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from routes.patients import router as patients_router
from routes.appointments import router as appointments_router
from routes.diagnoses import router as diagnoses_router
from routes.prescriptions import router as prescriptions_router
from routes.labs import router as labs_router
from routes.clinical_records import router as records_router
from routes.stats import router as stats_router
from routes.departments import router as depts_router
from routes.professionals import router as profs_router

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("cliniq")


@asynccontextmanager
async def lifespan(app: FastAPI):
    from db import db_fetch
    tables = db_fetch(
        "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = 'public'"
    )
    log.info("DB connected — %s tables found", tables[0]["n"])
    yield


app = FastAPI(title="ClinIQ API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,          prefix="/auth",                     tags=["Auth"])
app.include_router(patients_router,      prefix="/patients",                 tags=["Patients"])
app.include_router(appointments_router,  prefix="/appointments",             tags=["Appointments"])
app.include_router(diagnoses_router,     prefix="/diagnoses",                tags=["Diagnoses"])
app.include_router(prescriptions_router, prefix="/prescriptions",            tags=["Prescriptions"])
app.include_router(labs_router,          prefix="/lab-investigations",       tags=["Labs"])
app.include_router(records_router,       prefix="/clinical-records",         tags=["Records"])
app.include_router(stats_router,         prefix="/stats",                    tags=["Stats"])
app.include_router(depts_router,         prefix="/departments",              tags=["Departments"])
app.include_router(profs_router,         prefix="/healthcare-professionals", tags=["Professionals"])
