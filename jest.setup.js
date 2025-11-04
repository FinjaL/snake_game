// Import Jest's globals
const { expect, test, describe, beforeEach, afterEach, jest } = require('@jest/globals');

// Make Jest's expect and other globals available in all test files
global.expect = expect;
global.test = test;
global.describe = describe;

// Mock THREE.js
global.THREE = {
    Vector3: function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.copy = jest.fn(function(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        });
        this.clone = jest.fn(function() {
            return { ...this };
        });
        this.set = jest.fn(function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        });
    },
    Scene: jest.fn(function() {
        return {
            add: jest.fn(),
            remove: jest.fn()
        };
    }),
    WebGLRenderer: jest.fn(function() {
        return {
            setSize: jest.fn(),
            setPixelRatio: jest.fn(),
            domElement: {},
            render: jest.fn()
        };
    }),
    PerspectiveCamera: jest.fn(function() {
        return {
            position: { set: jest.fn() },
            lookAt: jest.fn(),
            updateProjectionMatrix: jest.fn()
        };
    }),
    DirectionalLight: jest.fn(function() {
        return {
            position: { set: jest.fn() }
        };
    }),
    AmbientLight: jest.fn(),
    BoxGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    Mesh: jest.fn(function() {
        return {
            position: { set: jest.fn() }
        };
    }),
    OrbitControls: jest.fn()
};
