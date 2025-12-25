'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FormInput({
  label,
  id,
  error,
  required,
  ...props
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input id={id} {...props} />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}