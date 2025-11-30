"""Tests for cost estimation service."""

import json

import pytest


class TestGenerateCostEstimate:
    """Tests for generate_cost_estimate function."""
    
    def test_generates_cost_estimate(self, sample_job_with_damages):
        """Test that cost estimate is generated correctly."""
        from backend.services.cost_estimation import generate_cost_estimate
        
        job_id = sample_job_with_damages["job_id"]
        
        cost_path = generate_cost_estimate(job_id)
        
        assert cost_path.exists()
        
        with open(cost_path) as f:
            cost_data = json.load(f)
        
        # Check structure
        assert "job_id" in cost_data
        assert "currency" in cost_data
        assert "total_cost" in cost_data
        assert "items" in cost_data
        
        # Check values
        assert cost_data["currency"] == "USD"
        assert cost_data["total_cost"] > 0
        assert len(cost_data["items"]) > 0
    
    def test_itemizes_by_damage_type(self, sample_job_with_damages):
        """Test that costs are itemized by damage type."""
        from backend.services.cost_estimation import generate_cost_estimate
        
        job_id = sample_job_with_damages["job_id"]
        
        cost_path = generate_cost_estimate(job_id)
        
        with open(cost_path) as f:
            cost_data = json.load(f)
        
        items = cost_data["items"]
        item_types = {item["type"] for item in items}
        
        # Should have items for our damage types
        assert "crack" in item_types
        assert "spalling" in item_types
        assert "water_damage" in item_types
    
    def test_calculates_quantities_correctly(self, sample_job_with_damages):
        """Test that quantities and costs are calculated correctly."""
        from backend.services.cost_estimation import generate_cost_estimate
        
        job_id = sample_job_with_damages["job_id"]
        
        cost_path = generate_cost_estimate(job_id)
        
        with open(cost_path) as f:
            cost_data = json.load(f)
        
        # Find crack item (should use length)
        crack_item = next(i for i in cost_data["items"] if i["type"] == "crack")
        assert crack_item["total_quantity"] == 1.5  # from sample damages
        assert crack_item["count"] == 1
        
        # Find spalling item (should use area)
        spalling_item = next(i for i in cost_data["items"] if i["type"] == "spalling")
        assert spalling_item["total_quantity"] == 0.5  # from sample damages
    
    def test_total_cost_matches_sum(self, sample_job_with_damages):
        """Test that total cost equals sum of item costs."""
        from backend.services.cost_estimation import generate_cost_estimate
        
        job_id = sample_job_with_damages["job_id"]
        
        cost_path = generate_cost_estimate(job_id)
        
        with open(cost_path) as f:
            cost_data = json.load(f)
        
        item_costs = sum(item["cost"] for item in cost_data["items"])
        
        # Should match within rounding tolerance
        assert abs(cost_data["total_cost"] - item_costs) < 0.01
    
    def test_missing_damages_file_raises(self, temp_data_dir, sample_job_id):
        """Test that missing damages file raises FileNotFoundError."""
        from backend.services.cost_estimation import generate_cost_estimate
        
        with pytest.raises(FileNotFoundError):
            generate_cost_estimate(sample_job_id)
