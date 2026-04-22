import AdminTopNav from "@/components/admin/AdminTopNav";

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-[#edf0ee] text-slate-800">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <a href="/" className="text-sm text-slate-500 transition hover:text-slate-800">
            ← Ana sayfaya dön
          </a>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
            Admin Panel
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-500 md:text-base">
            Yönetim alanlarına buradan hızlıca geçebilirsiniz.
          </p>
        </div>

        <AdminTopNav />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <a
            href="/admin/panels"
            className="rounded-3xl border border-[#dfe5e1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:bg-[#f8faf9]"
          >
            <h2 className="text-lg font-semibold text-slate-800">Panel Yönetimi</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Titan, 5G ve MPremium durumlarını değiştirin.
            </p>
          </a>

          <a
            href="/admin/reports"
            className="rounded-3xl border border-[#dfe5e1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:bg-[#f8faf9]"
          >
            <h2 className="text-lg font-semibold text-slate-800">Test Kayıtları</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Son 24 saat içindeki hız testi gönderimlerini görüntüleyin.
            </p>
          </a>

          <a
            href="/admin/knowledge"
            className="rounded-3xl border border-[#dfe5e1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:bg-[#f8faf9]"
          >
            <h2 className="text-lg font-semibold text-slate-800">AI Bilgi Kartları</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              AI destekte kullanılan bilgi kartlarını yönetin.
            </p>
          </a>

          <a
            href="/admin/notice"
            className="rounded-3xl border border-[#dfe5e1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:bg-[#f8faf9]"
          >
            <h2 className="text-lg font-semibold text-slate-800">Açılış Bildirimi</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Kullanıcıya gösterilen karşılama mesajını yönetin.
            </p>
          </a>

          <form
            action="/api/admin/logout"
            method="post"
            className="rounded-3xl border border-[#dfe5e1] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <h2 className="text-lg font-semibold text-slate-800">Çıkış Yap</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Admin oturumunu güvenli şekilde sonlandırın.
            </p>
            <button
              type="submit"
              className="mt-4 rounded-2xl border border-[#dfe5e1] bg-[#fbfcfc] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}