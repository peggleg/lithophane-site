import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cylinderCatalogue, cylinderCollections} from '../src/cylinder-catalogue.js';

test('Snoopy scenes are individually selectable landscape panoramas', () => {
  assert.ok(cylinderCollections.some(collection => collection.id === 'snoopy'));
  const entries = cylinderCatalogue.filter(entry => entry.collection === 'snoopy');
  assert.ok(entries.length >= 13);
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);
  assert.equal(new Set(entries.map(entry => entry.asset)).size, entries.length);
  for (const entry of entries) {
    assert.equal(entry.row, 0);
    assert.equal(entry.rows, 1);
    assert.equal(entry.orientation, 'landscape');
    assert.equal(entry.seamMode, 'narrow');
    assert.ok(fs.existsSync(`src/assets/cylinders/${entry.asset}`));
  }
});
