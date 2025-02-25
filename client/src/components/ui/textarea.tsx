import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  debounceMs?: number;
}

const Textarea = React.memo(React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, debounceMs = 150, ...props }, ref) => { // Increased default debounce
    const [value, setValue] = React.useState(props.value || '');
    const timeoutRef = React.useRef<NodeJS.Timeout>();
    const previousValueRef = React.useRef(value);

    // Memoize the setValue function
    const setValueOptimized = React.useCallback((newValue: string) => {
      if (newValue !== previousValueRef.current) {
        setValue(newValue);
        previousValueRef.current = newValue;
      }
    }, []);

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        setValueOptimized(newValue);

        if (onChange) {
          if (debounceMs > 0) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
              if (newValue !== previousValueRef.current) {
                onChange(event);
              }
            }, debounceMs);
          } else {
            onChange(event);
          }
        }
      },
      [onChange, debounceMs, setValueOptimized]
    );

    // Cleanup effect
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    // Update internal value when prop changes
    React.useEffect(() => {
      if (props.value !== undefined && props.value !== previousValueRef.current) {
        setValueOptimized(props.value as string);
      }
    }, [props.value, setValueOptimized]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={value}
        onChange={handleChange}
        {...props}
      />
    )
  }
))

Textarea.displayName = "Textarea"

export { Textarea }