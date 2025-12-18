import React, { useState, useEffect, useCallback } from 'react';
import { useController, useFormContext, FieldValues, FieldPath } from 'react-hook-form';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import type { RHFRichTextProps } from '../types';
import { useFieldRequired } from '../context/SchemaContext';

// Types for Tiptap editor
interface TiptapEditor {
  getHTML: () => string;
  getText: () => string;
  getJSON: () => object;
  commands: {
    setContent: (content: string) => void;
    toggleBold: () => boolean;
    toggleItalic: () => boolean;
    toggleUnderline: () => boolean;
    toggleStrike: () => boolean;
    toggleHeading: (opts: { level: number }) => boolean;
    toggleBulletList: () => boolean;
    toggleOrderedList: () => boolean;
    toggleBlockquote: () => boolean;
    toggleCode: () => boolean;
    toggleCodeBlock: () => boolean;
    setLink: (opts: { href: string }) => boolean;
    unsetLink: () => boolean;
  };
  isActive: (name: string, attrs?: object) => boolean;
  isDestroyed: boolean;
}

const DEFAULT_TOOLBAR: RHFRichTextProps['toolbar'] = [
  'bold', 'italic', 'underline', 'strike',
  'heading', 'bulletList', 'orderedList',
  'blockquote', 'code', 'link',
];

/**
 * Rich text editor component using Tiptap
 *
 * Requires Tiptap:
 * `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link`
 *
 * @example
 * ```tsx
 * <RHFRichText
 *   name="content"
 *   label="Article Content"
 *   placeholder="Write your article..."
 *   minHeight={200}
 * />
 * ```
 */
export function RHFRichText<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  control: controlProp,
  rules,
  defaultValue,
  shouldUnregister,
  helperText,
  required: requiredProp,
  disabled,
  fullWidth = true,
  label,
  placeholder = 'Start typing...',
  minHeight = 150,
  maxHeight,
  outputFormat = 'html',
  toolbar = DEFAULT_TOOLBAR,
}: RHFRichTextProps<TFieldValues, TName>) {
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [EditorContent, setEditorContent] = useState<React.ComponentType<{ editor: TiptapEditor | null }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const formContext = useFormContext<TFieldValues>();
  const control = controlProp ?? formContext?.control;

  const schemaRequired = useFieldRequired(name);
  const required = requiredProp ?? schemaRequired;

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  // Load Tiptap modules dynamically
  useEffect(() => {
    let mounted = true;

    const loadTiptap = async () => {
      try {
        const tiptapReactModule = await import('@tiptap/react');
        const starterKitModule = await import('@tiptap/starter-kit');

        const tiptapReact = tiptapReactModule;
        const starterKit = starterKitModule;

        // Try to load optional extensions
        let underlineExt = null;
        let linkExt = null;

        try {
          const underlineModule = await import('@tiptap/extension-underline');
          underlineExt = underlineModule.default;
        } catch {
          // Underline extension not installed
        }

        try {
          const linkModule = await import('@tiptap/extension-link');
          linkExt = linkModule.default;
        } catch {
          // Link extension not installed
        }

        if (!mounted) return;

        // Build extensions array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extensions: any[] = [
          starterKit.default.configure({
            heading: { levels: [1, 2, 3] },
          }),
        ];

        if (underlineExt) extensions.push(underlineExt);
        if (linkExt) {
          extensions.push(
            linkExt.configure({
              openOnClick: false,
              HTMLAttributes: { class: 'text-link' },
            })
          );
        }

        // Create editor instance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const editorInstance = new tiptapReact.Editor({
          extensions,
          content: value ?? '',
          editable: !disabled,
          onUpdate: ({ editor: e }: { editor: any }) => {
            let newValue: string | object;
            switch (outputFormat) {
              case 'json':
                newValue = e.getJSON();
                break;
              case 'text':
                newValue = e.getText();
                break;
              case 'html':
              default:
                newValue = e.getHTML();
            }
            onChange(newValue as TFieldValues[TName]);
          },
          onBlur: () => onBlur(),
          editorProps: {
            attributes: {
              class: 'rhf-rich-text-editor',
              'data-placeholder': placeholder,
            },
          },
        });

        if (mounted) {
          setEditor(editorInstance as TiptapEditor);
          setEditorContent(() => tiptapReact.EditorContent as React.ComponentType<{ editor: TiptapEditor | null }>);
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };

    loadTiptap();

    return () => {
      mounted = false;
    };
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  // Update editor content when external value changes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const currentContent = outputFormat === 'html' ? editor.getHTML() :
                          outputFormat === 'text' ? editor.getText() :
                          JSON.stringify(editor.getJSON());
    const newContent = typeof value === 'string' ? value : JSON.stringify(value);

    if (currentContent !== newContent && typeof value === 'string') {
      editor.commands.setContent(value);
    }
  }, [editor, value, outputFormat]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      // Editor cleanup is handled by Tiptap internally
    };
  }, []);

  const handleLinkClick = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter URL:', '');

    if (url === null) return;

    if (url === '') {
      editor.commands.unsetLink();
    } else {
      editor.commands.setLink({ href: url });
    }
  }, [editor]);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <FormLabel required={required} error={!!error} sx={{ display: 'block', mb: 0.5 }}>
            {label}
          </FormLabel>
        )}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            minHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={24} />
        </Paper>
      </Box>
    );
  }

  // Error state - Tiptap not installed
  if (loadError || !EditorContent) {
    return (
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <FormLabel required={required} error={!!error} sx={{ display: 'block', mb: 0.5 }}>
            {label}
          </FormLabel>
        )}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            minHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
          }}
        >
          <FormHelperText error>
            Tiptap is required for rich text editing. Install with:
            <br />
            <code>npm install @tiptap/react @tiptap/starter-kit</code>
          </FormHelperText>
        </Paper>
      </Box>
    );
  }

  const toolbarButtons = [
    { name: 'bold', icon: <FormatBoldIcon fontSize="small" />, action: () => editor?.commands.toggleBold(), tooltip: 'Bold' },
    { name: 'italic', icon: <FormatItalicIcon fontSize="small" />, action: () => editor?.commands.toggleItalic(), tooltip: 'Italic' },
    { name: 'underline', icon: <FormatUnderlinedIcon fontSize="small" />, action: () => editor?.commands.toggleUnderline(), tooltip: 'Underline' },
    { name: 'strike', icon: <StrikethroughSIcon fontSize="small" />, action: () => editor?.commands.toggleStrike(), tooltip: 'Strikethrough' },
    { name: 'heading', icon: <TitleIcon fontSize="small" />, action: () => editor?.commands.toggleHeading({ level: 2 }), tooltip: 'Heading' },
    { name: 'bulletList', icon: <FormatListBulletedIcon fontSize="small" />, action: () => editor?.commands.toggleBulletList(), tooltip: 'Bullet List' },
    { name: 'orderedList', icon: <FormatListNumberedIcon fontSize="small" />, action: () => editor?.commands.toggleOrderedList(), tooltip: 'Numbered List' },
    { name: 'blockquote', icon: <FormatQuoteIcon fontSize="small" />, action: () => editor?.commands.toggleBlockquote(), tooltip: 'Quote' },
    { name: 'code', icon: <CodeIcon fontSize="small" />, action: () => editor?.commands.toggleCode(), tooltip: 'Code' },
    { name: 'codeBlock', icon: <CodeIcon fontSize="small" />, action: () => editor?.commands.toggleCodeBlock(), tooltip: 'Code Block' },
    { name: 'link', icon: <LinkIcon fontSize="small" />, action: handleLinkClick, tooltip: 'Link' },
  ];

  const visibleButtons = toolbarButtons.filter((btn) => toolbar?.includes(btn.name as typeof toolbar[number]));

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <FormLabel required={required} error={!!error} sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </FormLabel>
      )}

      <Paper
        variant="outlined"
        sx={{
          borderColor: error ? 'error.main' : 'divider',
          overflow: 'hidden',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.5,
            p: 0.5,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'grey.50',
          }}
        >
          <ToggleButtonGroup size="small" sx={{ flexWrap: 'wrap' }}>
            {visibleButtons.flatMap((btn, index) => {
              const elements: React.ReactNode[] = [];
              if (index > 0 && ['heading', 'bulletList', 'blockquote', 'link'].includes(btn.name)) {
                elements.push(
                  <Divider key={`divider-${btn.name}`} flexItem orientation="vertical" sx={{ mx: 0.5 }} />
                );
              }
              elements.push(
                <Tooltip key={btn.name} title={btn.tooltip}>
                  <ToggleButton
                    value={btn.name}
                    selected={editor?.isActive(btn.name) ?? false}
                    onClick={btn.action}
                    disabled={disabled}
                    sx={{ border: 'none' }}
                  >
                    {btn.icon}
                  </ToggleButton>
                </Tooltip>
              );
              return elements;
            })}
          </ToggleButtonGroup>
        </Box>

        {/* Editor Content */}
        <Box
          sx={{
            minHeight,
            maxHeight,
            overflow: maxHeight ? 'auto' : 'visible',
            p: 2,
            '& .rhf-rich-text-editor': {
              outline: 'none',
              minHeight: `calc(${typeof minHeight === 'number' ? minHeight + 'px' : minHeight} - 32px)`,
              '& p': { margin: 0, marginBottom: 1 },
              '& h1, & h2, & h3': { marginTop: 2, marginBottom: 1 },
              '& ul, & ol': { paddingLeft: 3 },
              '& blockquote': {
                borderLeft: 4,
                borderColor: 'grey.300',
                margin: 0,
                paddingLeft: 2,
                fontStyle: 'italic',
                color: 'text.secondary',
              },
              '& code': {
                backgroundColor: 'grey.100',
                borderRadius: 0.5,
                padding: '2px 4px',
                fontFamily: 'monospace',
              },
              '& pre': {
                backgroundColor: 'grey.900',
                color: 'common.white',
                borderRadius: 1,
                padding: 2,
                overflow: 'auto',
                '& code': { backgroundColor: 'transparent', padding: 0 },
              },
              '& a': { color: 'primary.main', textDecoration: 'underline' },
              '&:empty::before': {
                content: 'attr(data-placeholder)',
                color: 'text.disabled',
                pointerEvents: 'none',
                position: 'absolute',
              },
            },
            '& .ProseMirror': { outline: 'none' },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>

      {(error?.message || helperText) && (
        <FormHelperText error={!!error} sx={{ mt: 0.5 }}>
          {error?.message ?? helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
