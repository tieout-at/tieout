import { PageHeader, type Crumb } from "./page-header";

/**
 * A page: header with its title, below it the scrolling content. `heading` makes the header title the page's h1;
 * pages that carry their own h1 (Start, record pages) switch it off. `title` replaces the sidebar entry's name.
 */
export function Page({
  destination,
  title,
  trail,
  heading = true,
  children,
}: {
  destination?: string;
  title?: string;
  trail?: Crumb[];
  heading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader destination={destination} title={title} trail={trail} heading={heading} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-[var(--side-window,0px)] transition-[padding] duration-300 ease-soft motion-reduce:transition-none print:overflow-visible print:pr-0" data-scroll-area>
        {children}
      </div>
    </>
  );
}
