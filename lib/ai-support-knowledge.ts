export type KnowledgeItem = {
  id: string;
  title: string;
  keywords: string[];
  content: string;
  suggestion?: string;
};

export const defaultSupportKnowledge: KnowledgeItem[] = [
  {
    id: "wifi-stability",
    title: "Wi-Fi bağlantı kararlılığı",
    keywords: ["wifi", "wi-fi", "kablosuz", "çekim", "sinyal", "modem"],
    content:
      "Wi-Fi bağlantılarda sinyal düşüşü, modem uzaklığı ve ağ yoğunluğu nedeniyle donma veya kalite düşmesi yaşanabilir. 5 GHz ağ kullanılması, modeme yakın test yapılması ve mümkünse Ethernet ile tekrar denenmesi önerilir.",
    suggestion: "Hız testini Wi-Fi ve Ethernet ile ayrı ayrı deneyin.",
  },
  {
    id: "ethernet-advantage",
    title: "Ethernet bağlantı avantajı",
    keywords: ["ethernet", "kablolu", "lan"],
    content:
      "Ethernet bağlantı IPTV kullanımında en stabil yöntemdir. Eğer kablolu bağlantıda da sorun varsa internet gecikmesi, cihaz performansı, uygulama veya panel yoğunluğu tarafı kontrol edilmelidir.",
    suggestion: "Mümkünse bir kez kablolu bağlantı ile test yapın.",
  },
  {
    id: "freezing-analysis",
    title: "Donma ve kasma analizi",
    keywords: ["donma", "kasma", "takılma", "yayın donuyor", "yayın kasıyor"],
    content:
      "Donma veya kasma sorunu yaşıyorsanız ilk kontrol edilmesi gereken alan bağlantı kalitesidir. Bağlantı sonucu düşükse sorun büyük ihtimalle internet veya Wi-Fi kaynaklıdır. Sonuç iyi çıkarsa cihaz, uygulama veya panel yoğunluğu değerlendirilmelidir.",
    suggestion: "Önce hız testi yapın, sonra sonucu AI destekte yorumlatın.",
  },
  {
    id: "panel-check",
    title: "Panel durumu kontrolü",
    keywords: ["panel", "titan", "5g", "mpremium", "sunucu", "bakım"],
    content:
      "Panel kaynaklı bir durum düşünülüyorsa önce ana sayfadaki panel durumu kontrol edilmelidir. Panel stabil görünüyorsa sorun doğrudan panelden değil; bağlantı, cihaz veya uygulama tarafında olabilir.",
    suggestion: "Ana sayfadan panel durumunu kontrol edin.",
  },
  {
    id: "app-troubleshooting",
    title: "Uygulama kaynaklı sorunlar",
    keywords: ["uygulama", "iptv smarters", "tivimate", "oynatıcı", "player"],
    content:
      "Sorun belirli bir uygulamada oluyorsa uygulama tamamen kapatılıp yeniden açılmalı, güncelleme kontrolü yapılmalı ve mümkünse farklı bir oynatıcı ile karşılaştırma testi yapılmalıdır. Aynı sorun tüm uygulamalarda varsa bağlantı veya panel tarafı değerlendirilmelidir.",
    suggestion: "Aynı hesabı farklı uygulamada test edin.",
  },
  {
    id: "android-tv",
    title: "Android TV / Box önerileri",
    keywords: ["android tv", "android box", "box", "tv box"],
    content:
      "Android TV ve box cihazlarda uygulama önbelleğini temizlemek, cihazı yeniden başlatmak ve mümkünse Ethernet ile bağlanmak stabiliteyi artırabilir. Uzun süre açık kalan cihazlarda performans düşüşü olabilir.",
    suggestion: "Cihazı yeniden başlatıp tekrar deneyin.",
  },
  {
    id: "ios-devices",
    title: "iPhone / iPad önerileri",
    keywords: ["iphone", "ipad", "ios"],
    content:
      "iPhone ve iPad cihazlarda uygulama seçimi önemlidir. Sorun yaşanıyorsa farklı internet bağlantısı ile test yapılmalı, uygulama yeniden başlatılmalı ve mümkünse aynı hesap başka cihazda denenmelidir.",
    suggestion: "Mobil veri ve Wi-Fi ile ayrı ayrı deneyin.",
  },
  {
    id: "installation-basics",
    title: "Kurulum temel kontrolü",
    keywords: ["kurulum", "yükleme", "nasıl kurulur", "giriş bilgisi"],
    content:
      "Kurulum tarafında cihaz modeli, uygulama türü ve giriş yöntemi önemlidir. İlk olarak uygulamanın doğru kurulduğu, giriş bilgilerinin eksiksiz girildiği ve bağlantının stabil olduğu kontrol edilmelidir.",
    suggestion: "Cihaz modeli ve kullandığınız uygulamayı net yazın.",
  },
  {
    id: "speed-test-meaning",
    title: "Hız testi sonucu nasıl yorumlanır",
    keywords: ["hız testi", "test", "çok iyi", "iyi", "orta", "kötü"],
    content:
      "Hız testi alanı bağlantı sonucunu Çok İyi, İyi, Orta, Kötü veya Çok Kötü olarak yorumlar. Sonuç düşükse internet tarafı öncelikli kontrol edilmelidir. Sonuç yüksek ama sorun devam ediyorsa cihaz, uygulama veya panel tarafı incelenmelidir.",
    suggestion: "Test sonucunu AI destekte yorumlatabilirsiniz.",
  },
];