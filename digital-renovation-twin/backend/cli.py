#!/usr/bin/env python3
"""
Façade Risk Analyzer CLI

A command-line interface for running the facade analysis pipeline.

Usage:
    python -m backend.cli run-job /path/to/images --label "Demo Building"
    python -m backend.cli list-jobs
    python -m backend.cli job-status <job_id>
"""

import argparse
import json
import shutil
import sys
import uuid
from pathlib import Path

# Ensure backend is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.core.config import (
    DAMAGE_ANALYZER,
    PIPELINE_VERSION,
    RECONSTRUCTIONS_DIR,
    REPORTS_DIR,
    UPLOADS_DIR,
    ensure_data_directories,
)
from backend.database import create_job_record, get_job_stats, list_job_records
from backend.services import job_metadata
from backend.services.analyzers import get_damage_analyzer
from backend.services.cost_estimation import generate_cost_estimate
from backend.services.pdf_generator import generate_pdf_report
from backend.services.risk_scoring import compute_risk_summary


def run_job(image_dir: str, label: str | None = None, analyzer_mode: str | None = None) -> dict:
    """
    Run the full analysis pipeline on images from a directory.
    
    Args:
        image_dir: Path to directory containing facade images
        label: Optional human-readable label for the job
        analyzer_mode: Optional analyzer mode override (mock/openai/replay)
        
    Returns:
        Dictionary with job results
    """
    image_path = Path(image_dir)
    if not image_path.exists():
        raise FileNotFoundError(f"Image directory not found: {image_dir}")
    
    # Find images
    images = list(image_path.glob("*.jpg")) + list(image_path.glob("*.jpeg")) + \
             list(image_path.glob("*.png")) + list(image_path.glob("*.webp"))
    
    if not images:
        raise ValueError(f"No images found in {image_dir}")
    
    print(f"Found {len(images)} images in {image_dir}")
    
    # Create job
    ensure_data_directories()
    job_id = str(uuid.uuid4())
    job_dir = UPLOADS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy images to job directory
    saved_filenames = []
    for img in images:
        dest = job_dir / img.name
        shutil.copy2(img, dest)
        saved_filenames.append(img.name)
        print(f"  Copied: {img.name}")
    
    # Create metadata
    job_metadata.create_job_metadata(job_id, saved_filenames, label=label)
    try:
        create_job_record(job_id, label=label, file_count=len(saved_filenames))
    except Exception:
        pass
    
    print(f"\nCreated job: {job_id}")
    print(f"Label: {label or '(none)'}")
    print(f"Pipeline version: {PIPELINE_VERSION}")
    print(f"Analyzer mode: {analyzer_mode or DAMAGE_ANALYZER}")
    
    # Run pipeline
    print("\n--- Running Analysis Pipeline ---\n")
    
    # Update status
    job_metadata.update_status(job_id, "processing", pipeline_version=PIPELINE_VERSION)
    
    try:
        # Step 1: Damage detection
        print("Step 1: Damage Detection...")
        analyzer = get_damage_analyzer(mode=analyzer_mode)
        damages_path = analyzer.analyze(job_id)
        print(f"  ✓ Damages written to: {damages_path}")
        
        # Step 2: Cost estimation
        print("Step 2: Cost Estimation...")
        cost_path = generate_cost_estimate(job_id)
        print(f"  ✓ Cost estimate written to: {cost_path}")
        
        # Step 3: Risk scoring
        print("Step 3: Risk Scoring...")
        risk_path = compute_risk_summary(job_id)
        print(f"  ✓ Risk summary written to: {risk_path}")
        
        # Step 4: PDF report
        print("Step 4: PDF Report Generation...")
        report_path = generate_pdf_report(job_id)
        print(f"  ✓ Report written to: {report_path}")
        
        # Load results
        with open(risk_path, "r") as f:
            risk_data = json.load(f)
        with open(cost_path, "r") as f:
            cost_data = json.load(f)
        
        # Update final status
        job_metadata.update_status(
            job_id, "completed",
            pipeline_version=PIPELINE_VERSION,
            overall_risk_score=risk_data.get("overall_risk_score"),
            overall_severity_index=risk_data.get("overall_severity_index"),
            building_health_grade=risk_data.get("building_health_grade"),
        )
        
        print("\n--- Analysis Complete ---\n")
        print(f"Job ID:            {job_id}")
        print(f"Status:            completed")
        print(f"Health Grade:      {risk_data.get('building_health_grade')}")
        print(f"Risk Score:        {risk_data.get('overall_risk_score')}/100")
        print(f"Severity Index:    {risk_data.get('overall_severity_index')}/10")
        print(f"Total Cost:        ${cost_data.get('total_cost', 0):,.2f}")
        print(f"Damages Found:     {risk_data.get('total_damage_count', 0)}")
        print(f"\nReport: {report_path}")
        
        return {
            "job_id": job_id,
            "status": "completed",
            "building_health_grade": risk_data.get("building_health_grade"),
            "overall_risk_score": risk_data.get("overall_risk_score"),
            "total_cost": cost_data.get("total_cost"),
            "report_path": str(report_path),
        }
        
    except Exception as exc:
        job_metadata.update_status(job_id, "failed", error=str(exc))
        print(f"\n❌ Pipeline failed: {exc}")
        raise


def list_jobs_cmd():
    """List all jobs."""
    try:
        jobs = list_job_records()
    except Exception:
        jobs = job_metadata.list_jobs()
    
    if not jobs:
        print("No jobs found.")
        return
    
    print(f"Found {len(jobs)} job(s):\n")
    print(f"{'Job ID':<40} {'Status':<12} {'Grade':<6} {'Score':<8} {'Label'}")
    print("-" * 90)
    
    for job in jobs:
        job_id = job.get("job_id", job.get("id", ""))
        status = job.get("status", "unknown")
        grade = job.get("building_health_grade") or "-"
        score = job.get("overall_risk_score")
        score_str = f"{score:.1f}" if score is not None else "-"
        label = job.get("label") or "(unnamed)"
        
        print(f"{job_id:<40} {status:<12} {grade:<6} {score_str:<8} {label}")


def job_status_cmd(job_id: str):
    """Show detailed status for a specific job."""
    try:
        meta = job_metadata.load_metadata(job_id)
    except FileNotFoundError:
        print(f"Job not found: {job_id}")
        return
    
    print(f"\nJob: {job_id}")
    print("-" * 60)
    print(f"Label:              {meta.get('label') or '(none)'}")
    print(f"Status:             {meta.get('status')}")
    print(f"Created:            {meta.get('created_at')}")
    print(f"Updated:            {meta.get('updated_at')}")
    print(f"Pipeline Version:   {meta.get('pipeline_version', 'unknown')}")
    print(f"Files:              {len(meta.get('uploaded_files', []))}")
    
    if meta.get("building_health_grade"):
        print(f"\n--- Analysis Results ---")
        print(f"Health Grade:       {meta.get('building_health_grade')}")
        print(f"Risk Score:         {meta.get('overall_risk_score')}/100")
        print(f"Severity Index:     {meta.get('overall_severity_index')}/10")
    
    if meta.get("error"):
        print(f"\n--- Error ---")
        print(f"{meta.get('error')}")
    
    outputs = meta.get("outputs", {})
    if outputs:
        print(f"\n--- Output Files ---")
        for key, path in outputs.items():
            if path:
                print(f"{key}: {path}")


def stats_cmd():
    """Show pipeline statistics."""
    try:
        stats = get_job_stats()
    except Exception:
        stats = {"jobs_total": 0, "jobs_completed": 0, "jobs_failed": 0, "jobs_processing": 0}
    
    print(f"\nFaçade Risk Analyzer Statistics")
    print("-" * 40)
    print(f"Pipeline Version:   {PIPELINE_VERSION}")
    print(f"Analyzer Mode:      {DAMAGE_ANALYZER}")
    print(f"\nJob Statistics:")
    print(f"  Total:            {stats.get('jobs_total', 0)}")
    print(f"  Completed:        {stats.get('jobs_completed', 0)}")
    print(f"  Failed:           {stats.get('jobs_failed', 0)}")
    print(f"  Processing:       {stats.get('jobs_processing', 0)}")


def main():
    parser = argparse.ArgumentParser(
        description="Façade Risk Analyzer CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Run analysis on a directory of images:
    python -m backend.cli run-job ./test-images --label "Test Building"
  
  List all jobs:
    python -m backend.cli list-jobs
  
  Check job status:
    python -m backend.cli job-status <job_id>
  
  Show statistics:
    python -m backend.cli stats
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # run-job command
    run_parser = subparsers.add_parser("run-job", help="Run analysis on images")
    run_parser.add_argument("image_dir", help="Directory containing facade images")
    run_parser.add_argument("--label", "-l", help="Human-readable label for the job")
    run_parser.add_argument(
        "--analyzer", "-a",
        choices=["mock", "openai", "replay"],
        help="Analyzer mode (default: from DAMAGE_ANALYZER env)"
    )
    
    # list-jobs command
    subparsers.add_parser("list-jobs", help="List all jobs")
    
    # job-status command
    status_parser = subparsers.add_parser("job-status", help="Show job details")
    status_parser.add_argument("job_id", help="Job ID to check")
    
    # stats command
    subparsers.add_parser("stats", help="Show pipeline statistics")
    
    args = parser.parse_args()
    
    if args.command == "run-job":
        run_job(args.image_dir, label=args.label, analyzer_mode=args.analyzer)
    elif args.command == "list-jobs":
        list_jobs_cmd()
    elif args.command == "job-status":
        job_status_cmd(args.job_id)
    elif args.command == "stats":
        stats_cmd()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
