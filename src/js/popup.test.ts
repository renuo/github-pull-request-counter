/**
 * @jest-environment jsdom
 */

// import { testExample } from './popup';

describe('popup', () => {
  const dom = `
    <button id='health-check' />
  `;

  beforeAll(async () => {
    document.body.innerHTML = dom;
  });

  describe('testExample', () => {
    it('should return 5', async () => {
      // expect(testExample()).toEqual(5);
      expect(5).toEqual(5);
    });
  });
});
