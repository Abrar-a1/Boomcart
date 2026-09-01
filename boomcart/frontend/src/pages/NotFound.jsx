import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign:'center', paddingTop:80 }}>
      <Helmet><title>404 — Page Not Found | Boomcart</title></Helmet>
      <p style={{ fontSize:100, lineHeight:1, marginBottom:16 }}>404</p>
      <h2 style={{ fontFamily:'var(--font-serif)', fontSize:32, color:'var(--navy)', marginBottom:12 }}>Page Not Found</h2>
      <p style={{ color:'var(--gray-400)', fontSize:16, marginBottom:32 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
    </div>
  );
}
