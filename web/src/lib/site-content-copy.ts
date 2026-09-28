import type { ContactInformation } from "./site-content";
const copy = {
  fa: {
    mapUnavailable: "بارگذاری نقشه انجام نشد. از لینک نقشه استفاده کنید.",
    about: "درباره ما",
    contact: "در ارتباط باشیم",
    intro: "برای انتخاب محصول، دریافت اطلاعات یا صحبت درباره پروژه شما، از اینجا شروع کنیم.",
    details: "راه های ارتباطی",
    formTitle: "از پروژه شما بشنویم.",
    formIntro: "پیام خود را بنویسید؛ ما از طریق اطلاعات تماس شما پاسخ میدهیم.",
    name: "نام و نام خانوادگی",
    phone: "شماره تماس",
    email: "ایمیل (اختیاری)",
    subject: "موضوع",
    message: "پیام شما",
    submit: "ارسال پیام",
    sending: "در حال ارسال...",
    success: "پیام شما ثبت شد.",
    error: "ارسال پیام انجام نشد. دوباره تلاش کنید.",
    required: "این فیلد را تکمیل کنید.",
    invalidPhone: "شماره تماس معتبر وارد کنید.",
    invalidEmail: "ایمیل معتبر وارد کنید.",
    invalidMessage: "پیام باید حداقل ۵ کاراکتر باشد.",
    map: "اینجا ما را پیدا کنید.",
    navigate: "باز کردن موقعیت در نقشه",
    mapHint: "برای باز کردن موقعیت، روی نقشه بزنید.",
    webMap: "نمایش نقشه در مرورگر",
    empty: "اطلاعات تماس هنوز ثبت نشده است.",
    noAbout: "محتوای درباره ما به زودی تکمیل میشود.",
  },
  en: {
    mapUnavailable: "The map could not load. Use the browser map link.",
    about: "About us",
    contact: "Let’s connect.",
    intro:
      "Choosing a product, exploring the details, or planning your project? Start a conversation here.",
    details: "Get in touch",
    formTitle: "Tell us about your project.",
    formIntro: "Leave a message and your contact details so we can get back to you.",
    name: "Full name",
    phone: "Phone number",
    email: "Email (optional)",
    subject: "Subject",
    message: "Your message",
    submit: "Send message",
    sending: "Sending…",
    success: "Your message has been received.",
    error: "Could not send your message. Please try again.",
    required: "Please complete this field.",
    invalidPhone: "Enter a valid phone number.",
    invalidEmail: "Enter a valid email address.",
    invalidMessage: "Please write at least 5 characters.",
    map: "Find us here.",
    navigate: "Open location in maps",
    mapHint: "Tap the map to open this location.",
    webMap: "View map in your browser",
    empty: "Contact details have not been added yet.",
    noAbout: "Our story will be available soon.",
  },
  ar: {
    mapUnavailable: "تعذر تحميل الخريطة. استخدم رابط الخريطة.",
    about: "من نحن",
    contact: "لنبق على تواصل.",
    intro: "لاختيار المنتج أو معرفة التفاصيل أو الحديث عن مشروعك، ابدأ من هنا.",
    details: "وسائل التواصل",
    formTitle: "حدثنا عن مشروعك.",
    formIntro: "اكتب رسالتك وبيانات الاتصال لنتمكن من الرد عليك.",
    name: "الاسم الكامل",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني (اختياري)",
    subject: "الموضوع",
    message: "رسالتك",
    submit: "إرسال الرسالة",
    sending: "جار الإرسال...",
    success: "تم استلام رسالتك.",
    error: "تعذر إرسال الرسالة. حاول مرة أخرى.",
    required: "يرجى إكمال هذا الحقل.",
    invalidPhone: "أدخل رقم هاتف صحيحا.",
    invalidEmail: "أدخل بريدا إلكترونيا صحيحا.",
    invalidMessage: "اكتب 5 أحرف على الأقل.",
    map: "تجدنا هنا.",
    navigate: "فتح الموقع في الخرائط",
    mapHint: "اضغط على الخريطة لفتح الموقع.",
    webMap: "عرض الخريطة في المتصفح",
    empty: "لم تتم إضافة معلومات الاتصال بعد.",
    noAbout: "سيتم عرض قصتنا قريبا.",
  },
};
export function siteCopy(locale: string) {
  return copy[locale as keyof typeof copy] ?? copy.en;
}
export function contactHref(item: ContactInformation) {
  if (item.type === "PHONE") return `tel:${item.value.replace(/[ ()-]/g, "")}`;
  if (item.type === "EMAIL") return `mailto:${item.value}`;
  if (item.type === "LINK") {
    try {
      const url = new URL(item.value);
      return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
        ? url.href
        : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}
