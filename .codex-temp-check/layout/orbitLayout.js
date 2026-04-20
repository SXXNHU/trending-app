import * as THREE from 'three';
const ORBIT_RADII = [11.5, 17.5, 24.5];
const ORBIT_SCORE_PUSH = 0.95;
const VERTICAL_VARIANCE = 1.75;
const DEPTH_SWAY = 1.45;
const ANGLE_ATTRACTION_PASSES = 10;
const LINK_PULL_STRENGTH = 0.22;
const BASE_ANGLE_RESTORE = 0.08;
const SAME_ORBIT_SEPARATION = 0.3;
const SAME_ORBIT_REPULSION = 0.16;
function wrapAngle(angle) {
    const tau = Math.PI * 2;
    let next = angle % tau;
    if (next < 0)
        next += tau;
    return next;
}
function shortestAngleDelta(from, to) {
    let delta = wrapAngle(to) - wrapAngle(from);
    if (delta > Math.PI)
        delta -= Math.PI * 2;
    if (delta < -Math.PI)
        delta += Math.PI * 2;
    return delta;
}
function buildRelaxedAngles(topics) {
    const topicById = new Map(topics.map((topic) => [topic.id, topic]));
    const neighborMap = new Map();
    const baseAngles = new Map();
    const currentAngles = new Map();
    topics.forEach((topic, index) => {
        const baseAngle = wrapAngle(topic.angle + index * 0.12);
        baseAngles.set(topic.id, baseAngle);
        currentAngles.set(topic.id, baseAngle);
        neighborMap.set(topic.id, new Set());
    });
    topics.forEach((topic) => {
        const neighbors = neighborMap.get(topic.id);
        if (!neighbors)
            return;
        topic.links?.forEach((linkedId) => {
            if (!topicById.has(linkedId) || linkedId === topic.id)
                return;
            neighbors.add(linkedId);
            neighborMap.get(linkedId)?.add(topic.id);
        });
    });
    for (let pass = 0; pass < ANGLE_ATTRACTION_PASSES; pass += 1) {
        const nextAngles = new Map(currentAngles);
        topics.forEach((topic) => {
            const current = currentAngles.get(topic.id) ?? 0;
            const base = baseAngles.get(topic.id) ?? current;
            const neighbors = neighborMap.get(topic.id);
            if (!neighbors || neighbors.size === 0) {
                nextAngles.set(topic.id, current + shortestAngleDelta(current, base) * BASE_ANGLE_RESTORE);
                return;
            }
            let sinSum = 0;
            let cosSum = 0;
            let neighborCount = 0;
            neighbors.forEach((neighborId) => {
                const neighborAngle = currentAngles.get(neighborId);
                if (neighborAngle === undefined)
                    return;
                sinSum += Math.sin(neighborAngle);
                cosSum += Math.cos(neighborAngle);
                neighborCount += 1;
            });
            if (neighborCount === 0) {
                nextAngles.set(topic.id, current);
                return;
            }
            const targetAngle = Math.atan2(sinSum, cosSum);
            let next = current
                + shortestAngleDelta(current, targetAngle) * LINK_PULL_STRENGTH
                + shortestAngleDelta(current, base) * BASE_ANGLE_RESTORE;
            topics.forEach((otherTopic) => {
                if (otherTopic.id === topic.id || otherTopic.orbit !== topic.orbit)
                    return;
                const otherAngle = currentAngles.get(otherTopic.id);
                if (otherAngle === undefined)
                    return;
                const delta = shortestAngleDelta(otherAngle, next);
                const distance = Math.abs(delta);
                if (distance >= SAME_ORBIT_SEPARATION || distance < 0.0001)
                    return;
                const push = (1 - distance / SAME_ORBIT_SEPARATION)
                    * SAME_ORBIT_REPULSION
                    * Math.sign(delta);
                next += push;
            });
            nextAngles.set(topic.id, wrapAngle(next));
        });
        currentAngles.clear();
        nextAngles.forEach((angle, id) => currentAngles.set(id, angle));
    }
    return currentAngles;
}
export function computeOrbitPositions(topics) {
    const positions = new Map();
    const relaxedAngles = buildRelaxedAngles(topics);
    topics.forEach((topic, index) => {
        const orbitRadius = ORBIT_RADII[topic.orbit] ?? ORBIT_RADII[1];
        const angle = relaxedAngles.get(topic.id) ?? wrapAngle(topic.angle + index * 0.12);
        const scoreBias = (topic.trafficScore - 50) / 50;
        const radialOffset = scoreBias * ORBIT_SCORE_PUSH;
        const x = Math.cos(angle) * (orbitRadius + radialOffset);
        const z = Math.sin(angle) * (orbitRadius + radialOffset * 0.8);
        const y = Math.sin(angle * 1.45 + topic.orbit * 0.8) * VERTICAL_VARIANCE
            + (topic.orbit - 1) * 0.9
            + Math.cos(angle * 0.7) * DEPTH_SWAY * 0.32;
        positions.set(topic.id, new THREE.Vector3(x, y, z));
    });
    return positions;
}
