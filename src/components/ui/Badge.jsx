import { cn } from '../../utils';

export function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'badge badge-info',
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    danger: 'badge badge-danger',
    info: 'badge badge-info'
  };

  return (
    <span className={cn(variants[variant], className)} {...props}>
      {children}
    </span>
  );
}