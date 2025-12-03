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
    1. The `mode` parameter if explicitly provided (except "auto")
    2. If api_key is provided and mode is "auto" or None, uses "openai"
    3. The DAMAGE_ANALYZER environment variable
    4. Defaults to "mock"
    
    Available modes:
    - "mock": Generates realistic synthetic damage data (default)
    - "openai": Uses OpenAI Vision API (requires API key)
    - "replay": Uses pre-recorded fixtures from backend/fixtures/damages/
    - "auto": Automatically selects based on API key availability
    
    Args:
        mode: Optional mode override ("mock", "openai", "replay", "auto")
        api_key: Optional OpenAI API key (user-provided via request header)
        
    Returns:
        An instance of the appropriate analyzer
        
    Raises:
        ValueError: If an unknown mode is specified
    """
    # Determine effective mode
    # If mode is explicitly set (not None and not "auto"), use it
    # Otherwise, use API key to decide, then fall back to env var
    if mode and mode.lower() not in ("auto", ""):
        analyzer_mode = mode.lower()
    elif api_key:
        # User provided API key, use OpenAI
        # SECURITY: Never log the actual API key value
        logger.info("Using OpenAI analyzer with user-provided API key (key length: %d)", len(api_key))
        return OpenAIDamageAnalyzer(api_key=api_key)
    else:
        analyzer_mode = os.getenv("DAMAGE_ANALYZER", DAMAGE_ANALYZER).lower()
    
    logger.info("Creating damage analyzer with mode: %s", analyzer_mode)
    
    if analyzer_mode == "mock":
        return MockDamageAnalyzer()
    
    elif analyzer_mode == "openai":
        # Use provided API key or fall back to environment variable
        effective_key = api_key or os.getenv("OPENAI_API_KEY")
        if not effective_key:
            logger.warning(
                "DAMAGE_ANALYZER=openai but no API key available. "
                "Falling back to mock analyzer."
            )
            return MockDamageAnalyzer()
        try:
            return OpenAIDamageAnalyzer(api_key=effective_key if api_key else None)
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
