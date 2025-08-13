import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
};

function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h2>Page not found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}

export default NotFoundPage;
