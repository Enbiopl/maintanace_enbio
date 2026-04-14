const SUCCESS_TEXTS: Record<string, { title: string; received: string; emailSent: string; backHome: string }> = {
  pl: {
    title: "Sukces! Zgłoszenie przyjęte!",
    received: "Twoje zgłoszenie otrzymało numer",
    emailSent: "Informacje o dalszych krokach oraz podsumowanie wysłaliśmy na podany adres e-mail.",
    backHome: "Powrót do strony głównej",
  },
  en: {
    title: "Success! Request received!",
    received: "Your request has been assigned number",
    emailSent: "We have sent information on next steps and a summary to the email address provided.",
    backHome: "Back to home page",
  },
  pt: {
    title: "Sucesso! Solicitação recebida!",
    received: "Sua solicitação recebeu o número",
    emailSent: "Enviámos informações sobre os próximos passos e um resumo para o e‑mail indicado.",
    backHome: "Voltar para a página inicial",
  },
  es: {
    title: "¡Éxito! ¡Solicitud recibida!",
    received: "Su solicitud ha recibido el número",
    emailSent: "Hemos enviado la información sobre los próximos pasos y un resumen al correo indicado.",
    backHome: "Volver a la página principal",
  },
  fr: {
    title: "Succès ! Demande reçue !",
    received: "Votre demande a reçu le numéro",
    emailSent: "Nous avons envoyé les informations sur les prochaines étapes et un récapitulatif à l’adresse e-mail indiquée.",
    backHome: "Retour à la page d’accueil",
  },
  de: {
    title: "Erfolg! Anfrage eingegangen!",
    received: "Ihre Anfrage hat die Nummer",
    emailSent: "Wir haben die Informationen zu den nächsten Schritten und eine Zusammenfassung an die angegebene E-Mail-Adresse gesendet.",
    backHome: "Zurück zur Startseite",
  },
  it: {
    title: "Successo! Richiesta ricevuta!",
    received: "La sua richiesta ha ricevuto il numero",
    emailSent: "Abbiamo inviato le informazioni sui prossimi passi e un riepilogo all’indirizzo e-mail indicato.",
    backHome: "Torna alla home",
  },
  uk: {
    title: "Успіх! Заявку прийнято!",
    received: "Вашій заявці присвоєно номер",
    emailSent: "Ми надіслали інформацію про подальші кроки та підсумок на вказану електронну адресу.",
    backHome: "Повернутися на головну",
  },
  ru: {
    title: "Успех! Заявка принята!",
    received: "Вашей заявке присвоен номер",
    emailSent: "Мы отправили информацию о дальнейших шагах и итоги на указанный адрес электронной почты.",
    backHome: "Вернуться на главную",
  },
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const params = await searchParams
  const lang = (params.lang && SUCCESS_TEXTS[params.lang] ? params.lang : "en") as keyof typeof SUCCESS_TEXTS
  const t = SUCCESS_TEXTS[lang] ?? SUCCESS_TEXTS.en

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")
  const ticketNumber = `${year}/${month}/${day} ACC${hours}${minutes}${seconds}`

  return (
    <main className="flex min-h-screen flex-col items-center bg-white p-4">
      <div className="w-full max-w-[1280px] mx-auto bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 md:p-16 lg:p-20 text-center mt-12 md:mt-24">
        <h1 className="text-gray-900 w-full max-w-[641px] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight text-center tracking-tight mx-auto mb-8 md:mb-12">
          {t.title}
        </h1>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          {t.emailSent}
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium mb-8 transition-colors"
        >
          {t.backHome}{" "}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <img
          src="/success-illustration.png"
          alt="Success Illustration"
          className="mx-auto mt-8 max-w-full h-auto"
          width="560"
          height="280"
        />
      </div>
    </main>
  )
}
