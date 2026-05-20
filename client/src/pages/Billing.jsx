import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { useActivateProMutation } from "../redux/slices/api/paymentApiSlice";
import { MdCheckCircle, MdDiamond } from "react-icons/md";
import { toast } from "sonner";

export default function Billing() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activatePro, { isLoading }] = useActivateProMutation();

  const handleUpgrade = async () => {
    try {
      const data = await activatePro().unwrap();
      if (data.isPro) {
        toast.success("Pro амжилттай идэвхжлээ!");
        dispatch(setCredentials({ ...user, isPro: true }));
      }
    } catch (err) {
      toast.error(err?.data?.message || "Алдаа гарлаа");
    }
  };

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
      <div className="bg-slate-900/60 backdrop-blur-2xl p-6 md:p-10 lg:p-14 rounded-[40px] border border-white/5 shadow-2xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Info Side */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full font-bold text-sm mb-6 w-max">
            <MdDiamond /> Үүрд Pro (Lifetime)
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
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

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-stone-900 font-black text-lg transition-all shadow-xl shadow-lime-600/30 flex items-center justify-center gap-2 z-10 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Түр хүлээнэ үү..." : "Одоо идэвхжүүлэх"}
          </button>
        </div>
      </div>
    </div>
  );
}
