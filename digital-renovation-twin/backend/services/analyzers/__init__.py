"""
Damage Analyzer Abstraction Layer

This module provides a pluggable analyzer system with three modes:
- OpenAIDamageAnalyzer: Real OpenAI Vision API integration
- MockDamageAnalyzer: Generates realistic synthetic damage data
- ReplayDamageAnalyzer: Replays pre-recorded fixtures for testing

Use get_damage_analyzer() to obtain the configured analyzer.
"""

from .base import DamageAnalyzerProtocol
from .factory import get_damage_analyzer
from .mock_analyzer import MockDamageAnalyzer
from .openai_analyzer import OpenAIDamageAnalyzer
from .replay_analyzer import ReplayDamageAnalyzer

__all__ = [
    "DamageAnalyzerProtocol",
    "get_damage_analyzer",
    "MockDamageAnalyzer",
    "OpenAIDamageAnalyzer",
    "ReplayDamageAnalyzer",
]
