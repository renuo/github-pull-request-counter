/**
 * @jest-environment jsdom
 */

import { popup } from '../popup';

describe('popup', () => {
  const dom = `
    <button id='health-check' />
  `;

  beforeAll(async () => {
    document.body.innerHTML = dom;
  });

  describe('testExample', () => {
    it('should return 5', () => {
      expect(popup().testExample()).toEqual(5);
    });
  });
});
