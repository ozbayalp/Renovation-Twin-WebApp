"""Factory for creating damage analyzers based on configuration."""

from __future__ import annotations

import logging
import os

from backend.core.config import DAMAGE_ANALYZER

from .base import DamageAnalyzerProtocol, DamageAnalysisError
from .mock_analyzer import MockDamageAnalyzer
from .openai_analyzer import OpenAIDamageAnalyzer
from .replay_analyzer import ReplayDamageAnalyzer

logger = logging.getLogger(__name__)


def get_damage_analyzer(
    mode: str | None = None,
    api_key: str | None = None,
) -> DamageAnalyzerProtocol:
    """
    Factory function to get the appropriate damage analyzer.
    
    The analyzer mode is determined by:
    1. If api_key is provided, uses "openai" mode automatically
    2. The `mode` parameter if provided
    3. The DAMAGE_ANALYZER environment variable
    4. Defaults to "mock"
    
    Available modes:
    - "mock": Generates realistic synthetic damage data (default)
    - "openai": Uses OpenAI Vision API (requires API key)
    - "replay": Uses pre-recorded fixtures from backend/fixtures/damages/
    
    Args:
        mode: Optional mode override
        api_key: Optional OpenAI API key (user-provided via request header)
        
    Returns:
        An instance of the appropriate analyzer
        
    Raises:
        ValueError: If an unknown mode is specified
    """
    # If user provides an API key, use OpenAI analyzer
    # SECURITY: Never log the actual API key value
    if api_key:
        logger.info("Using OpenAI analyzer with user-provided API key (key length: %d)", len(api_key))
        return OpenAIDamageAnalyzer(api_key=api_key)
    
    analyzer_mode = (mode or os.getenv("DAMAGE_ANALYZER", DAMAGE_ANALYZER)).lower()
    
    logger.info("Creating damage analyzer with mode: %s", analyzer_mode)
    
    if analyzer_mode == "mock":
        return MockDamageAnalyzer()
    
    elif analyzer_mode == "openai":
        # Check if OpenAI is available, fall back to mock if not
        if not os.getenv("OPENAI_API_KEY"):
            logger.warning(
                "DAMAGE_ANALYZER=openai but OPENAI_API_KEY not set. "
                "Falling back to mock analyzer."
            )
            return MockDamageAnalyzer()
        try:
            return OpenAIDamageAnalyzer()
        except Exception as exc:
            logger.warning(
                "Failed to initialize OpenAI analyzer: %s. Falling back to mock.",
                exc
            )
            return MockDamageAnalyzer()
    
    elif analyzer_mode == "replay":
        return ReplayDamageAnalyzer()
    
    else:
        raise ValueError(
            f"Unknown DAMAGE_ANALYZER mode: {analyzer_mode}. "
            f"Valid options: mock, openai, replay"
        )
