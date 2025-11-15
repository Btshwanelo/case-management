import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock window.TextEncoder and window.TextDecoder
class MockTextEncoder {
  encode(input: string): Uint8Array {
    return new Uint8Array([...input].map((char) => char.charCodeAt(0)));
  }
}

class MockTextDecoder {
  decode(input?: Uint8Array): string {
    if (!input) return '';
    return String.fromCharCode(...input);
  }
}

Object.assign(global, {
  TextEncoder: MockTextEncoder,
  TextDecoder: MockTextDecoder,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
