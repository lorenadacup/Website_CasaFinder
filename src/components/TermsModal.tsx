import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollText, CheckCircle2 } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsModal({ isOpen, onAccept, onDecline }: TermsModalProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) setScrolledToBottom(true);
  };

  if (!isOpen) return null;

  const sections = [
    {
      num: "1", title: "Pagtanggap ng mga Tuntunin",
      content: "Sa paggamit ng CasaFinder website, awtomatikong sumasang-ayon ang bawat user sa lahat ng nakasaad na tuntunin at kundisyon. Kung hindi kayo sumasang-ayon sa anumang bahagi ng mga tuntuning ito, hinihiling naming huwag gamitin ang website.",
    },
    {
      num: "2", title: "Mga Responsibilidad ng User",
      content: "Responsibilidad ng bawat user na magbigay ng tama, kumpleto, at totoong impormasyon sa lahat ng oras. Ipinagbabawal ang paggamit ng website para sa anumang ilegal na gawain. Kailangang sundin ng lahat ng users ang mga patakaran at alituntunin ng CasaFinder.",
    },
    {
      num: "3", title: "Pagpaparehistro ng Account",
      content: "Pananagutan ng bawat user ang seguridad ng kanilang sariling account. Dapat panatilihing kumpidensyal ang password at hindi ito ibabahagi sa iba. Kapag naganap ang anumang hindi awtorisadong pag-access sa account, dapat itong ipaalam agad sa administrator.",
    },
    {
      num: "4", title: "Patakaran sa Privacy",
      content: "Kinokolekta ng CasaFinder ang personal na impormasyon tulad ng pangalan, email, at numero ng telepono para sa layunin ng pagpapatakbo ng serbisyo. Ang mga impormasyong ito ay iniimbak nang ligtas at hindi ibinabahagi sa mga third party nang walang pahintulot ng user. May karapatang makuha, itama, o burahin ng user ang kanilang personal na impormasyon sa pamamagitan ng pakikipag-ugnayan sa admin.",
    },
    {
      num: "5", title: "Karapatan sa Intelektwal na Pag-aari",
      content: "Ang lahat ng nilalaman, larawan, logo, disenyo, at iba pang materyales ng CasaFinder ay pag-aari ng mga tagalikha nito. Ipinagbabawal ang pagkopya, paggamit, o pamamahagi ng anumang bahagi ng website nang walang malinaw na pahintulot mula sa mga may-ari.",
    },
    {
      num: "6", title: "Mga Ipinagbabawalang Gawain",
      content: "Mahigpit na ipinagbabawal ang: (a) pag-hack o pagtatangkang sirain ang website; (b) pag-upload ng mapanganib na file o virus; (c) pagbibigay ng maling impormasyon; (d) paggamit ng website para sa panloloko o ilegal na aktibidad; at (e) anumang gawain na makakasama sa ibang users o sa website.",
    },
    {
      num: "7", title: "Limitasyon ng Pananagutan",
      content: "Hindi mananagot ang CasaFinder o ang mga tagapangasiwa nito sa anumang direkta o hindi direktang pinsala na maaaring manggaling sa paggamit ng website. Ang bawat listing ay responsibilidad ng landlord na nag-post nito. Inirerekomenda ang personal na pag-inspect ng property bago gumawa ng anumang desisyon.",
    },
    {
      num: "8", title: "Availability ng Website",
      content: "Maaaring magkaroon ng pansamantalang pagpapatigil ng serbisyo para sa maintenance o mga teknikal na update. Hindi ginagarantiyang laging available ang website sa lahat ng oras. Maaaring magdagdag o mag-alis ng mga feature nang walang paunang abiso.",
    },
    {
      num: "9", title: "Pagtatapos ng Paggamit",
      content: "May karapatang ang administrator ng CasaFinder na limitahan o wakasan ang access ng sinumang user na lumalabag sa mga tuntunin at kundisyong ito. Maaaring gawin ito nang walang paunang babala sa mga malubhang paglabag.",
    },
    {
      num: "10", title: "Mga Pagbabago sa Tuntunin",
      content: "Maaaring baguhin o i-update ang mga tuntunin at kundisyong ito sa anumang oras. Ang patuloy na paggamit ng website pagkatapos ng mga pagbabago ay itinuturing na pagtanggap ng mga bagong tuntunin. Ang petsa ng pinakabagong update ay makikita sa tuktok ng dokumentong ito.",
    },
    {
      num: "11", title: "Namamahalang Batas",
      content: "Ang mga tuntunin at kundisyong ito ay pinamamahalaan ng mga batas ng Republika ng Pilipinas. Anumang legal na alitan na magmumula sa paggamit ng CasaFinder ay dariing malutas sa ilalim ng naaangkop na batas ng Pilipinas at sa hurisdiksyon ng Quezon Province.",
    },
    {
      num: "12", title: "Impormasyon sa Pakikipag-ugnayan",
      content: "Para sa mga katanungan o alalahanin, maaaring makipag-ugnayan sa amin:\n\n📧 Email: admin.housing@gumaca.gov.ph\n📱 Telepono: (042) 311-9999\n📍 Address: Municipal Hall, Brgy. San Diego, Gumaca, Quezon",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-stone-200 dark:border-stone-800"
          style={{ maxHeight: "90dvh" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 px-4 py-3.5 flex items-center gap-3 shrink-0 rounded-t-2xl">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl shrink-0">
              <ScrollText className="h-4 w-4 text-indigo-300" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Mga Tuntunin at Kundisyon</h2>
              <p className="text-[10px] text-stone-400">Terms and Conditions — CasaFinder Gumaca</p>
            </div>
          </div>

          {/* Scroll hint */}
          {!scrolledToBottom && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[10px] text-amber-700 font-medium flex items-center gap-1.5 shrink-0">
              <span>📜</span> Basahin ang lahat bago mag-accept — i-scroll pababa.
            </div>
          )}

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 text-xs text-stone-700 dark:text-stone-300 leading-relaxed"
            onScroll={handleScroll}
          >
            <p className="text-[10px] text-stone-400 italic">Huling na-update: Nobyembre 2026</p>

            {sections.map((section) => (
              <div key={section.num} className="space-y-1">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-xs flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black shrink-0 mt-0.5">
                    {section.num}
                  </span>
                  {section.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed pl-7 whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}

            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 text-[10px] text-stone-400 text-center">
              © 2026 CasaFinder · Gumaca, Quezon, Philippines
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 shrink-0 rounded-b-2xl space-y-2">
            {!scrolledToBottom && (
              <p className="text-[10px] text-stone-400 text-center">I-scroll pababa para ma-enable ang Accept button.</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onDecline}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer active:scale-95"
              >
                Hindi Sumasang-ayon
              </button>
              <button
                type="button"
                onClick={onAccept}
                disabled={!scrolledToBottom}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  scrolledToBottom
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md cursor-pointer active:scale-95"
                    : "bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sumasang-ayon ako
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
