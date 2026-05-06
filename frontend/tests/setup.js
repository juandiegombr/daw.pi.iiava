import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'test-sensor-id' }),
    useLocation: () => ({ pathname: '/' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Link: ({ children, to, ...props }) =>
      React.createElement('a', { href: to, ...props }, children),
    BrowserRouter: ({ children }) => children,
  };
});

// Mock AuthContext so components using useAuth work without a Provider
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock recharts to avoid warnings and disable animations in tests
vi.mock("recharts", async (importOriginal) => {
  const originalModule = await importOriginal();

  const MockedLineChart = React.forwardRef((props, ref) => {
    return React.createElement(originalModule.LineChart, {
      ref,
      ...props,
      isAnimationActive: false,
      throttleDelay: 0,
    });
  });

  const MockedLine = React.forwardRef((props, ref) => {
    return React.createElement(originalModule.Line, {
      ref,
      ...props,
      isAnimationActive: false,
    });
  });

  const MockedResponsiveContainer = ({ children }) => {
    return React.Children.map(children, (child) => {
      return React.cloneElement(child, {
        ...child.props,
        width: 600,
        height: 400,
      });
    });
  };

  return {
    ...originalModule,
    ResponsiveContainer: MockedResponsiveContainer,
    LineChart: MockedLineChart,
    Line: MockedLine,
  };
});

afterEach(() => {
  cleanup();
});
