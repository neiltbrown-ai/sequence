interface AuthInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}

export default function AuthInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
  autoComplete,
}: AuthInputProps) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`auth-input${error ? " error" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
      {error && (
        <div className="auth-error" style={{ display: "block" }}>
          {error}
        </div>
      )}
    </div>
  );
}
