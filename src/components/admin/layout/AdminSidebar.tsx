import { NavLink } from 'react-router-dom';
import { Newspaper, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    to: '/admin',
    label: 'Newspapers',
    icon: Newspaper,
    end: true,
  },
];

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-card shrink-0">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-foreground">Jawan Bharat</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Admin Portal</p>
      </div>

      <nav className="flex-1 p-3 space-y-1" aria-label="Admin navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          View Reader
        </a>
      </div>
    </aside>
  );
}
