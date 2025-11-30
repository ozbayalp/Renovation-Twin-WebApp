"""
SQLite Database Layer for Job Persistence

Provides a lightweight persistence layer using SQLAlchemy with SQLite.
Jobs are stored in a database alongside the existing file-based metadata.
"""

from __future__ import annotations

import logging
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Dict, Generator, List, Optional

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, create_engine, func
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from backend.core.config import DATA_DIR, DATABASE_URL, PIPELINE_VERSION

logger = logging.getLogger(__name__)

# Create the SQLAlchemy base
Base = declarative_base()


class Job(Base):
    """SQLAlchemy model for jobs."""
    
    __tablename__ = "jobs"
    
    id = Column(String(36), primary_key=True)  # UUID
    label = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    status = Column(String(50), default="uploaded")
    building_health_grade = Column(String(1), nullable=True)
    overall_risk_score = Column(Float, nullable=True)
    overall_severity_index = Column(Float, nullable=True)
    total_estimated_cost = Column(Float, nullable=True)
    pipeline_version = Column(String(20), default=PIPELINE_VERSION)
    error = Column(Text, nullable=True)
    file_count = Column(Integer, default=0)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert job to dictionary."""
        return {
            "job_id": self.id,
            "label": self.label,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "status": self.status,
            "building_health_grade": self.building_health_grade,
            "overall_risk_score": self.overall_risk_score,
            "overall_severity_index": self.overall_severity_index,
            "total_estimated_cost": self.total_estimated_cost,
            "pipeline_version": self.pipeline_version,
            "error": self.error,
            "file_count": self.file_count,
        }


# Database engine and session factory (lazy initialization)
_engine = None
_SessionLocal = None


def _get_engine():
    """Get or create the database engine."""
    global _engine
    if _engine is None:
        # Ensure data directory exists
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        # Handle SQLite path
        db_url = DATABASE_URL
        if db_url.startswith("sqlite:///"):
            db_path = db_url.replace("sqlite:///", "")
            # Ensure the database file's directory exists
            from pathlib import Path
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        
        _engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False} if "sqlite" in db_url else {},
            echo=False,  # Set to True for SQL debugging
        )
        # Create tables
        Base.metadata.create_all(bind=_engine)
        logger.info("Database initialized at %s", db_url)
    return _engine


def _get_session_factory():
    """Get or create the session factory."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _SessionLocal


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    
    Usage:
        with get_db() as db:
            db.query(Job).all()
    """
    SessionLocal = _get_session_factory()
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db_dependency():
    """FastAPI dependency for database sessions."""
    SessionLocal = _get_session_factory()
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# =============================================================================
# Job CRUD Operations
# =============================================================================

def create_job_record(
    job_id: str,
    label: Optional[str] = None,
    file_count: int = 0,
) -> Job:
    """Create a new job record in the database."""
    with get_db() as db:
        job = Job(
            id=job_id,
            label=label,
            status="uploaded",
            pipeline_version=PIPELINE_VERSION,
            file_count=file_count,
        )
        db.add(job)
        db.flush()
        logger.info("Created job record: %s", job_id)
        return job


def get_job_record(job_id: str) -> Optional[Job]:
    """Get a job record by ID."""
    with get_db() as db:
        return db.query(Job).filter(Job.id == job_id).first()


def update_job_record(
    job_id: str,
    status: Optional[str] = None,
    building_health_grade: Optional[str] = None,
    overall_risk_score: Optional[float] = None,
    overall_severity_index: Optional[float] = None,
    total_estimated_cost: Optional[float] = None,
    error: Optional[str] = None,
    label: Optional[str] = None,
) -> Optional[Job]:
    """Update a job record."""
    with get_db() as db:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        
        if status is not None:
            job.status = status
        if building_health_grade is not None:
            job.building_health_grade = building_health_grade
        if overall_risk_score is not None:
            job.overall_risk_score = overall_risk_score
        if overall_severity_index is not None:
            job.overall_severity_index = overall_severity_index
        if total_estimated_cost is not None:
            job.total_estimated_cost = total_estimated_cost
        if error is not None:
            job.error = error
        if label is not None:
            job.label = label
        
        job.updated_at = datetime.now(timezone.utc)
        db.flush()
        logger.info("Updated job record: %s (status=%s)", job_id, job.status)
        return job


def list_job_records() -> List[Dict[str, Any]]:
    """List all job records, sorted by created_at DESC."""
    with get_db() as db:
        jobs = db.query(Job).order_by(Job.created_at.desc()).all()
        return [job.to_dict() for job in jobs]


def delete_job_record(job_id: str) -> bool:
    """Delete a job record."""
    with get_db() as db:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return False
        db.delete(job)
        logger.info("Deleted job record: %s", job_id)
        return True


def delete_all_job_records() -> int:
    """Delete all job records. Returns count of deleted records."""
    with get_db() as db:
        count = db.query(Job).delete()
        logger.info("Deleted %d job records", count)
        return count


def get_job_stats() -> Dict[str, int]:
    """Get job statistics for metrics endpoint."""
    with get_db() as db:
        total = db.query(func.count(Job.id)).scalar() or 0
        completed = db.query(func.count(Job.id)).filter(Job.status == "completed").scalar() or 0
        failed = db.query(func.count(Job.id)).filter(Job.status == "failed").scalar() or 0
        processing = db.query(func.count(Job.id)).filter(Job.status == "processing").scalar() or 0
        
        return {
            "jobs_total": total,
            "jobs_completed": completed,
            "jobs_failed": failed,
            "jobs_processing": processing,
        }
