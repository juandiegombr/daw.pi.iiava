import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

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

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
