import React from 'react';

// Define props type
export interface RichTextEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * A placeholder implementation of a rich text editor component
 * This will be implemented with proper functionality in a future update
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = '',
  onChange,
  placeholder = 'Start typing...',
  readOnly = false
}) => {
  const [value, setValue] = React.useState(initialValue);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="rich-text-editor-container">
      <textarea
        className="rich-text-editor-textarea"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          resize: 'vertical',
        }}
      />
      <div className="placeholder-message" style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Full rich text editor coming soon...
      </div>
    </div>
  );
};

export default RichTextEditor; 