export const graphicsEngine = {
    init: jest.fn(),
    renderSnake: jest.fn(),
    renderFood: jest.fn(),
    update: jest.fn(),
    render: jest.fn(),
    onWindowResize: jest.fn(),
    scene: { add: jest.fn(), remove: jest.fn() },
    camera: { position: { set: jest.fn() } },
    controls: { reset: jest.fn() },
    scene: { add: jest.fn() },
    foodMesh: { position: { set: jest.fn() } }
};

export default graphicsEngine;
