"""
End-to-End Tests for Core Game Engine & Graphics Foundation
==========================================================

This module contains comprehensive end-to-end tests validating all core game engine
and graphics foundation features. Tests cover initialization, rendering, game loop,
resource management, and graphics pipeline functionality.

Author: Senior Game Engine Team
Created: 2025-01-20
"""

import unittest
import pytest
import logging
from typing import Optional, Dict, Any
from contextlib import contextmanager
from unittest.mock import Mock, patch
import asyncio
from dataclasses import dataclass
from pathlib import Path
import time

# Assuming these are the core engine imports
from game_engine.core import GameEngine, EngineConfig
from game_engine.graphics import (
    GraphicsContext,
    RenderPipeline,
    Shader,
    Texture,
    Mesh,
    Material
)
from game_engine.utils import ResourceManager
from game_engine.common.exceptions import (
    EngineInitializationError,
    GraphicsError,
    ResourceLoadError
)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@dataclass
class TestResources:
    """Test resource paths and configurations."""
    shader_path: Path = Path("assets/shaders/basic.glsl")
    texture_path: Path = Path("assets/textures/test.png")
    mesh_path: Path = Path("assets/models/cube.obj")
    config_path: Path = Path("config/test_engine_config.json")

class TestEnvironment:
    """Test environment setup and teardown helper."""
    
    def __init__(self):
        self.engine: Optional[GameEngine] = None
        self.graphics: Optional[GraphicsContext] = None
        self.resources: TestResources = TestResources()

    @contextmanager
    def setup_environment(self):
        """Context manager for test environment setup and cleanup."""
        try:
            self.engine = GameEngine(EngineConfig.load(self.resources.config_path))
            self.graphics = self.engine.graphics_context
            yield self
        finally:
            if self.engine:
                self.engine.shutdown()
            if self.graphics:
                self.graphics.cleanup()

class TestCoreGameEngineAndGraphics(unittest.TestCase):
    """
    End-to-end tests for Core Game Engine and Graphics Foundation.
    
    Tests cover:
    - Engine initialization and configuration
    - Graphics context setup and validation
    - Resource loading and management
    - Rendering pipeline functionality
    - Performance and stability
    """

    @classmethod
    def setUpClass(cls):
        """Set up test environment and resources."""
        cls.env = TestEnvironment()
        cls.performance_metrics: Dict[str, float] = {}

    def setUp(self):
        """Set up individual test cases."""
        logger.info(f"Starting test: {self._testMethodName}")

    def tearDown(self):
        """Clean up after each test."""
        logger.info(f"Completed test: {self._testMethodName}")

    @pytest.mark.asyncio
    async def test_01_engine_initialization(self):
        """Test engine initialization and basic configuration."""
        with self.env.setup_environment() as env:
            self.assertIsNotNone(env.engine)
            self.assertTrue(env.engine.is_initialized)
            self.assertIsNotNone(env.graphics)

            # Validate engine configuration
            config = env.engine.config
            self.assertIsNotNone(config.graphics_settings)
            self.assertIsNotNone(config.performance_settings)

    def test_02_graphics_context_setup(self):
        """Test graphics context initialization and capabilities."""
        with self.env.setup_environment() as env:
            # Verify graphics context capabilities
            self.assertTrue(env.graphics.is_hardware_accelerated)
            self.assertGreater(env.graphics.max_texture_size, 0)
            self.assertGreater(len(env.graphics.supported_extensions), 0)

    @pytest.mark.asyncio
    async def test_03_resource_loading(self):
        """Test resource loading and management."""
        with self.env.setup_environment() as env:
            resource_manager = ResourceManager()

            # Test shader loading
            shader = await resource_manager.load_shader(self.env.resources.shader_path)
            self.assertIsInstance(shader, Shader)
            self.assertTrue(shader.is_compiled)

            # Test texture loading
            texture = await resource_manager.load_texture(self.env.resources.texture_path)
            self.assertIsInstance(texture, Texture)
            self.assertTrue(texture.is_loaded)

            # Test mesh loading
            mesh = await resource_manager.load_mesh(self.env.resources.mesh_path)
            self.assertIsInstance(mesh, Mesh)
            self.assertTrue(mesh.is_valid)

    def test_04_rendering_pipeline(self):
        """Test rendering pipeline setup and execution."""
        with self.env.setup_environment() as env:
            pipeline = RenderPipeline(env.graphics)
            
            # Configure pipeline stages
            pipeline.configure_forward_rendering()
            
            # Validate pipeline configuration
            self.assertTrue(pipeline.is_configured)
            self.assertGreater(len(pipeline.stages), 0)

            # Test render pass execution
            start_time = time.perf_counter()
            pipeline.execute_frame()
            frame_time = time.perf_counter() - start_time
            
            self.performance_metrics['frame_time'] = frame_time
            self.assertLess(frame_time, 1/30)  # Ensure minimum 30 FPS

    def test_05_error_handling(self):
        """Test error handling and recovery mechanisms."""
        with self.assertRaises(EngineInitializationError):
            GameEngine(None)  # Should raise error for invalid config

        with self.env.setup_environment() as env:
            with self.assertRaises(ResourceLoadError):
                env.engine.resource_manager.load_sync("nonexistent.file")

            with self.assertRaises(GraphicsError):
                env.graphics.create_texture(None)  # Should raise error for invalid texture data

    @pytest.mark.performance
    def test_06_performance_benchmarks(self):
        """Test performance benchmarks and metrics."""
        with self.env.setup_environment() as env:
            # Measure initialization time
            start_time = time.perf_counter()
            env.engine.initialize()
            init_time = time.perf_counter() - start_time
            self.performance_metrics['init_time'] = init_time
            
            # Memory usage test
            initial_memory = env.engine.get_memory_usage()
            env.engine.load_test_scene()
            final_memory = env.engine.get_memory_usage()
            
            # Validate memory usage
            memory_increase = final_memory - initial_memory
            self.assertLess(memory_increase, 100 * 1024 * 1024)  # Less than 100MB increase

    def test_07_stability_tests(self):
        """Test engine stability under various conditions."""
        with self.env.setup_environment() as env:
            # Test rapid resource loading/unloading
            for _ in range(100):
                texture = env.engine.resource_manager.load_sync(
                    self.env.resources.texture_path
                )
                self.assertIsNotNone(texture)
                env.engine.resource_manager.unload(texture)

            # Test concurrent operations
            async def concurrent_operations():
                tasks = [
                    env.engine.update() for _ in range(10)
                ]
                await asyncio.gather(*tasks)

            asyncio.run(concurrent_operations())

if __name__ == '__main__':
    unittest.main(verbosity=2)