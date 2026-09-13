import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageContainer from '../components/common/PageContainer';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-[var(--color-background)] flex items-center justify-center py-20">
      <Helmet><title>404 Not Found — Boomcart</title></Helmet>
      <PageContainer variant="functional" className="text-center flex flex-col items-center">
        <h1 className="font-heading text-8xl font-bold text-[var(--color-primary)] mb-4">404</h1>
        <h2 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-4">Page Not Found</h2>
        <p className="font-body text-sm text-[var(--color-text-muted)] mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" className="font-bold uppercase tracking-widest px-10 py-4">
            Return Home
          </Button>
        </Link>
      </PageContainer>
    </div>
  );
}
