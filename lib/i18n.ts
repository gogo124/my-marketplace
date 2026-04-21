export type SiteLocale = "ar" | "fr";

export function resolveLocale(value?: string): SiteLocale {
  return value === "fr" ? "fr" : "ar";
}

export function withLocale(path: string, locale: SiteLocale) {
  return `${path}?lang=${locale}`;
}

export const siteCopy = {
  ar: {
    brand: "Moroccan Trip",
    sell: "بيع",
    rent: "كراء",
    messages: "الرسائل",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    travelPartners: "شريك السفر",
    heroBadge: "منصة السفر في المغرب",
    heroTitle: "اكتشف المغرب وابحث عن شريك السفر المناسب بسهولة.",
    heroBody:
      "Moroccan Trip تجمع بين الإعلانات المحلية وتجربة احترافية للعثور على رفيق سفر، تنظيم الرحلات، والتواصل بثقة.",
    heroPrimaryCta: "ابحث عن شريك سفر",
    heroSecondaryCta: "أضف إعلاناً الآن",
    listingsTitle: "أحدث الإعلانات",
    listingsBody: "إعلانات حديثة من مستخدمي المنصة.",
    emptyListingsTitle: "لا توجد إعلانات بعد",
    emptyListingsBody: "أنشئ أول إعلان بعد تسجيل الدخول.",
    travelPageTitle: "ابحث عن شريك السفر",
    travelPageBody:
      "أنشئ إعلان سفر منظم، ابحث حسب الوجهة والتاريخ، وتواصل مع أشخاص يشاركونك نفس الخطة.",
    destination: "الوجهة",
    travelDate: "تاريخ السفر",
    phoneNumber: "رقم الهاتف",
    whatsappNumber: "رقم واتساب",
    phonePlaceholder: "مثال: 212612345678",
    search: "بحث",
    clear: "مسح الفلاتر",
    publishTitle: "انشر إعلان شريك سفر",
    publishBody: "شارك خطتك القادمة، المدينة أو الوجهة، وبعض التفاصيل المهمة.",
    description: "الوصف",
    publish: "نشر الإعلان",
    publishing: "جاري النشر...",
    cardsTitle: "إعلانات المسافرين",
    cardsBody: "آخر الإعلانات المنشورة من المجتمع.",
    noPostsTitle: "لا توجد نتائج حالياً",
    noPostsBody: "جرّب تغيير الفلاتر أو كن أول من ينشر إعلان سفر جديد.",
    postedBy: "نشر بواسطة",
    loadingTitle: "جاري تحميل صفحة شركاء السفر",
    loadingBody: "نقوم بجلب أحدث الإعلانات وترتيب النتائج لك.",
    loginToPublish: "سجل الدخول لنشر إعلانك والتواصل مع المسافرين.",
    contactAction: "واتساب",
    callAction: "اتصال",
    chatAction: "دردشة داخل التطبيق",
    searchPlaceholder: "مثال: مراكش، شفشاون، أكادير"
  },
  fr: {
    brand: "Moroccan Trip",
    sell: "Vendre",
    rent: "Louer",
    messages: "Messages",
    login: "Connexion",
    register: "Inscription",
    travelPartners: "Partenaire de voyage",
    heroBadge: "Plateforme voyage au Maroc",
    heroTitle: "Explorez le Maroc et trouvez le bon partenaire de voyage.",
    heroBody:
      "Moroccan Trip combine petites annonces locales et une experience premium pour rencontrer un compagnon de voyage et organiser vos trajets en toute confiance.",
    heroPrimaryCta: "Trouver un partenaire",
    heroSecondaryCta: "Publier maintenant",
    listingsTitle: "Annonces recentes",
    listingsBody: "Dernieres annonces publiees par la communaute.",
    emptyListingsTitle: "Aucune annonce pour le moment",
    emptyListingsBody: "Publiez la premiere annonce apres connexion.",
    travelPageTitle: "Trouver un partenaire de voyage",
    travelPageBody:
      "Publiez un projet de voyage clair, filtrez par destination et date, puis contactez des personnes avec le meme plan.",
    destination: "Destination",
    travelDate: "Date de voyage",
    phoneNumber: "Telephone",
    whatsappNumber: "WhatsApp",
    phonePlaceholder: "Ex: 212612345678",
    search: "Rechercher",
    clear: "Effacer",
    publishTitle: "Publier une annonce de voyage",
    publishBody: "Partagez votre prochaine destination et quelques details utiles.",
    description: "Description",
    publish: "Publier",
    publishing: "Publication...",
    cardsTitle: "Annonces voyageurs",
    cardsBody: "Dernieres annonces de la communaute.",
    noPostsTitle: "Aucun resultat",
    noPostsBody: "Essayez d'autres filtres ou publiez la premiere annonce.",
    postedBy: "Publie par",
    loadingTitle: "Chargement des partenaires de voyage",
    loadingBody: "Nous recuperons les annonces les plus recentes.",
    loginToPublish: "Connectez-vous pour publier et contacter les voyageurs.",
    contactAction: "WhatsApp",
    callAction: "Appeler",
    chatAction: "Chat interne",
    searchPlaceholder: "Ex: Marrakech, Chefchaouen, Agadir"
  }
} as const;
