"""Base protocol for damage analyzers."""

from __future__ import annotations

from pathlib import Path
from typing import Protocol, runtime_checkable


@runtime_checkable
class DamageAnalyzerProtocol(Protocol):
    """
    Protocol defining the interface for damage analyzers.
    
    All analyzers must implement the analyze() method which:
    - Takes a job_id
    - Analyzes images in the job's upload directory
    - Writes damages.json to the reconstructions directory
    - Returns the path to the generated damages.json
    """
    
    def analyze(self, job_id: str) -> Path:
        """
        Run damage analysis for the given job.
        
        Args:
            job_id: The unique identifier for the job
            
        Returns:
            Path to the generated damages.json file
            
        Raises:
            FileNotFoundError: If job images are not found
            DamageAnalysisError: If analysis fails
        """
        ...


class DamageAnalysisError(RuntimeError):
    """Raised when damage analysis fails."""
    pass
