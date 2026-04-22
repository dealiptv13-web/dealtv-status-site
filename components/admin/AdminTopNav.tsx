export default function AdminTopNav() {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <a
        href="/admin"
        className="rounded-2xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
      >
        Admin Ana Sayfa
      </a>

      <a
        href="/admin/panels"
        className="rounded-2xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
      >
        Panel Yönetimi
      </a>

      <a
        href="/admin/reports"
        className="rounded-2xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
      >
        Test Kayıtları
      </a>

      <a
        href="/admin/knowledge"
        className="rounded-2xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
      >
        AI Bilgi Kartları
      </a>

      <a
        href="/admin/notice"
        className="rounded-2xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
      >
        Açılış Bildirimi
      </a>

      <form action="/api/admin/logout" method="post">
        <button
          type="submit"
          className="rounded-2xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
        >
          Çıkış Yap
        </button>
      </form>
    </div>
  );
}