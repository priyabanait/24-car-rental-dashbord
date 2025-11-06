import { cn } from '../../utils';

export function Table({ children, className, ...props }) {
  // wrapper allows horizontal scrolling when table is wider than its container
  return (
    <div className="w-full overflow-x-auto"> 
      <table className={cn('min-w-full table-auto', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead className={cn('table-header', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn('divide-y divide-gray-200', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr className={cn('table-row', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider table-header-cell', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap align-top table-cell', className)} {...props}>
      {children}
    </td>
  );
}