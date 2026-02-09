/**
 * RichTextEditor Organism
 *
 * A simple rich text editor with basic formatting options.
 * Uses contentEditable for editing and stores content as HTML.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TitleIcon from '@mui/icons-material/Title';
import Typography from '../../atoms/Typography/Typography';

interface RichTextEditorProps {
  label?: string;
  name: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}

const RichTextEditor = ({
  label,
  name,
  value = '',
  onChange,
  placeholder = 'Escribe aquí...',
  error,
  minHeight = 200,
  maxHeight = 400,
  disabled = false,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Execute formatting command
  const execCommand = useCallback((command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  }, []);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      // Only trigger change if content actually changed
      if (content !== value) {
        onChange(content === '<br>' || content === '<div><br></div>' ? '' : content);
      }
    }
  }, [onChange, value]);

  // Format buttons configuration
  const formatButtons = [
    { command: 'bold', icon: <FormatBoldIcon fontSize="small" />, tooltip: 'Negrita (Ctrl+B)' },
    { command: 'italic', icon: <FormatItalicIcon fontSize="small" />, tooltip: 'Cursiva (Ctrl+I)' },
    { command: 'underline', icon: <FormatUnderlinedIcon fontSize="small" />, tooltip: 'Subrayado (Ctrl+U)' },
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: <FormatListBulletedIcon fontSize="small" />, tooltip: 'Lista con viñetas' },
    { command: 'insertOrderedList', icon: <FormatListNumberedIcon fontSize="small" />, tooltip: 'Lista numerada' },
  ];

  const alignButtons = [
    { value: 'justifyLeft', icon: <FormatAlignLeftIcon fontSize="small" />, tooltip: 'Alinear izquierda' },
    { value: 'justifyCenter', icon: <FormatAlignCenterIcon fontSize="small" />, tooltip: 'Centrar' },
    { value: 'justifyRight', icon: <FormatAlignRightIcon fontSize="small" />, tooltip: 'Alinear derecha' },
  ];

  const handleHeading = () => {
    execCommand('formatBlock', 'h3');
  };

  const handleBlockquote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const handleAlignment = (_event: React.MouseEvent<HTMLElement>, alignment: string | null) => {
    if (alignment) {
      execCommand(alignment);
    }
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            mb: 0.5,
            color: error ? 'error.main' : 'text.primary',
          }}
        >
          {label}
        </Typography>
      )}

      <Paper
        variant="outlined"
        sx={{
          borderColor: error ? 'error.main' : isFocused ? 'primary.main' : 'divider',
          borderWidth: isFocused ? 2 : 1,
          borderRadius: 1,
          overflow: 'hidden',
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            p: 0.5,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'grey.50',
            flexWrap: 'wrap',
          }}
        >
          {/* Text Formatting */}
          {formatButtons.map((btn) => (
            <Tooltip key={btn.command} title={btn.tooltip}>
              <IconButton
                size="small"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCommand(btn.command);
                }}
              >
                {btn.icon}
              </IconButton>
            </Tooltip>
          ))}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Heading & Quote */}
          <Tooltip title="Encabezado">
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault();
                handleHeading();
              }}
            >
              <TitleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cita">
            <IconButton
              size="small"
              onMouseDown={(e) => {
                e.preventDefault();
                handleBlockquote();
              }}
            >
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Lists */}
          {listButtons.map((btn) => (
            <Tooltip key={btn.command} title={btn.tooltip}>
              <IconButton
                size="small"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCommand(btn.command);
                }}
              >
                {btn.icon}
              </IconButton>
            </Tooltip>
          ))}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Alignment */}
          <ToggleButtonGroup
            size="small"
            exclusive
            onChange={handleAlignment}
            sx={{ '& .MuiToggleButton-root': { border: 0, px: 1 } }}
          >
            {alignButtons.map((btn) => (
              <ToggleButton
                key={btn.value}
                value={btn.value}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Tooltip title={btn.tooltip}>
                  {btn.icon}
                </Tooltip>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Editor Area */}
        <Box
          ref={editorRef}
          id={name}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleContentChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          sx={{
            minHeight,
            maxHeight,
            overflow: 'auto',
            p: 2,
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            '&:empty:before': {
              content: 'attr(data-placeholder)',
              color: 'text.disabled',
            },
            '& h3': {
              fontSize: '1.25rem',
              fontWeight: 600,
              mt: 2,
              mb: 1,
            },
            '& blockquote': {
              borderLeft: 4,
              borderColor: 'primary.main',
              pl: 2,
              ml: 0,
              fontStyle: 'italic',
              color: 'text.secondary',
            },
            '& ul, & ol': {
              pl: 3,
              mb: 1,
            },
            '& li': {
              mb: 0.5,
            },
            '& p': {
              mb: 1,
            },
          }}
        />
      </Paper>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default RichTextEditor;
