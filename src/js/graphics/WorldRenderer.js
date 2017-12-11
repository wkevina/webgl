function transformVertices(vertices, transform) {
    return vertices.map(vertex => {
        const out = vec2.fromValues(vertex.x, vertex.y);
        vec2.transformMat3(out, out, transform);
        return {x: out[0], y: out[1]};
    });
}

function circle(shape, transform, segments = 10) {
    const radius = shape.m_radius;
    const vertices = [];

    vertices.push(Vec2(0, 0));

    vertices.push(Vec2(radius, 0));

    for (let i = 1; i < segments; i++) {
        const x = radius * Math.cos(2 * Math.PI / segments * i);
        const y = radius * Math.sin(2 * Math.PI / segments * i);
        vertices.push(Vec2(x, y));
    }

    const scaledVertices = transformVertices(vertices, transform);
    vertices.length = 0;

    scaledVertices.forEach((vertex, index) => {
        vertices.push(vertex.x, vertex.y);

        if (index > 0) {
            vertices.push(vertex.x, vertex.y);
        }
    });

    const firstVertex = scaledVertices[1];

    vertices.push(firstVertex.x, firstVertex.y);

    return vertices;
}

function edge(shape, transform) {
    const vertices = [];

    const scaledVertices = transformVertices([shape.m_vertex1, shape.m_vertex2], transform);

    scaledVertices.forEach((vertex, index) => {
        vertices.push(vertex.x, vertex.y);

        if (index > 0 && index < scaledVertices.length - 1) {
            vertices.push(vertex.x, vertex.y);
        }
    });

    return vertices;
}

function polygon(shape, transform) {
    const vertices = [];

    const scaledVertices = transformVertices(shape.m_vertices, transform);

    scaledVertices.forEach((vertex, index) => {
        vertices.push(vertex.x, vertex.y);

        if (index > 0) {
            vertices.push(vertex.x, vertex.y);
        }
    });

    const firstVertex = scaledVertices[0];

    vertices.push(firstVertex.x, firstVertex.y);

    return vertices;
}

function chain(shape, transform) {
    const vertices = [];

    const scaledVertices = transformVertices(shape.m_vertices, transform);

    scaledVertices.forEach((vertex, index) => {
        vertices.push(vertex.x, vertex.y);

        if (index > 0 && index < scaledVertices.length - 1) {
            vertices.push(vertex.x, vertex.y);
        }
    });

    return vertices;
}

function renderWorld(world, renderer) {
    const lines = [];
    for (let b = world.getBodyList(); b; b = b.getNext()) {
        const p = b.getPosition();
        const angle = b.getAngle();

        const modelTransform = mat3.fromScaling(mat3.create(), [PIXEL_SCALE, PIXEL_SCALE]);
        mat3.translate(modelTransform, modelTransform, [p.x, p.y]);
        mat3.rotate(modelTransform, modelTransform, angle);



        for (let f = b.getFixtureList(); f; f = f.getNext()) {
            const type = f.getType();
            const shape = f.getShape();
            if (type === 'circle') {
                lines.push(...circle(shape, modelTransform));
            }
            if (type === 'edge') {
                lines.push(...edge(shape, modelTransform));
            }
            if (type === 'polygon') {
                lines.push(...polygon(shape, modelTransform));
            }
            if (type == 'chain') {
                lines.push(...chain(shape, modelTransform));
            }
        }
    }

    renderer.render(lines);
}
