export function StatsBar() {
  const stats = [
    { value: "235+", label: "API Endpoints" },
    { value: "7",    label: "Travel Products" },
    { value: "4",    label: "User Roles" },
    { value: "∞",    label: "Tenants Supported" },
  ];
  
  return (
    <section className="px-6 relative">
      <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100 text-center">
          {stats.map((s, i) => (
            <div key={s.label} className={i === 0 ? "" : "pl-8"}>
              <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{s.value}</p>
              <p className="mt-2 text-sm text-slate-500 font-medium tracking-wide uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}