const UI_TRANSLATIONS = Object.freeze({
  en: Object.freeze({
    nav: Object.freeze({ home: "Home", memberships: "Memberships", passes: "Passes", class_schedule: "Classes", personal_training: "Personal Training", trainers: "Trainers", about: "About", fitness: "Fitness" }),
    actions: Object.freeze({ join: "Join now", schedule: "Schedule", contact: "Contact", language: "Language", whatsapp: "WhatsApp", returnHome: "Return home", requestInfo: "Request information", submit: "Submit request", openMenu: "Open menu", closeMenu: "Close menu" }),
    form: Object.freeze({ name: "Full name", phone: "Phone", email: "Email", whatsapp: "WhatsApp number", message: "Message (optional)", successTitle: "Request received", successBody: "Our team will contact you using the details provided.", error: "Something went wrong. Please try again.", openWhatsApp: "Open WhatsApp" }),
    states: Object.freeze({ notFoundTitle: "Page not found", notFoundBody: "This page is unavailable or has not been published in this language.", loading: "Loading…", noItems: "Approved information is being prepared.", notPublished: "Not published" }),
    footer: Object.freeze({ explore: "Explore", contact: "Contact", rights: "All rights reserved." }),
    units: Object.freeze({ days: "days" }),
  }),
  ar: Object.freeze({
    nav: Object.freeze({ home: "الرئيسية", memberships: "الاشتراكات", passes: "الباقات", class_schedule: "الحصص", personal_training: "التدريب الشخصي", trainers: "المدربون", about: "عن النادي", fitness: "اللياقة" }),
    actions: Object.freeze({ join: "اشترك الآن", schedule: "جدول الحصص", contact: "تواصل معنا", language: "اللغة", whatsapp: "واتساب", returnHome: "العودة للرئيسية", requestInfo: "اطلب التفاصيل", submit: "إرسال الطلب", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة" }),
    form: Object.freeze({ name: "الاسم بالكامل", phone: "رقم الهاتف", email: "البريد الإلكتروني", whatsapp: "رقم واتساب", message: "رسالتك (اختياري)", successTitle: "تم استلام طلبك", successBody: "سيتواصل معك فريقنا باستخدام البيانات التي قدمتها.", error: "تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.", openWhatsApp: "فتح واتساب" }),
    states: Object.freeze({ notFoundTitle: "الصفحة غير متاحة", notFoundBody: "هذه الصفحة غير متاحة أو لم تُنشر بهذه اللغة بعد.", loading: "جارٍ التحميل…", noItems: "نعمل على تجهيز المعلومات المعتمدة.", notPublished: "غير منشور" }),
    footer: Object.freeze({ explore: "استكشف", contact: "تواصل معنا", rights: "جميع الحقوق محفوظة." }),
    units: Object.freeze({ days: "أيام" }),
  }),
  de: Object.freeze({
    nav: Object.freeze({ home: "Startseite", memberships: "Mitgliedschaften", passes: "Pässe", class_schedule: "Kurse", personal_training: "Personal Training", trainers: "Trainer", about: "Über uns", fitness: "Fitness" }),
    actions: Object.freeze({ join: "Jetzt Mitglied werden", schedule: "Kursplan", contact: "Kontakt", language: "Sprache", whatsapp: "WhatsApp", returnHome: "Zur Startseite", requestInfo: "Informationen anfordern", submit: "Anfrage senden", openMenu: "Menü öffnen", closeMenu: "Menü schließen" }),
    form: Object.freeze({ name: "Vor- und Nachname", phone: "Telefon", email: "E-Mail", whatsapp: "WhatsApp-Nummer", message: "Nachricht (optional)", successTitle: "Anfrage erhalten", successBody: "Unser Team meldet sich über die angegebenen Kontaktdaten.", error: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.", openWhatsApp: "WhatsApp öffnen" }),
    states: Object.freeze({ notFoundTitle: "Seite nicht verfügbar", notFoundBody: "Diese Seite ist nicht verfügbar oder wurde in dieser Sprache noch nicht veröffentlicht.", loading: "Wird geladen…", noItems: "Geprüfte Informationen werden derzeit vorbereitet.", notPublished: "Nicht veröffentlicht" }),
    footer: Object.freeze({ explore: "Entdecken", contact: "Kontakt", rights: "Alle Rechte vorbehalten." }),
    units: Object.freeze({ days: "Tage" }),
  }),
  ru: Object.freeze({
    nav: Object.freeze({ home: "Главная", memberships: "Абонементы", passes: "Гостевые визиты", class_schedule: "Занятия", personal_training: "Персональные тренировки", trainers: "Тренеры", about: "О клубе", fitness: "Фитнес" }),
    actions: Object.freeze({ join: "Выбрать абонемент", schedule: "Расписание", contact: "Связаться", language: "Язык", whatsapp: "WhatsApp", returnHome: "На главную", requestInfo: "Узнать подробнее", submit: "Отправить заявку", openMenu: "Открыть меню", closeMenu: "Закрыть меню" }),
    form: Object.freeze({ name: "Имя и фамилия", phone: "Телефон", email: "Эл. почта", whatsapp: "Номер WhatsApp", message: "Сообщение (необязательно)", successTitle: "Заявка получена", successBody: "Наша команда свяжется с вами по указанным контактным данным.", error: "Не удалось отправить заявку. Попробуйте ещё раз.", openWhatsApp: "Открыть WhatsApp" }),
    states: Object.freeze({ notFoundTitle: "Страница недоступна", notFoundBody: "Эта страница недоступна или ещё не опубликована на выбранном языке.", loading: "Загрузка…", noItems: "Проверенная информация готовится к публикации.", notPublished: "Не опубликовано" }),
    footer: Object.freeze({ explore: "Разделы", contact: "Контакты", rights: "Все права защищены." }),
    units: Object.freeze({ days: "дн." }),
  }),
});

export function uiText(locale = "en") {
  return UI_TRANSLATIONS[locale] || UI_TRANSLATIONS.en;
}
