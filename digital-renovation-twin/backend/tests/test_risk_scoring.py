"""Tests for risk scoring service."""

import json

import pytest


class TestComputeRiskSummary:
    """Tests for compute_risk_summary function."""
    
    def test_computes_correct_risk_score(self, sample_job_with_damages):
        """Test that risk score is computed correctly from damages."""
        from backend.services.risk_scoring import compute_risk_summary
        
        job_id = sample_job_with_damages["job_id"]
        
        risk_path = compute_risk_summary(job_id)
        
        assert risk_path.exists()
        
        with open(risk_path) as f:
            risk_data = json.load(f)
        
        # Check structure
        assert "job_id" in risk_data
        assert "overall_risk_score" in risk_data
        assert "overall_severity_index" in risk_data
        assert "building_health_grade" in risk_data
        assert "total_damage_count" in risk_data
        assert "by_type" in risk_data
        
        # Check values are reasonable
        assert 0 <= risk_data["overall_risk_score"] <= 100
        assert 0 <= risk_data["overall_severity_index"] <= 10
        assert risk_data["building_health_grade"] in ["A", "B", "C", "D"]
        assert risk_data["total_damage_count"] == 3
    
    def test_computes_by_type_aggregation(self, sample_job_with_damages):
        """Test that by_type aggregation is correct."""
        from backend.services.risk_scoring import compute_risk_summary
        
        job_id = sample_job_with_damages["job_id"]
        
        risk_path = compute_risk_summary(job_id)
        
        with open(risk_path) as f:
            risk_data = json.load(f)
        
        by_type = risk_data["by_type"]
        
        # Should have entries for crack, spalling, water_damage
        assert "crack" in by_type
        assert "spalling" in by_type
        assert "water_damage" in by_type
        
        # Check counts
        assert by_type["crack"]["count"] == 1
        assert by_type["spalling"]["count"] == 1
        assert by_type["water_damage"]["count"] == 1
        
        # Check risk points are positive
        assert by_type["crack"]["risk_points"] > 0
        assert by_type["spalling"]["risk_points"] > 0
        assert by_type["water_damage"]["risk_points"] > 0
    
    def test_health_grade_thresholds(self, temp_data_dir, sample_job_id):
        """Test that health grades are assigned correctly based on score."""
        from backend.services.risk_scoring import _grade_from_score
        
        assert _grade_from_score(0) == "A"
        assert _grade_from_score(15) == "A"
        assert _grade_from_score(19.9) == "A"
        
        assert _grade_from_score(20) == "B"
        assert _grade_from_score(30) == "B"
        assert _grade_from_score(39.9) == "B"
        
        assert _grade_from_score(40) == "C"
        assert _grade_from_score(55) == "C"
        assert _grade_from_score(69.9) == "C"
        
        assert _grade_from_score(70) == "D"
        assert _grade_from_score(85) == "D"
        assert _grade_from_score(100) == "D"
    
    def test_missing_damages_file_raises(self, temp_data_dir, sample_job_id):
        """Test that missing damages file raises FileNotFoundError."""
        from backend.services.risk_scoring import compute_risk_summary
        
        with pytest.raises(FileNotFoundError):
            compute_risk_summary(sample_job_id)
