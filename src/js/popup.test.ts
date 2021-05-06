/**
 * @jest-environment jsdom
 */

describe('popup', () => {
  const dom = `
    <button id='health-check' />
  `;

  beforeAll(async () => {
    document.body.innerHTML = dom;
  });

  describe('testExample', () => {
    it('should return 5', async () => {
      expect(5).toEqual(5);
    });
  });
});
