import { tw } from '~/utils/tw';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={tw('animate-pulse rounded-md bg-muted', className)} {...props} />;
}
