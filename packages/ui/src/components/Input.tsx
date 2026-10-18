import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
}

export function Input({
  error,
  helperText,
  className = '',
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="nx-input-wrapper">
      <input
        className={`nx-input ${error ? 'nx-input--error' : ''} ${className}`.trim()}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && <span className="nx-input__error-msg">{error}</span>}
      {!error && helperText && <span className="nx-input__helper-msg">{helperText}</span>}
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
}

export function Textarea({
  error,
  helperText,
  className = '',
  disabled,
  ...props
}: TextareaProps) {
  return (
    <div className="nx-input-wrapper">
      <textarea
        className={`nx-textarea ${error ? 'nx-input--error' : ''} ${className}`.trim()}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && <span className="nx-input__error-msg">{error}</span>}
      {!error && helperText && <span className="nx-input__helper-msg">{helperText}</span>}
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  children: ReactNode;
}

export function Select({
  error,
  children,
  className = '',
  disabled,
  ...props
}: SelectProps) {
  return (
    <div className="nx-input-wrapper">
      <select
        className={`nx-select ${error ? 'nx-input--error' : ''} ${className}`.trim()}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {error && <span className="nx-input__error-msg">{error}</span>}
    </div>
  );
}

export interface FormFieldProps {
  label: string;
  id?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  id,
  required,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`nx-form-field ${className}`.trim()}>
      <label htmlFor={id} className="nx-form-field__label">
        {label}
        {required && <span className="nx-form-field__required">*</span>}
      </label>
      {children}
    </div>
  );
}
