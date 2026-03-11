export default function MentionDropdown({ results, activeIndex, onSelect, colorFor }) {
  return (
    <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100">
        Mention a participant
      </div>
      <ul className="max-h-40 overflow-y-auto py-1">
        {results.map((user, idx) => (
          <li
            key={user.id}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(user);
            }}
            className={`
              flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors
              ${idx === activeIndex ? "bg-cflow-50" : "hover:bg-gray-50"}
            `}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white uppercase shrink-0"
              style={{ backgroundColor: colorFor(user.name) }}
            >
              {user.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
