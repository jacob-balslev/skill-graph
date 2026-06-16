'use strict';

function cloneJson(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function normalizeSegment(segment) {
  if (segment == null) throw new Error('segment is required');
  if (typeof segment === 'string' || typeof segment === 'number') {
    const text = String(segment);
    return { id: text, label: text };
  }
  if (typeof segment !== 'object' || Array.isArray(segment)) {
    throw new Error('segment must be a string or object');
  }
  const next = { ...cloneJson(segment) };
  if (next.id == null && next.label == null) throw new Error('segment.id or segment.label is required');
  if (next.id == null) next.id = String(next.label);
  if (next.label == null) next.label = String(next.id);
  if (next.focusCursor === undefined && next.focus !== undefined) next.focusCursor = cloneJson(next.focus);
  delete next.focus;
  return next;
}

class BreadcrumbStack {
  constructor(initialSegments = []) {
    this._segments = [];
    this._index = -1;
    this._back = [];
    this._forward = [];
    for (const segment of initialSegments) this.push(segment);
  }

  _saveFocus(focusCursor, shouldSave) {
    if (!shouldSave || this._index < 0) return;
    this._segments[this._index] = {
      ...this._segments[this._index],
      focusCursor: cloneJson(focusCursor),
    };
  }

  _currentIndex() {
    return this._index >= 0 && this._index < this._segments.length ? this._index : -1;
  }

  push(segment, focusCursor) {
    this._saveFocus(focusCursor, arguments.length >= 2);
    if (this._index < this._segments.length - 1) {
      this._segments = this._segments.slice(0, this._index + 1);
    }
    const previous = this._currentIndex();
    this._segments.push(normalizeSegment(segment));
    this._index = this._segments.length - 1;
    if (previous >= 0) this._back.push(previous);
    this._forward = [];
    return this.current();
  }

  pop(focusCursor) {
    this._saveFocus(focusCursor, arguments.length >= 1);
    if (this._index < 0) return null;
    this._segments = this._segments.slice(0, this._index);
    this._index = this._segments.length - 1;
    this._back = this._back.filter((i) => i >= 0 && i < this._segments.length);
    this._forward = [];
    return this.current();
  }

  back(focusCursor) {
    this._saveFocus(focusCursor, arguments.length >= 1);
    if (!this._back.length) return this.current();
    if (this._index >= 0) this._forward.push(this._index);
    this._index = this._back.pop();
    return this.current();
  }

  forward(focusCursor) {
    this._saveFocus(focusCursor, arguments.length >= 1);
    if (!this._forward.length) return this.current();
    if (this._index >= 0) this._back.push(this._index);
    this._index = this._forward.pop();
    return this.current();
  }

  jumpTo(index, focusCursor) {
    this._saveFocus(focusCursor, arguments.length >= 2);
    const target = Number(index);
    if (!Number.isInteger(target) || target < 0 || target >= this._segments.length) {
      throw new Error(`breadcrumb index out of range: ${index}`);
    }
    if (target !== this._index && this._index >= 0) {
      this._back.push(this._index);
      this._forward = [];
    }
    this._index = target;
    return this.current();
  }

  current() {
    const index = this._currentIndex();
    return index < 0 ? null : cloneJson(this._segments[index]);
  }

  segments() {
    return cloneJson(this._segments);
  }
}

function createBreadcrumb(initialSegments = []) {
  return new BreadcrumbStack(initialSegments);
}

module.exports = { BreadcrumbStack, createBreadcrumb };
