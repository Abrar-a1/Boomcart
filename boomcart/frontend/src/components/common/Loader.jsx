export default function Loader({ size = 44 }) {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div
        className="border-3 border-[#E5D9C5] border-t-[#1E3A3A] rounded-full animate-spin"
        style={{ width: size, height: size, borderWidth: 3 }}
      />
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const buildPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const addPage = (p) => { if (!pages.includes(p) && p >= 1 && p <= totalPages) pages.push(p); };
    [1, currentPage - 1, currentPage, currentPage + 1, totalPages].forEach(addPage);
    pages.sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) result.push('…');
      result.push(pages[i]);
    }
    return result;
  };

  return (
    <div className="flex justify-center items-center gap-1.5 mt-10 flex-wrap">
      <button
        className="px-3 py-2 text-sm font-semibold text-[#1E3A3A] border-2 border-[#1E3A3A] rounded-lg hover:bg-[#1E3A3A] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Prev
      </button>

      {buildPages().map((p, i) => (
        p === '…'
          ? <span key={`ellipsis-${i}`} className="w-9 text-center text-[#9eaa9f] text-sm">…</span>
          : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium border-2 transition-colors ${
                p === currentPage
                  ? 'bg-[#1E3A3A] text-white border-[#1E3A3A]'
                  : 'bg-white text-[#2C3E2F] border-[#E5D9C5] hover:border-[#1E3A3A] hover:text-[#1E3A3A]'
              }`}
            >
              {p}
            </button>
          )
      ))}

      <button
        className="px-3 py-2 text-sm font-semibold text-[#1E3A3A] border-2 border-[#1E3A3A] rounded-lg hover:bg-[#1E3A3A] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>
    </div>
  );
}
