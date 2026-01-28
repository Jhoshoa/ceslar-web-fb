/**
 * Button Component Tests
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import Button from '../../components/atoms/Button/Button';
import { lightTheme } from '../../theme';

// Helper to render with theme
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>
  );
};

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render children text', () => {
      renderWithTheme(<Button>Click Me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click Me');
    });

    it('should render with default props', () => {
      renderWithTheme(<Button>Default Button</Button>);
      const button = screen.getByRole('button');

      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Variants', () => {
    it('should render contained variant by default', () => {
      renderWithTheme(<Button>Contained</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-contained');
    });

    it('should render outlined variant', () => {
      renderWithTheme(<Button variant="outlined">Outlined</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-outlined');
    });

    it('should render text variant', () => {
      renderWithTheme(<Button variant="text">Text</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-text');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      renderWithTheme(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-sizeSmall');
    });

    it('should render medium size by default', () => {
      renderWithTheme(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-sizeMedium');
    });

    it('should render large size', () => {
      renderWithTheme(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-sizeLarge');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      renderWithTheme(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when loading prop is true', () => {
      renderWithTheme(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      renderWithTheme(<Button loading>Loading</Button>);
      // CircularProgress renders with role="progressbar"
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      renderWithTheme(<Button onClick={handleClick}>Click Me</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      renderWithTheme(<Button onClick={handleClick} disabled>Disabled</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', () => {
      const handleClick = vi.fn();
      renderWithTheme(<Button onClick={handleClick} loading>Loading</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Full Width', () => {
    it('should render full width when fullWidth is true', () => {
      renderWithTheme(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('MuiButton-fullWidth');
    });
  });

  describe('Type', () => {
    it('should render button type by default', () => {
      renderWithTheme(<Button>Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should render submit type', () => {
      renderWithTheme(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should render reset type', () => {
      renderWithTheme(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });
});
