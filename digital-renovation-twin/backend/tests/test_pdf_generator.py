"""Tests for PDF report generator."""

import json

import pytest


class TestGeneratePdfReport:
    """Tests for generate_pdf_report function."""
    
    def test_generates_pdf_file(self, sample_job_with_damages):
        """Test that PDF file is generated."""
        from backend.services.cost_estimation import generate_cost_estimate
        from backend.services.pdf_generator import generate_pdf_report
        from backend.services.risk_scoring import compute_risk_summary
        
        job_id = sample_job_with_damages["job_id"]
        
        # Generate prerequisite files
        generate_cost_estimate(job_id)
        compute_risk_summary(job_id)
        
        # Generate PDF
        report_path = generate_pdf_report(job_id)
        
        assert report_path.exists()
        assert report_path.suffix == ".pdf"
    
    def test_pdf_is_non_empty(self, sample_job_with_damages):
        """Test that generated PDF has content."""
        from backend.services.cost_estimation import generate_cost_estimate
        from backend.services.pdf_generator import generate_pdf_report
        from backend.services.risk_scoring import compute_risk_summary
        
        job_id = sample_job_with_damages["job_id"]
        
        # Generate prerequisite files
        generate_cost_estimate(job_id)
        compute_risk_summary(job_id)
        
        # Generate PDF
        report_path = generate_pdf_report(job_id)
        
        # PDF should have meaningful size
        file_size = report_path.stat().st_size
        assert file_size > 1000  # At least 1KB
    
    def test_pdf_has_correct_header(self, sample_job_with_damages):
        """Test that generated file starts with PDF magic bytes."""
        from backend.services.cost_estimation import generate_cost_estimate
        from backend.services.pdf_generator import generate_pdf_report
        from backend.services.risk_scoring import compute_risk_summary
        
        job_id = sample_job_with_damages["job_id"]
        
        # Generate prerequisite files
        generate_cost_estimate(job_id)
        compute_risk_summary(job_id)
        
        # Generate PDF
        report_path = generate_pdf_report(job_id)
        
        # Check PDF magic bytes
        with open(report_path, "rb") as f:
            header = f.read(8)
        
        assert header.startswith(b"%PDF-")
