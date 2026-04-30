export type SiteLocale = "ar" | "fr";
export const SITE_LOCALE_COOKIE = "site-locale";

export function resolveLocale(value?: string): SiteLocale {
  return value === "fr" ? "fr" : "ar";
}

export function isRtl(locale: SiteLocale) {
  return locale === "ar";
}

export function getDirection(locale: SiteLocale) {
  return isRtl(locale) ? "rtl" : "ltr";
}

export function withLocale(path: string, locale: SiteLocale) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${locale}`;
}

export function formatLocaleDate(value: string | Date, locale: SiteLocale, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", options || {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatLocaleDateTime(value: string | Date, locale: SiteLocale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatLocaleNumber(value: number, locale: SiteLocale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-FR").format(value);
}

export function formatLocalePrice(value: number, locale: SiteLocale) {
  return `${formatLocaleNumber(value, locale)} DH`;
}

export function localizeField<T extends Record<string, any>>(value: unknown, locale: SiteLocale, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const localizedValue = (value as Record<string, unknown>)[locale];

    if (typeof localizedValue === "string" && localizedValue.trim()) {
      return localizedValue;
    }

    const fallbackValue = (value as Record<string, unknown>)[locale === "ar" ? "fr" : "ar"];

    if (typeof fallbackValue === "string" && fallbackValue.trim()) {
      return fallbackValue;
    }
  }

  return fallback;
}

export function localizeRecordField<T extends Record<string, any>>(
  record: T | null | undefined,
  field: string,
  locale: SiteLocale,
  fallback = ""
) {
  if (!record) {
    return fallback;
  }

  const directValue = record[field];

  if (typeof directValue === "string" && directValue.trim()) {
    return directValue;
  }

  if (directValue && typeof directValue === "object") {
    return localizeField(directValue, locale, fallback);
  }

  const suffix = locale === "ar" ? "Ar" : "Fr";
  const snakeSuffix = locale === "ar" ? "_ar" : "_fr";
  const suffixedValue = record[`${field}${suffix}`] || record[`${field}${snakeSuffix}`];

  if (typeof suffixedValue === "string" && suffixedValue.trim()) {
    return suffixedValue;
  }

  const alternateSuffix = locale === "ar" ? "Fr" : "Ar";
  const alternateSnakeSuffix = locale === "ar" ? "_fr" : "_ar";
  const fallbackValue = record[`${field}${alternateSuffix}`] || record[`${field}${alternateSnakeSuffix}`];

  if (typeof fallbackValue === "string" && fallbackValue.trim()) {
    return fallbackValue;
  }

  return fallback;
}

const apiErrorDictionary = {
  "Unexpected error.": {
    ar: "حدث خطأ غير متوقع.",
    fr: "Une erreur inattendue s'est produite."
  },
  "Unauthorized.": {
    ar: "يجب تسجيل الدخول أولاً.",
    fr: "Connexion requise."
  },
  "Please sign in to continue": {
    ar: "يرجى تسجيل الدخول للمتابعة.",
    fr: "Veuillez vous connecter pour continuer."
  },
  "Invalid trip code.": {
    ar: "رمز الرحلة غير صالح.",
    fr: "Code voyage invalide."
  },
  "Valid trip code is required.": {
    ar: "رمز رحلة صالح مطلوب.",
    fr: "Un code voyage valide est requis."
  },
  "Trip code is required.": {
    ar: "رمز الرحلة مطلوب.",
    fr: "Le code voyage est requis."
  },
  "All fields are required.": {
    ar: "جميع الحقول مطلوبة.",
    fr: "Tous les champs sont obligatoires."
  },
  "Password must be at least 6 characters long.": {
    ar: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
    fr: "Le mot de passe doit contenir au moins 6 caracteres."
  },
  "Password must be at least 8 characters long.": {
    ar: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    fr: "Le mot de passe doit contenir au moins 8 caracteres."
  },
  "Password must contain letters and numbers.": {
    ar: "يجب أن تحتوي كلمة المرور على حروف وأرقام.",
    fr: "Le mot de passe doit contenir des lettres et des chiffres."
  },
  "Enter a valid email address.": {
    ar: "أدخل بريداً إلكترونياً صالحاً.",
    fr: "Entrez une adresse email valide."
  },
  "Enter a valid full name.": {
    ar: "أدخل اسماً كاملاً صالحاً.",
    fr: "Entrez un nom complet valide."
  },
  "Disposable email addresses are not allowed.": {
    ar: "لا يُسمح بعناوين البريد المؤقتة.",
    fr: "Les adresses email temporaires ne sont pas autorisees."
  },
  "Registration blocked.": {
    ar: "تم رفض طلب التسجيل.",
    fr: "Inscription refusee."
  },
  "Invalid request origin.": {
    ar: "مصدر الطلب غير صالح.",
    fr: "Origine de requete non valide."
  },
  "Email is already registered.": {
    ar: "البريد الإلكتروني مستخدم بالفعل.",
    fr: "Cet email est deja utilise."
  },
  "Registration failed.": {
    ar: "فشل إنشاء الحساب.",
    fr: "Echec de l'inscription."
  },
  "Missing email or password.": {
    ar: "البريد الإلكتروني وكلمة المرور مطلوبان.",
    fr: "L'email et le mot de passe sont obligatoires."
  },
  "Invalid credentials.": {
    ar: "بيانات تسجيل الدخول غير صحيحة.",
    fr: "Identifiants invalides."
  },
  "This account has been disabled.": {
    ar: "تم تعطيل هذا الحساب.",
    fr: "Ce compte a ete desactive."
  },
  "Authentication service is not configured.": {
    ar: "إعدادات تسجيل الدخول غير مكتملة.",
    fr: "La configuration de l'authentification est incomplete."
  },
  "Authentication service is unavailable.": {
    ar: "خدمة تسجيل الدخول غير متاحة حالياً.",
    fr: "Le service d'authentification est indisponible pour le moment."
  },
  "Unable to sign in right now.": {
    ar: "تعذر تسجيل الدخول حالياً.",
    fr: "Connexion impossible pour le moment."
  },
  "Unable to create a session right now.": {
    ar: "تعذر إنشاء الجلسة حالياً.",
    fr: "Impossible de creer la session pour le moment."
  },
  "Could not create listing.": {
    ar: "تعذر إنشاء الإعلان.",
    fr: "Impossible de creer l'annonce."
  },
  "Could not save agency profile.": {
    ar: "تعذر حفظ ملف الوكالة.",
    fr: "Impossible d'enregistrer le profil de l'agence."
  },
  "Could not publish travel post.": {
    ar: "تعذر نشر إعلان السفر.",
    fr: "Impossible de publier l'annonce de voyage."
  },
  "Could not submit report.": {
    ar: "تعذر إرسال البلاغ.",
    fr: "Impossible d'envoyer le signalement."
  },
  "Could not submit review.": {
    ar: "تعذر إرسال التقييم.",
    fr: "Impossible d'envoyer l'avis."
  },
  "Could not create conversation.": {
    ar: "تعذر إنشاء المحادثة.",
    fr: "Impossible de creer la conversation."
  },
  "Could not send message.": {
    ar: "تعذر إرسال الرسالة.",
    fr: "Impossible d'envoyer le message."
  },
  "Message send failed.": {
    ar: "فشل إرسال الرسالة.",
    fr: "Echec de l'envoi du message."
  },
  "Could not reserve seats.": {
    ar: "تعذر إرسال الحجز.",
    fr: "Impossible d'envoyer la reservation."
  },
  "Could not save trip.": {
    ar: "تعذر حفظ الرحلة.",
    fr: "Impossible d'enregistrer le voyage."
  },
  "Could not delete trip.": {
    ar: "تعذر حذف الرحلة.",
    fr: "Impossible de supprimer le voyage."
  },
  "Could not update trip status.": {
    ar: "تعذر تحديث حالة الرحلة.",
    fr: "Impossible de mettre a jour le statut du voyage."
  },
  "Could not update status.": {
    ar: "تعذر تحديث الحالة.",
    fr: "Impossible de mettre a jour le statut."
  },
  "Admin action failed.": {
    ar: "فشل إجراء الإدارة.",
    fr: "L'action administrateur a echoue."
  },
  "Too many reports. Please try again later.": {
    ar: "تم إرسال عدد كبير من البلاغات. حاول لاحقاً.",
    fr: "Trop de signalements. Reessayez plus tard."
  },
  "Too many review attempts. Please try again later.": {
    ar: "تمت محاولات كثيرة لإرسال التقييم. حاول لاحقاً.",
    fr: "Trop de tentatives d'avis. Reessayez plus tard."
  },
  "Too many registration attempts. Please try again later.": {
    ar: "محاولات التسجيل كثيرة جداً. حاول لاحقاً.",
    fr: "Trop de tentatives d'inscription. Reessayez plus tard."
  },
  "Too many profile update attempts. Please try again later.": {
    ar: "محاولات تحديث الملف كثيرة جداً. حاول لاحقاً.",
    fr: "Trop de tentatives de mise a jour du profil. Reessayez plus tard."
  },
  "You already reported this item.": {
    ar: "لقد أبلغت عن هذا العنصر بالفعل.",
    fr: "Vous avez deja signale cet element."
  },
  "Reported item was not found.": {
    ar: "العنصر المبلغ عنه غير موجود.",
    fr: "L'element signale est introuvable."
  },
  "Listing not found.": {
    ar: "الإعلان غير موجود.",
    fr: "Annonce introuvable."
  },
  "You cannot review your own listing.": {
    ar: "لا يمكنك تقييم إعلانك الخاص.",
    fr: "Vous ne pouvez pas evaluer votre propre annonce."
  },
  "You have already reviewed this listing.": {
    ar: "لقد قمت بتقييم هذا الإعلان من قبل.",
    fr: "Vous avez deja evalue cette annonce."
  },
  "WhatsApp number is not available for this listing.": {
    ar: "رقم واتساب غير متوفر لهذا الإعلان.",
    fr: "Le numero WhatsApp n'est pas disponible pour cette annonce."
  },
  "Phone number is not available for this listing.": {
    ar: "رقم الهاتف غير متوفر لهذا الإعلان.",
    fr: "Le numero de telephone n'est pas disponible pour cette annonce."
  },
  "Message is too long.": {
    ar: "الرسالة طويلة جداً.",
    fr: "Le message est trop long."
  },
  "The server did not return the created listing.": {
    ar: "لم يُرجع الخادم الإعلان الذي تم إنشاؤه.",
    fr: "Le serveur n'a pas renvoye l'annonce creee."
  },
  "The server did not return the created conversation.": {
    ar: "لم يُرجع الخادم المحادثة التي تم إنشاؤها.",
    fr: "Le serveur n'a pas renvoye la conversation creee."
  },
  "Could not send reset email.": {
    ar: "تعذر إرسال رابط إعادة التعيين.",
    fr: "Impossible d'envoyer le lien de reinitialisation."
  },
  "Could not reset password.": {
    ar: "تعذر إعادة تعيين كلمة المرور.",
    fr: "Impossible de reinitialiser le mot de passe."
  },
  "Password reset service is not configured.": {
    ar: "خدمة إعادة تعيين كلمة المرور غير مفعلة حالياً.",
    fr: "Le service de reinitialisation du mot de passe n'est pas configure."
  },
  "Too many password reset attempts. Please try again later.": {
    ar: "محاولات إعادة التعيين كثيرة جداً. حاول لاحقاً.",
    fr: "Trop de tentatives de reinitialisation. Reessayez plus tard."
  },
  "Reset token is required.": {
    ar: "رابط إعادة التعيين غير مكتمل.",
    fr: "Le jeton de reinitialisation est requis."
  },
  "Reset token is invalid or expired.": {
    ar: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.",
    fr: "Le lien de reinitialisation est invalide ou expire."
  },
  "Password updated successfully.": {
    ar: "تم تحديث كلمة المرور بنجاح.",
    fr: "Le mot de passe a ete mis a jour avec succes."
  },
  "If an account exists for this email, a reset link has been sent.": {
    ar: "إذا كان هذا البريد مرتبطاً بحساب، فسيصلك رابط إعادة التعيين.",
    fr: "Si un compte existe pour cet email, un lien de reinitialisation a ete envoye."
  },
  "Custom product name is too long.": {
    ar: "اسم المنتج المخصص طويل جداً.",
    fr: "Le nom du produit personnalise est trop long."
  },
  "Lead notes are too long.": {
    ar: "ملاحظات الطلب طويلة جداً.",
    fr: "Les notes du lead sont trop longues."
  },
  "Lead price is invalid.": {
    ar: "سعر الطلب غير صالح.",
    fr: "Le prix du lead est invalide."
  },
  "Lead quantity is invalid.": {
    ar: "كمية الطلب غير صالحة.",
    fr: "La quantite du lead est invalide."
  }
} as const;

export function translateApiError(message: string, locale: SiteLocale) {
  const localized = apiErrorDictionary[message as keyof typeof apiErrorDictionary];
  return localized ? localized[locale] : message;
}

export const siteCopy = {
  ar: {
    brand: "Moroccan Trip",
    home: "الرئيسية",
    agencies: "الوكالات",
    sell: "بيع",
    rent: "كراء",
    sale: "بيع",
    rental: "كراء",
    messages: "الرسائل",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    signOut: "تسجيل الخروج",
    travelPartners: "شريك السفر",
    agencyDashboard: "لوحة الوكالة",
    agencyProfile: "ملف الوكالة",
    becomeAgency: "أنشئ وكالتك",
    admin: "الإدارة",
    heroBadge: "منصة السفر في المغرب",
    heroTitle: "اكتشف الوكالات الموثوقة والرحلات المنظمة داخل المغرب.",
    heroBody:
      "Moroccan Trip تجمع بين اكتشاف الوكالات والرحلات المنظمة وشركاء السفر في منصة محلية واحدة مع تواصل مباشر وحجز عملي.",
    heroPrimaryCta: "اكتشف الوكالات",
    heroSecondaryCta: "ابحث عن شريك سفر",
    trustedTripsTitle: "وكالات موثوقة ورحلات منظمة وتواصل آمن.",
    trustedTripsBody: "مكان واحد لمقارنة الوكالات واكتشاف الرحلات المنظمة والتواصل مع المسافرين داخل المغرب.",
    currency: "العملة",
    languages: "اللغات",
    primaryJourney: "المسار الأساسي",
    primaryJourneyTitle: "تصفح الوكالات واحجز الرحلات المنظمة.",
    primaryJourneyBody: "أكبر قيمة في المنصة هي مقارنة الوكالات وقراءة تفاصيل الرحلات والتواصل المباشر مع الجهة المناسبة.",
    exploreAgencies: "استكشف الوكالات",
    secondaryJourney: "المسار المساند",
    secondaryJourneyTitle: "استخدم شركاء السفر والإعلانات كأدوات إضافية.",
    secondaryJourneyBody: "تظل إعلانات المجتمع وشركاء السفر مفيدة، لكن القيمة الأوضح هي في الوكالات والرحلات.",
    findTravelPartners: "ابحث عن شريك سفر",
    marketplaceSearch: "ابحث داخل المنصة",
    marketplaceSearchBody: "صفِّ الإعلانات حسب الكلمات المفتاحية أو النوع أو المدينة أو الفئة.",
    searchTitlePlaceholder: "ابحث في العنوان أو الوصف",
    allTypes: "كل الأنواع",
    cityOrArea: "المدينة أو المنطقة",
    categoryPlaceholder: "الفئة",
    result: "نتيجة",
    results: "نتائج",
    search: "بحث",
    clear: "مسح",
    filter: "تصفية",
    submit: "إرسال",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    loading: "جارٍ التحميل...",
    publishing: "جارٍ النشر...",
    send: "إرسال",
    sending: "جارٍ الإرسال...",
    delete: "حذف",
    edit: "تعديل",
    update: "تحديث",
    add: "إضافة",
    listingsTitle: "إعلانات المنصة",
    listingsBody: "إعلانات حديثة من مستخدمي المنصة كخدمة إضافية بجانب الرحلات والوكالات.",
    emptyListingsTitle: "لا توجد إعلانات بعد",
    emptyListingsBody: "أنشئ أول إعلان بعد تسجيل الدخول.",
    seller: "البائع",
    marketplaceUser: "مستخدم المنصة",
    viewDetails: "عرض التفاصيل",
    type: "النوع",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    rating: "التقييم",
    noRatings: "لا توجد تقييمات بعد",
    noReviews: "لا توجد تقييمات",
    noReviewsYet: "لا توجد تقييمات بعد.",
    reviews: "التقييمات",
    leaveReview: "أضف تقييماً",
    selectRating: "اختر التقييم",
    writeReview: "اكتب تقييمك",
    submitReview: "إرسال التقييم",
    report: "إبلاغ",
    reportListing: "إبلاغ عن الإعلان",
    reportSeller: "إبلاغ عن البائع",
    reportAgency: "إبلاغ عن الوكالة",
    reportOwner: "إبلاغ عن المالك",
    reportPost: "إبلاغ عن المنشور",
    reportReview: "إبلاغ عن التقييم",
    reportUser: "إبلاغ عن المستخدم",
    reportSubmitted: "تم إرسال البلاغ.",
    cancelReport: "إلغاء البلاغ",
    selectReason: "اختر السبب",
    optionalDetails: "تفاصيل إضافية اختيارية",
    submitReport: "إرسال البلاغ",
    submitting: "جارٍ الإرسال...",
    reasonSpam: "محتوى مزعج",
    reasonFraud: "احتيال",
    reasonAbusive: "محتوى مسيء",
    reasonMisleading: "معلومات مضللة",
    reasonHarassment: "مضايقة",
    reasonOther: "أخرى",
    verified: "موثق",
    unverified: "غير موثق",
    pendingReview: "قيد المراجعة",
    travelPageTitle: "ابحث عن شريك السفر",
    travelPageBody: "أنشئ إعلان سفر منظم، وابحث حسب الوجهة والتاريخ، وتواصل مع أشخاص يشاركونك نفس الخطة.",
    destination: "الوجهة",
    travelDate: "تاريخ السفر",
    phoneNumber: "رقم الهاتف",
    whatsappNumber: "رقم واتساب",
    phonePlaceholder: "مثال: 212612345678",
    publishTitle: "انشر إعلان شريك سفر",
    publishBody: "شارك خطتك القادمة والمدينة أو الوجهة وبعض التفاصيل المهمة.",
    description: "الوصف",
    publish: "نشر الإعلان",
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
    searchPlaceholder: "مثال: مراكش، شفشاون، أكادير",
    searchByCity: "ابحث حسب المدينة",
    filterByDate: "صفِّ حسب التاريخ",
    contactTravelers: "تواصل مع المسافرين",
    travelSide: "واجهة المسافر",
    browseAgenciesTrips: "تصفح الوكالات والرحلات ثم تواصل أو احجز.",
    backToAgencies: "العودة إلى الوكالات",
    agencyDiscovery: "اكتشاف الوكالات",
    agencyDiscoveryBody: "بحث موجه للمسافر لاكتشاف الوكالات والرحلات المنظمة.",
    agenciesCount: "وكالة",
    searchAgencyPlaceholder: "ابحث باسم الوكالة أو الوصف",
    city: "المدينة",
    activeTrips: "الرحلات النشطة",
    openSeats: "المقاعد المتاحة",
    viewAgency: "عرض الوكالة",
    contact: "تواصل",
    noAgencies: "لا توجد وكالات مطابقة لبحثك الحالي.",
    trust: "الثقة",
    profileComplete: "اكتمال الملف",
    trips: "الرحلات",
    agencyTrips: "رحلات الوكالة",
    agencyTripsBody: "ابحث واحجز الرحلات المتاحة المنشورة من هذه الوكالة.",
    searchTripPlaceholder: "ابحث عن رحلة أو مدينة أو وجهة",
    reserveThisTrip: "احجز هذه الرحلة",
    seatsLeft: "مقاعد متبقية",
    yourFullName: "اسمك الكامل",
    guestFullName: "اسم الضيف الكامل",
    seats: "المقاعد",
    reserveSeats: "احجز المقاعد",
    tripFull: "الرحلة مكتملة",
    reservationSent: "تم إرسال طلب الحجز بنجاح.",
    memberSince: "عضو منذ",
    loginHeroKicker: "دخول الأعضاء",
    loginHeroTitle: "سجّل الدخول وأدر نشاطك داخل المنصة.",
    loginHeroBody: "ادخل إلى إعلاناتك والردود والمحادثات من مكان واحد.",
    needAccount: "تحتاج إلى حساب؟",
    registerHeroKicker: "إنشاء حساب",
    registerHeroTitle: "انضم إلى المنصة وانشر أول عرض لك.",
    registerHeroBody: "يتم تخزين بيانات التسجيل بشكل آمن مع تشفير كلمة المرور.",
    alreadyRegistered: "لديك حساب بالفعل؟",
    welcomeBack: "مرحباً بعودتك",
    createSellerAccount: "أنشئ حسابك",
    loginFormBody: "سجّل الدخول لنشر الإعلانات والرد على المشترين.",
    registerFormBody: "أنشئ حساباً لنشر الإعلانات والدردشة بأمان.",
    fullName: "الاسم الكامل",
    emailAddress: "البريد الإلكتروني",
    password: "كلمة المرور",
    continueWithGoogle: "المتابعة بواسطة Google",
    connectingGoogle: "جارٍ الاتصال بـ Google...",
    or: "أو",
    pleaseWait: "يرجى الانتظار...",
    listingCreateSaleTitle: "أنشئ إعلان بيع",
    listingCreateRentalTitle: "أنشئ إعلان كراء",
    listingCreateSaleBody: "أنشئ إعلاناً واضحاً مع تواصل مباشر وصور مناسبة.",
    listingCreateRentalBody: "أنشئ إعلان كراء مع التواريخ والعربون وطرق التواصل المباشر.",
    title: "العنوان",
    price: "السعر",
    location: "الموقع",
    deposit: "العربون",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    productImages: "صور الإعلان",
    productImagesBody: "ارفع حتى {count} صور من جهازك. الصيغ المسموحة: PNG و JPEG.",
    uploadLimit: "يمكنك رفع حتى {count} صور لكل إعلان.",
    onlyPngJpeg: "يُسمح فقط بصور PNG و JPEG.",
    imageTooLarge: "يجب ألا يتجاوز حجم كل صورة 5 ميغابايت.",
    createListingError: "تعذر إنشاء الإعلان.",
    createAgencyProfile: "ملف الوكالة",
    agencyProfileBody: "اضبط معلومات الوكالة العامة ووسائل التواصل.",
    agencyLogo: "شعار الوكالة",
    agencyCover: "صورة الغلاف",
    uploadSingleImage: "ارفع صورة PNG أو JPEG واحدة أو احتفظ بالرابط الحالي.",
    logoPreview: "معاينة الشعار",
    coverPreview: "معاينة الغلاف",
    describeAgency: "عرّف وكالتك",
    agencyName: "اسم الوكالة",
    useClearContact: "استخدم أرقام تواصل كاملة وروابط صور عامة ووصفاً واضحاً لتعزيز الثقة بسرعة.",
    saveAgencyProfile: "حفظ ملف الوكالة",
    contactSeller: "تواصل مع البائع",
    contactSellerBody: "ابدأ برسالة قصيرة. يتم تتبع وسائل التواصل كعملاء محتملين.",
    defaultSellerMessage: "مرحباً، هل ما زال هذا العرض متاحاً؟",
    openAction: "فتح",
    writeReply: "اكتب ردك",
    sendReply: "إرسال الرد",
    inbox: "صندوق الرسائل",
    inboxBody: "محادثاتك النشطة مع البائعين والمشترين.",
    chattingWith: "تتحدث مع",
    noConversations: "لا توجد محادثات بعد. يمكنك مراسلة البائع من صفحة أي إعلان.",
    conversation: "محادثة",
    marketplaceChat: "دردشة المنصة",
    noMessages: "لا توجد رسائل بعد.",
    logInToContact: "سجّل الدخول للتواصل مع البائع وبدء المحادثة.",
    adminRestricted: "منطقة محمية",
    accessDenied: "تم رفض الوصول",
    adminOnlyMessage: "هذه المنطقة متاحة فقط للمستخدمين الذين يملكون دور admin.",
    backHome: "العودة إلى الرئيسية",
    adminPlatformControl: "التحكم في المنصة",
    adminPlatformBody: "راجع النشاط وفعّل التوثيق واشرف على المحتوى من مكان واحد.",
    overview: "نظرة عامة",
    users: "المستخدمون",
    listings: "الإعلانات",
    reservations: "الحجوزات",
    leads: "العملاء المحتملون",
    reports: "البلاغات",
    agencyOwner: "صاحب الوكالة",
    privateNavigation: "التنقل الخاص",
    agencyOwnerBody: "أدر وكالتك عبر مساحة عمل خاصة صغيرة.",
    viewPublicProfile: "عرض الملف العام",
    becomeAnAgency: "أنشئ وكالة",
    agencyDashboardTitle: "لوحة الوكالة",
    agencyDashboardBody: "تابع الرحلات والحجوزات والمقاعد والاهتمامات من صفحة واحدة.",
    agencyProfileTitle: "ملف الوكالة",
    agencyProfileHeroTitle: "أدر معلومات وكالتك العامة.",
    agencyProfileHeroBody: "حدّث الملف الذي يراه المسافر قبل الحجز أو التواصل. الملف الجيد يرفع الثقة والتحويل.",
    becomeAgencyTitle: "أنشئ ملف وكالتك للوصول إلى مساحة الوكالة الخاصة.",
    becomeAgencyBody: "أكمل هذا الملف مرة واحدة. بعد الحفظ يصبح حسابك حساب وكالة ويمكنك إدارة الرحلات والحجوزات والاهتمامات.",
    agencyTripsTitle: "رحلات الوكالة",
    agencyTripsHeroTitle: "أنشئ وعدّل وانشر الرحلات المنظمة.",
    agencyTripsHeroBody: "أدر التواريخ والأسعار وعدد المقاعد والحالة من صفحة واحدة.",
    agencyReservationsTitle: "حجوزات الوكالة",
    agencyReservationsHeroTitle: "راجع حجوزات المسافرين من مكان واحد.",
    agencyReservationsHeroBody: "تابع طلبات الحجز الحديثة وعدد المقاعد وبيانات التواصل.",
    agencyLeadsTitle: "عملاء الوكالة",
    agencyLeadsHeroTitle: "تابع الاهتمامات والرسائل الواردة.",
    agencyLeadsHeroBody: "اعرف نوايا التواصل وآخر المحادثات داخل المنصة."
  },
  fr: {
    brand: "Moroccan Trip",
    home: "Accueil",
    agencies: "Agences",
    sell: "Vendre",
    rent: "Louer",
    sale: "Vente",
    rental: "Location",
    messages: "Messages",
    login: "Connexion",
    register: "Inscription",
    signOut: "Deconnexion",
    travelPartners: "Partenaire de voyage",
    agencyDashboard: "Tableau agence",
    agencyProfile: "Profil agence",
    becomeAgency: "Creer mon agence",
    admin: "Admin",
    heroBadge: "Plateforme voyage au Maroc",
    heroTitle: "Decouvrez des agences fiables et des voyages organises au Maroc.",
    heroBody:
      "Moroccan Trip rassemble agences, voyages organises et partenaires de voyage dans une meme plateforme locale avec contact direct et reservation simple.",
    heroPrimaryCta: "Voir les agences",
    heroSecondaryCta: "Trouver un partenaire",
    trustedTripsTitle: "Agences fiables, voyages organises et contact securise.",
    trustedTripsBody: "Un seul endroit pour comparer les agences, decouvrir des voyages organises et contacter des voyageurs au Maroc.",
    currency: "Devise",
    languages: "Langues",
    primaryJourney: "Parcours principal",
    primaryJourneyTitle: "Parcourez les agences et reservez des voyages organises.",
    primaryJourneyBody: "La valeur la plus forte du produit reste la comparaison des agences, la lecture des voyages et le contact direct avec le bon prestataire.",
    exploreAgencies: "Explorer les agences",
    secondaryJourney: "Parcours secondaire",
    secondaryJourneyTitle: "Utilisez les partenaires de voyage et les annonces comme outils complementaires.",
    secondaryJourneyBody: "Les annonces communautaires restent utiles, mais la valeur la plus claire est autour des agences et des voyages.",
    findTravelPartners: "Trouver un partenaire",
    marketplaceSearch: "Rechercher sur la plateforme",
    marketplaceSearchBody: "Filtrez les annonces par mot-cle, type, ville ou categorie.",
    searchTitlePlaceholder: "Rechercher dans le titre ou la description",
    allTypes: "Tous les types",
    cityOrArea: "Ville ou zone",
    categoryPlaceholder: "Categorie",
    result: "resultat",
    results: "resultats",
    search: "Rechercher",
    clear: "Effacer",
    filter: "Filtrer",
    submit: "Envoyer",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    loading: "Chargement...",
    publishing: "Publication...",
    send: "Envoyer",
    sending: "Envoi...",
    delete: "Supprimer",
    edit: "Modifier",
    update: "Mettre a jour",
    add: "Ajouter",
    listingsTitle: "Annonces de la plateforme",
    listingsBody: "Des annonces recentes publiees par les utilisateurs en complement des agences et des voyages.",
    emptyListingsTitle: "Aucune annonce pour le moment",
    emptyListingsBody: "Publiez la premiere annonce apres connexion.",
    seller: "Vendeur",
    marketplaceUser: "Utilisateur de la plateforme",
    viewDetails: "Voir details",
    type: "Type",
    status: "Statut",
    active: "Actif",
    inactive: "Inactif",
    rating: "Note",
    noRatings: "Aucune note pour le moment",
    noReviews: "Aucun avis",
    noReviewsYet: "Aucun avis pour le moment.",
    reviews: "Avis",
    leaveReview: "Laisser un avis",
    selectRating: "Choisir une note",
    writeReview: "Ecrivez votre avis",
    submitReview: "Envoyer l'avis",
    report: "Signaler",
    reportListing: "Signaler l'annonce",
    reportSeller: "Signaler le vendeur",
    reportAgency: "Signaler l'agence",
    reportOwner: "Signaler le proprietaire",
    reportPost: "Signaler la publication",
    reportReview: "Signaler l'avis",
    reportUser: "Signaler l'utilisateur",
    reportSubmitted: "Signalement envoye.",
    cancelReport: "Annuler le signalement",
    selectReason: "Choisir une raison",
    optionalDetails: "Details facultatifs",
    submitReport: "Envoyer le signalement",
    submitting: "Envoi...",
    reasonSpam: "Spam",
    reasonFraud: "Fraude",
    reasonAbusive: "Contenu abusif",
    reasonMisleading: "Information trompeuse",
    reasonHarassment: "Harcèlement",
    reasonOther: "Autre",
    verified: "Verifie",
    unverified: "Non verifie",
    pendingReview: "En attente",
    travelPageTitle: "Trouver un partenaire de voyage",
    travelPageBody: "Publiez un projet de voyage clair, filtrez par destination et date, puis contactez des personnes avec le meme plan.",
    destination: "Destination",
    travelDate: "Date de voyage",
    phoneNumber: "Telephone",
    whatsappNumber: "WhatsApp",
    phonePlaceholder: "Ex: 212612345678",
    publishTitle: "Publier une annonce de voyage",
    publishBody: "Partagez votre prochaine destination, votre ville de depart et quelques details utiles.",
    description: "Description",
    publish: "Publier",
    cardsTitle: "Annonces voyageurs",
    cardsBody: "Dernieres annonces publiees par la communaute.",
    noPostsTitle: "Aucun resultat",
    noPostsBody: "Essayez d'autres filtres ou publiez la premiere annonce.",
    postedBy: "Publie par",
    loadingTitle: "Chargement des partenaires de voyage",
    loadingBody: "Nous recuperons les annonces les plus recentes.",
    loginToPublish: "Connectez-vous pour publier et contacter les voyageurs.",
    contactAction: "WhatsApp",
    callAction: "Appeler",
    chatAction: "Chat interne",
    searchPlaceholder: "Ex: Marrakech, Chefchaouen, Agadir",
    searchByCity: "Rechercher par ville",
    filterByDate: "Filtrer par date",
    contactTravelers: "Contacter les voyageurs",
    travelSide: "Cote voyageur",
    browseAgenciesTrips: "Parcourez les agences et les voyages puis contactez ou reservez.",
    backToAgencies: "Retour aux agences",
    agencyDiscovery: "Decouverte d'agences",
    agencyDiscoveryBody: "Recherche voyageur pour decouvrir les agences et les voyages organises.",
    agenciesCount: "agences",
    searchAgencyPlaceholder: "Rechercher le nom ou la description de l'agence",
    city: "Ville",
    activeTrips: "Voyages actifs",
    openSeats: "Places disponibles",
    viewAgency: "Voir l'agence",
    contact: "Contacter",
    noAgencies: "Aucune agence ne correspond a votre recherche.",
    trust: "Confiance",
    profileComplete: "Profil complet",
    trips: "Voyages",
    agencyTrips: "Voyages de l'agence",
    agencyTripsBody: "Recherchez et reservez les voyages disponibles publies par cette agence.",
    searchTripPlaceholder: "Rechercher un voyage, une ville ou une destination",
    reserveThisTrip: "Reserver ce voyage",
    seatsLeft: "places restantes",
    yourFullName: "Votre nom complet",
    guestFullName: "Nom complet du voyageur",
    seats: "Places",
    reserveSeats: "Reserver",
    tripFull: "Voyage complet",
    reservationSent: "Reservation envoyee avec succes.",
    memberSince: "Membre depuis",
    loginHeroKicker: "Acces membre",
    loginHeroTitle: "Connectez-vous et gerez votre activite sur la plateforme.",
    loginHeroBody: "Accedez a vos annonces, reponses et conversations depuis un seul espace.",
    needAccount: "Besoin d'un compte ?",
    registerHeroKicker: "Creation de compte",
    registerHeroTitle: "Rejoignez la plateforme et publiez votre premiere offre.",
    registerHeroBody: "L'inscription utilise un email et un mot de passe stockes de facon securisee.",
    alreadyRegistered: "Deja inscrit ?",
    welcomeBack: "Bon retour",
    createSellerAccount: "Creer votre compte",
    loginFormBody: "Connectez-vous pour publier des annonces et repondre aux acheteurs.",
    registerFormBody: "Creez un compte pour publier des annonces et discuter en securite.",
    fullName: "Nom complet",
    emailAddress: "Adresse email",
    password: "Mot de passe",
    continueWithGoogle: "Continuer avec Google",
    connectingGoogle: "Connexion a Google...",
    or: "ou",
    pleaseWait: "Veuillez patienter...",
    listingCreateSaleTitle: "Creer une annonce de vente",
    listingCreateRentalTitle: "Creer une annonce de location",
    listingCreateSaleBody: "Publiez une annonce claire avec contact direct et bonnes images.",
    listingCreateRentalBody: "Publiez une annonce de location avec dates, depot et contact direct.",
    title: "Titre",
    price: "Prix",
    location: "Localisation",
    deposit: "Depot",
    startDate: "Date de debut",
    endDate: "Date de fin",
    productImages: "Images de l'annonce",
    productImagesBody: "Ajoutez jusqu'a {count} images depuis votre appareil. Formats acceptes : PNG et JPEG.",
    uploadLimit: "Vous pouvez ajouter jusqu'a {count} images par annonce.",
    onlyPngJpeg: "Seules les images PNG et JPEG sont autorisees.",
    imageTooLarge: "Chaque image doit faire 5 Mo maximum.",
    createListingError: "Impossible de creer l'annonce.",
    createAgencyProfile: "Profil agence",
    agencyProfileBody: "Configurez vos informations publiques et vos coordonnees.",
    agencyLogo: "Logo agence",
    agencyCover: "Image de couverture",
    uploadSingleImage: "Ajoutez une image PNG ou JPEG ou gardez l'URL existante.",
    logoPreview: "Apercu du logo",
    coverPreview: "Apercu de la couverture",
    describeAgency: "Decrivez votre agence",
    agencyName: "Nom de l'agence",
    useClearContact: "Ajoutez des numeros complets, des images publiques et une description claire pour rassurer plus vite.",
    saveAgencyProfile: "Enregistrer le profil",
    contactSeller: "Contacter le vendeur",
    contactSellerBody: "Commencez par un message court. Les actions de contact sont suivies comme des leads.",
    defaultSellerMessage: "Bonjour, cette offre est-elle toujours disponible ?",
    openAction: "Ouvrir",
    writeReply: "Ecrivez votre reponse",
    sendReply: "Envoyer la reponse",
    inbox: "Boite de reception",
    inboxBody: "Vos conversations actives avec vendeurs et acheteurs.",
    chattingWith: "Discussion avec",
    noConversations: "Aucune conversation pour le moment. Ecrivez a un vendeur depuis une annonce.",
    conversation: "Conversation",
    marketplaceChat: "Chat de la plateforme",
    noMessages: "Aucun message pour le moment.",
    logInToContact: "Connectez-vous pour contacter le vendeur et demarrer une conversation.",
    adminRestricted: "Zone restreinte",
    accessDenied: "Acces refuse",
    adminOnlyMessage: "Cette zone est reservee aux utilisateurs avec le role admin.",
    backHome: "Retour a l'accueil",
    adminPlatformControl: "Controle de la plateforme",
    adminPlatformBody: "Suivez l'activite, verifiez les profils et moderez le contenu depuis un seul endroit.",
    overview: "Vue d'ensemble",
    users: "Utilisateurs",
    listings: "Annonces",
    reservations: "Reservations",
    leads: "Leads",
    reports: "Signalements",
    agencyOwner: "Agence",
    privateNavigation: "Navigation privee",
    agencyOwnerBody: "Gerez votre agence avec un petit espace prive.",
    viewPublicProfile: "Voir le profil public",
    becomeAnAgency: "Devenir une agence",
    agencyDashboardTitle: "Tableau agence",
    agencyDashboardBody: "Suivez voyages, reservations, places et leads depuis une seule page.",
    agencyProfileTitle: "Profil agence",
    agencyProfileHeroTitle: "Gerez les informations publiques de votre agence.",
    agencyProfileHeroBody: "Mettez a jour le profil vu par les voyageurs avant le contact ou la reservation. Un profil solide inspire confiance.",
    becomeAgencyTitle: "Creez votre profil agence pour debloquer l'espace prive agence.",
    becomeAgencyBody: "Completez ce profil une fois. Apres l'enregistrement, votre compte devient un compte agence.",
    agencyTripsTitle: "Voyages agence",
    agencyTripsHeroTitle: "Creer, modifier et publier des voyages organises.",
    agencyTripsHeroBody: "Gerez dates, prix, capacite et visibilite depuis une seule page.",
    agencyReservationsTitle: "Reservations agence",
    agencyReservationsHeroTitle: "Consultez les reservations voyageurs au meme endroit.",
    agencyReservationsHeroBody: "Suivez les demandes recentes, les places reservees et les coordonnees.",
    agencyLeadsTitle: "Leads agence",
    agencyLeadsHeroTitle: "Suivez les leads et les messages entrants.",
    agencyLeadsHeroBody: "Consultez les intentions de contact et les dernieres conversations de la plateforme."
  }
} as const;
