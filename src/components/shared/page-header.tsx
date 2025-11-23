import { cn } from '@/lib/utils';

function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn('flex flex-col gap-2 pb-8', className)} {...props}>
      {children}
    </section>
  );
}

function PageHeaderTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        'font-headline text-3xl font-bold tracking-tight lg:text-4xl',
        className
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('max-w-2xl text-muted-foreground', className)}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderTitle, PageHeaderDescription };
