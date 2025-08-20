import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders page header', () => {
  render(<App />);
  const linkElement = screen.getByText(/Conversor de CSV para DML/i);
  expect(linkElement).toBeInTheDocument();
});
