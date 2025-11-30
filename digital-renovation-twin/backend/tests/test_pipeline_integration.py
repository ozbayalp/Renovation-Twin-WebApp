"""Integration tests for the full analysis pipeline."""

import json
import os
import uuid

import pytest


class TestPipelineIntegration:
    """Integration tests running the full pipeline."""
    
    def test_full_pipeline_with_mock_analyzer(self, temp_data_dir, sample_job_id):
        """Test running the complete pipeline with mock analyzer."""
        from backend.core.config import RECONSTRUCTIONS_DIR, REPORTS_DIR, UPLOADS_DIR
        from backend.services import job_metadata
        from backend.services.analyzers import get_damage_analyzer
        from backend.services.cost_estimation import generate_cost_estimate
        from backend.services.pdf_generator import generate_pdf_report
        from backend.services.risk_scoring import compute_risk_summary
        
        job_id = sample_job_id
        
        # Setup: Create job directory with dummy images
        job_dir = UPLOADS_DIR / job_id
        job_dir.mkdir(parents=True)
        
        # Create dummy image files
        for i in range(3):
            (job_dir / f"facade_{i}.jpg").write_bytes(b"fake image data " + str(i).encode())
        
        # Create job metadata
        job_metadata.create_job_metadata(
            job_id, 
            ["facade_0.jpg", "facade_1.jpg", "facade_2.jpg"],
            label="Integration Test Building"
        )
        
        # Step 1: Run damage detection with mock analyzer
        analyzer = get_damage_analyzer(mode="mock")
        damages_path = analyzer.analyze(job_id)
        
        assert damages_path.exists()
        with open(damages_path) as f:
            damages_data = json.load(f)
        assert "damages" in damages_data
        assert len(damages_data["damages"]) > 0
        
        # Step 2: Generate cost estimate
        cost_path = generate_cost_estimate(job_id)
        
        assert cost_path.exists()
        with open(cost_path) as f:
            cost_data = json.load(f)
        assert "total_cost" in cost_data
        assert cost_data["total_cost"] >= 0
        
        # Step 3: Compute risk summary
        risk_path = compute_risk_summary(job_id)
        
        assert risk_path.exists()
        with open(risk_path) as f:
            risk_data = json.load(f)
        assert "overall_risk_score" in risk_data
        assert "building_health_grade" in risk_data
        assert risk_data["building_health_grade"] in ["A", "B", "C", "D"]
        
        # Step 4: Generate PDF report
        report_path = generate_pdf_report(job_id)
        
        assert report_path.exists()
        assert report_path.stat().st_size > 1000
        
        # Verify final metadata update
        final_meta = job_metadata.load_metadata(job_id)
        assert final_meta["status"] == "uploaded"  # Not updated by services directly
        assert final_meta["label"] == "Integration Test Building"
    
    def test_pipeline_with_replay_analyzer(self, temp_data_dir, monkeypatch):
        """Test running pipeline with replay analyzer."""
        # Import after temp_data_dir fixture applies patches
        from backend.core.config import UPLOADS_DIR
        from backend.services import job_metadata
        from backend.services.analyzers import ReplayDamageAnalyzer
        
        job_id = str(uuid.uuid4())
        
        # Setup fixtures directory in temp location
        fixtures_dir = temp_data_dir / "fixtures" / "damages"
        fixtures_dir.mkdir(parents=True, exist_ok=True)
        
        # Create sample fixture
        fixture_data = {
            "damages": [
                {
                    "type": "crack",
                    "severity": "high",
                    "description": "Test crack from fixture",
                    "approx_length_m": 2.0,
                    "confidence": 0.95,
                }
            ]
        }
        (fixtures_dir / "sample_damages.json").write_text(json.dumps(fixture_data))
        
        # Setup job
        job_dir = UPLOADS_DIR / job_id
        job_dir.mkdir(parents=True)
        (job_dir / "test.jpg").write_bytes(b"fake image")
        
        job_metadata.create_job_metadata(job_id, ["test.jpg"])
        
        # Run with replay analyzer, passing custom fixtures dir
        analyzer = ReplayDamageAnalyzer(fixtures_dir=fixtures_dir)
        damages_path = analyzer.analyze(job_id)
        
        assert damages_path.exists()
        with open(damages_path) as f:
            damages_data = json.load(f)
        
        # Should have replayed our fixture
        assert len(damages_data["damages"]) == 1
        assert damages_data["damages"][0]["type"] == "crack"
        assert damages_data["damages"][0]["description"] == "Test crack from fixture"
        assert damages_data["analyzer"] == "replay"


class TestAnalyzerFactory:
    """Tests for analyzer factory."""
    
    def test_default_is_mock(self, monkeypatch):
        """Test that default analyzer is mock."""
        monkeypatch.setenv("DAMAGE_ANALYZER", "mock")
        
        from backend.services.analyzers import MockDamageAnalyzer, get_damage_analyzer
        
        analyzer = get_damage_analyzer()
        assert isinstance(analyzer, MockDamageAnalyzer)
    
    def test_openai_falls_back_to_mock_without_key(self, monkeypatch):
        """Test that openai mode falls back to mock without API key."""
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        monkeypatch.setenv("DAMAGE_ANALYZER", "openai")
        
        from backend.services.analyzers import MockDamageAnalyzer, get_damage_analyzer
        
        analyzer = get_damage_analyzer(mode="openai")
        assert isinstance(analyzer, MockDamageAnalyzer)
    
    def test_replay_mode(self, monkeypatch):
        """Test replay mode."""
        monkeypatch.setenv("DAMAGE_ANALYZER", "replay")
        
        from backend.services.analyzers import ReplayDamageAnalyzer, get_damage_analyzer
        
        analyzer = get_damage_analyzer(mode="replay")
        assert isinstance(analyzer, ReplayDamageAnalyzer)
    
    def test_invalid_mode_raises(self):
        """Test that invalid mode raises ValueError."""
        from backend.services.analyzers import get_damage_analyzer
        
        with pytest.raises(ValueError, match="Unknown DAMAGE_ANALYZER mode"):
            get_damage_analyzer(mode="invalid_mode")
