import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { useActivateProMutation } from "../redux/slices/api/paymentApiSlice";
import { MdCheckCircle, MdDiamond, MdQrCode2, MdArrowBack } from "react-icons/md";
import { toast } from "sonner";

export default function Billing() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activatePro, { isLoading }] = useActivateProMutation();
  const [showQR, setShowQR] = useState(false);

  const handleActivate = async () => {
    try {
      const data = await activatePro().unwrap();
      if (data.isPro) {
        toast.success("Pro амжилттай идэвхжлээ!");
        dispatch(setCredentials({ ...user, isPro: true }));
        setShowQR(false);
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
          <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full font-bold text-sm mb-6 w-max">
            <MdDiamond /> Үүрд Pro (Lifetime)
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            Бүтээмжээ дараагийн <br /> түвшинд гаргаарай
          </h1>
          <ul className="space-y-4 mb-10">
            {[
              "Хязгааргүй Vision Board элементүүд",
              "AI туслахтай хязгааргүй харилцах",
              "Нэмэлт тусгай Theme-үүд",
              "Ирээдүйд нэмэгдэх бүх шинэ функцүүд"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-4 text-slate-300 text-lg">
                <MdCheckCircle className="text-white text-xl" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Side */}
        <div className="bg-black/40 rounded-[32px] p-8 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />

          {!showQR ? (
            <>
              <h3 className="text-2xl font-black text-white mb-2 z-10">Нэг удаагийн төлбөр</h3>
              <div className="text-5xl font-black text-white mb-8 z-10">
                15,000₮
              </div>
              <button
                onClick={() => setShowQR(true)}
                className="w-full py-4 rounded-2xl bg-white hover:bg-gray-100 text-black font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 z-10 active:scale-95"
              >
                Одоо идэвхжүүлэх
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center w-full z-10">
              <button
                onClick={() => setShowQR(false)}
                className="self-start mb-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm transition-colors"
              >
                <MdArrowBack size={18} /> Буцах
              </button>

              <div className="bg-white p-5 rounded-3xl shadow-2xl mb-5">
                <svg viewBox="0 0 200 200" width="180" height="180">
                  {/* QR-like pattern */}
                  <rect width="200" height="200" fill="white"/>
                  {/* Corner squares */}
                  <rect x="10" y="10" width="50" height="50" fill="black" rx="4"/>
                  <rect x="16" y="16" width="38" height="38" fill="white" rx="2"/>
                  <rect x="22" y="22" width="26" height="26" fill="black" rx="2"/>

                  <rect x="140" y="10" width="50" height="50" fill="black" rx="4"/>
                  <rect x="146" y="16" width="38" height="38" fill="white" rx="2"/>
                  <rect x="152" y="22" width="26" height="26" fill="black" rx="2"/>

                  <rect x="10" y="140" width="50" height="50" fill="black" rx="4"/>
                  <rect x="16" y="146" width="38" height="38" fill="white" rx="2"/>
                  <rect x="22" y="152" width="26" height="26" fill="black" rx="2"/>

                  {/* Data pattern */}
                  {[70,80,90,100,110,120].map(x =>
                    [10,20,30,40,50,70,80,90,100,110,120,140,150,160,170,180].map(y => (
                      (x * y * 7 + x * 3 + y * 11) % 3 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="black" rx="1"/> : null
                    ))
                  )}
                  {[10,20,30,40,50,160,170,180].map(x =>
                    [70,80,90,100,110,120].map(y => (
                      (x * y * 13 + x * 7 + y * 3) % 3 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="black" rx="1"/> : null
                    ))
                  )}
                  {[140,150,160,170,180].map(x =>
                    [140,150,160,170,180].map(y => (
                      (x * y * 11 + x * 5) % 4 !== 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="black" rx="1"/> : null
                    ))
                  )}
                  {/* Center logo area */}
                  <rect x="75" y="75" width="50" height="50" fill="white" rx="8"/>
                  <rect x="80" y="80" width="40" height="40" fill="black" rx="6"/>
                  <text x="100" y="106" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">Q</text>
                </svg>
              </div>

              <p className="text-white font-bold text-sm mb-1">QPay-ээр төлбөрөө хийнэ үү</p>
              <p className="text-slate-500 text-xs mb-6 text-center">
                Банкны апп-аар QR кодыг уншуулна уу
              </p>

              <button
                onClick={handleActivate}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-white hover:bg-gray-100 text-black font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Шалгаж байна..." : "Төлбөр шалгах"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
