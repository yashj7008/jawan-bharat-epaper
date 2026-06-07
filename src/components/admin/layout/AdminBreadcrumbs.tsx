import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LABELS: Record<string, string> = {
  admin: 'Admin',
  newspapers: 'Newspapers',
  new: 'Create',
  edit: 'Edit',
};

export function AdminBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return (
      <nav aria-label="Breadcrumb">
        <span className="text-sm font-medium">Newspapers</span>
      </nav>
    );
  }

  const crumbs: { label: string; path: string }[] = [];
  let path = '';

  segments.forEach((segment, index) => {
    path += `/${segment}`;
    const isId = /^[0-9a-f-]{36}$/i.test(segment) || segment.length > 20;

    if (isId) {
      crumbs.push({ label: 'Edition', path });
    } else {
      crumbs.push({
        label: LABELS[segment] ?? segment,
        path,
      });
    }

    if (index === segments.length - 1 && segment === 'edit') {
      // already added
    }
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          )}
          {i < crumbs.length - 1 ? (
            <Link
              to={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
