// This file is required by the jest.config.js and will be executed before each test file
// No need to import or declare Jest globals here as they are already available in test files

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

global.localStorage = localStorageMock;

// Mock THREE.js
global.THREE = {
  AmbientLight: jest.fn(() => ({})),
  DirectionalLight: jest.fn(() => ({
    position: { set: jest.fn() }
  })),
  BoxGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn() }
  })),
// In jest.setup.js, update the THREE.OrbitControls mock:
  OrbitControls: jest.fn().mockImplementation(() => ({
    target: { set: jest.fn() },
    maxDistance: 50,
    maxPolarAngle: Math.PI / 2,
    update: jest.fn(),
    // Add any other OrbitControls methods that might be used
    enableDamping: true,
    dampingFactor: 0.05,
    minDistance: 10,
    maxPolarAngle: Math.PI / 2,
    minPolarAngle: 0,
    enableZoom: true,
    enablePan: false
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    domElement: document.createElement('canvas'),
    render: jest.fn(),
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn(),
  })),
  Vector3: jest.fn().mockImplementation(function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.copy = jest.fn(function(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    });
    this.set = jest.fn(function(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    });
    this.clone = jest.fn(function() {
      return { ...this };
    });
  })
};

// Mock document
global.document = {
  createElement: jest.fn().mockReturnValue({
    addEventListener: jest.fn(),
    getContext: jest.fn().mockReturnValue({}),
  }),
};

// Mock window
global.window = {
  addEventListener: jest.fn(),
  requestAnimationFrame: jest.fn((cb) => setTimeout(cb, 0)),
  cancelAnimationFrame: jest.fn(),
};