import {assert} from 'chai';
import {getTraceTargetUpdate} from '../../../../src/ol/interaction/tracing.js';

describe('getTraceTargetUpdate', () => {
  const coordinates = [
    [-100, -100],
    [100, -100],
    [100, 100],
    [-100, 100],
    [-100, -100],
  ];
  const map = {getPixelFromCoordinate: (coordinate) => coordinate};
  let target;
  let state;

  beforeEach(() => {
    target = {coordinates, ring: true, startIndex: 0.5, endIndex: 0.75};
    state = {
      active: true,
      startCoord: [0, -100],
      targetIndex: 0,
      targets: [target],
    };
  });

  it('reverses when a pointer step crosses the start without landing near it', () => {
    const update = getTraceTargetUpdate([-50, -100], state, map, 12);
    assert.equal(update.endIndex, 0.25);
  });

  it('also reverses a trace that was moving backward', () => {
    target.endIndex = 0.25;
    const update = getTraceTargetUpdate([50, -100], state, map, 12);
    assert.equal(update.endIndex, 0.75);
  });

  it('still reverses when the new endpoint is close to the start', () => {
    const update = getTraceTargetUpdate([-5, -100], state, map, 12);
    assert.approximately(update.endIndex, 0.475, 1e-9);
  });

  it('keeps a long forward trace when the steps stay away from the start', () => {
    for (const coordinate of [
      [100, 0],
      [0, 100],
      [-100, 0],
      [-50, -100],
    ]) {
      target.endIndex = getTraceTargetUpdate(
        coordinate,
        state,
        map,
        12,
      ).endIndex;
    }
    assert.equal(target.endIndex, 5.25);
  });

  it('keeps a long backward trace when the steps stay away from the start', () => {
    target.endIndex = 0.25;
    for (const coordinate of [
      [-100, 0],
      [0, 100],
      [100, 0],
      [50, -100],
    ]) {
      target.endIndex = getTraceTargetUpdate(
        coordinate,
        state,
        map,
        12,
      ).endIndex;
    }
    assert.equal(target.endIndex, -4.25);
  });

  it('does not wrap an open line', () => {
    target.ring = false;
    assert.equal(
      getTraceTargetUpdate([-50, -100], state, map, 12).endIndex,
      0.25,
    );
  });

  it('measures the tolerance in pixels', () => {
    target.endIndex = 1.1;
    const zoomedOutMap = {getPixelFromCoordinate: ([x, y]) => [x / 10, y / 10]};
    assert.equal(
      getTraceTargetUpdate([-100, -80], state, map, 12).endIndex,
      3.9,
    );
    assert.equal(
      getTraceTargetUpdate([-100, -80], state, zoomedOutMap, 12).endIndex,
      -1.1,
    );
  });
});
