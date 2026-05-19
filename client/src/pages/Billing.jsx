import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { MdCheckCircle, MdDiamond, MdQrCode } from "react-icons/md";
import toast from "react-hot-toast";

export default function Billing() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments/qpay/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 15000, description: "Pro Subscription - Lifetime" })
      });
      const data = await res.json();
      if (data.status) {
        setInvoice(data.payment);
        toast.success("Нэхэмжлэл амжилттай үүслээ");
      } else {
        toast.error(data.message || "Нэхэмжлэл үүсгэхэд алдаа гарлаа");
      }
    } catch (err) {
      toast.error("Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  };

  const handleMockPay = async () => {
    if (!invoice) return;
    try {
      setChecking(true);
      const res = await fetch(`/api/payments/qpay/mock-pay/${invoice.id}`, { method: "POST" });
      const data = await res.json();
      if (data.status && data.paid) {
        toast.success("Төлбөр амжилттай төлөгдлөө!");
        // Update user in Redux
        dispatch(setCredentials({ ...user, isPro: true }));
        setInvoice(null);
      } else {
        toast.error("Төлбөр баталгаажсангүй");
      }
    } catch (err) {
      toast.error("Сүлжээний алдаа");
    } finally {
      setChecking(false);
    }
  };

  // Poll for payment status (optional, real QPay integration would need this)
  useEffect(() => {
    let interval;
    if (invoice && !user.isPro) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/payments/qpay/check/${invoice.id}`, { method: "POST" });
          const data = await res.json();
          if (data.status && data.paid) {
            toast.success("Төлбөр амжилттай төлөгдлөө!");
            dispatch(setCredentials({ ...user, isPro: true }));
            setInvoice(null);
          }
        } catch (e) {
          console.error(e);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval);
  }, [invoice, user.isPro, dispatch]);

  if (user?.isPro) {
    return (
      <div className="h-full w-full flex items-center justify-center animate-in fade-in">
        <div className="bg-slate-900/40 backdrop-blur-3xl p-12 rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center max-w-lg text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(245,158,11,0.4)]">
            <MdDiamond size={48} className="text-white drop-shadow-lg" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">Pro Хэрэглэгч</h2>
          <p className="text-slate-300 text-lg">Та манай апп-ийн бүх premium боломжуудыг нээсэн байна. Танд баярлалаа!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center animate-in fade-in p-6">
      <div className="bg-slate-900/60 backdrop-blur-2xl p-10 md:p-14 rounded-[40px] border border-white/5 shadow-2xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Info Side */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full font-bold text-sm mb-6 w-max">
            <MdDiamond /> Үүрд Pro (Lifetime)
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Бүтээмжээ дараагийн <br /> түвшинд гаргаарай
          </h1>
          <ul className="space-y-4 mb-10">
            {[
              "Хязгааргүй Vision Board элементүүд",
              "AI туслахтай хязгааргүй харилцах",
              "Earthy Zen болон бусад тусгай Theme-үүд",
              "Ирээдүйд нэмэгдэх бүх шинэ функцүүд"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-4 text-slate-300 text-lg">
                <MdCheckCircle className="text-lime-400 text-xl" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Side */}
        <div className="bg-black/40 rounded-[32px] p-8 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]" />
          
          <h3 className="text-2xl font-black text-white mb-2 z-10">Нэг удаагийн төлбөр</h3>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400 mb-8 z-10">
            15,000₮
          </div>

          {!invoice ? (
            <button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 z-10 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Түр хүлээнэ үү..." : "Одоо идэвхжүүлэх"}
            </button>
          ) : (
            <div className="flex flex-col items-center w-full z-10 animate-in slide-in-from-bottom-4">
              <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6">
                {invoice.qrImage ? (
                  <img src={`data:image/png;base64,${invoice.qrImage}`} alt="QPay QR" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-400 flex-col gap-2">
                    <MdQrCode size={48} />
                    <span>QR Code</span>
                  </div>
                )}
              </div>
              <p className="text-slate-300 text-sm mb-6 text-center">
                Банкны апп эсвэл QPay-ээр уншуулж төлбөрөө хийнэ үү
              </p>

              {/* MOCK PAY BUTTON */}
              <button 
                onClick={handleMockPay}
                disabled={checking}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-lg transition-all shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {checking ? "Шалгаж байна..." : "Mock Pay (Төлсөн болгох)"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
