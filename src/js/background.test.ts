import { chrome } from 'jest-chrome'
import axios from 'axios';
import serviceWorker from './background';
import { globalMock } from '../../__test__/mocks/github-api-mock-data';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('background', () => {
  beforeEach(() => {
    mockedAxios.get.mockImplementation((url: string) => globalMock(url, { pullRequestCount: 3 }));
  })

  it('s', async() => {
    await serviceWorker();
  });
});

test('chrome api events', () => {
  const listenerSpy = jest.fn()
  const sendResponseSpy = jest.fn()

  chrome.runtime.onMessage.addListener(listenerSpy)

  expect(listenerSpy).not.toBeCalled()
  expect(chrome.runtime.onMessage.hasListeners()).toBe(true)

  chrome.runtime.onMessage.callListeners(
    { greeting: 'hello' }, // message
    {}, // MessageSender object
    sendResponseSpy, // SendResponse function
  )

  expect(listenerSpy).toBeCalledWith(
    { greeting: 'hello' },
    {},
    sendResponseSpy,
  )

  expect(sendResponseSpy).not.toBeCalled()
})
