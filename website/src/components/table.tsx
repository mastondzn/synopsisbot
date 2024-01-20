import * as React from 'react';

import { cn } from '~/utils/tailwind';

/* eslint-disable react/prop-types */

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, reference) => (
        <div className="w-full overflow-auto">
            <table
                ref={reference}
                className={cn('w-full caption-bottom text-sm', className)}
                {...props}
            />
        </div>
    ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, reference) => (
    <thead ref={reference} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, reference) => (
    <tbody ref={reference} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, reference) => (
    <tfoot
        ref={reference}
        className={cn('bg-primary font-medium text-primary-foreground', className)}
        {...props}
    />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, reference) => (
        <tr
            ref={reference}
            className={cn(
                'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                className,
            )}
            {...props}
        />
    ),
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, reference) => (
    <th
        ref={reference}
        className={cn(
            'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
            className,
        )}
        {...props}
    />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, reference) => (
    <td
        ref={reference}
        className={cn('align-middle [&:has([role=checkbox])]:pr-0', className)}
        {...props}
    />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, reference) => (
    <caption ref={reference} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
