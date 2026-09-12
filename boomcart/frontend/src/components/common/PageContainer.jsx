export default function PageContainer({ children, variant = 'default', className = '' }) {
  // Base padding provides controlled, fluid breathing room
  const basePadding = "w-full mx-auto px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24";
  
  // Define max-width constraints based on layout role
  let maxWidthClass = "";
  switch (variant) {
    case 'narrow':
      // Narrow functional focus (e.g. Auth, Order Tracking)
      maxWidthClass = "max-w-[800px]";
      break;
    case 'functional':
      // Functional commerce (e.g. Profile, Cart, Checkout)
      maxWidthClass = "max-w-[1200px]";
      break;
    case 'default':
    default:
      // Standard storefront (Catalogs, Product, Navbar, Footer)
      // Caps at 1600px to prevent infinite stretching on ultra-wide monitors
      maxWidthClass = "max-w-[1600px]";
      break;
  }

  return (
    <div className={`${basePadding} ${maxWidthClass} ${className}`}>
      {children}
    </div>
  );
}
