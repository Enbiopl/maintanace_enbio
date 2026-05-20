"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Paperclip, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AUTOCLAVE_ERRORS,
  ACCESSORIES_ERRORS,
  getErrorLabel,
  getAccessoriesErrorLabel,
} from "@/lib/constants"
import { COUNTRY_NAMES_PL } from "@/lib/form-data"

/** Mapuje wartość z faktury (np. „Polska”) lub klucz Selecta na klucz z COUNTRY_NAMES_PL */
function normalizeCountrySelectKey(raw: string): string {
  const t = (raw || "").trim()
  if (!t) return ""
  if (t in COUNTRY_NAMES_PL) return t
  const found = Object.entries(COUNTRY_NAMES_PL).find(
    ([, plName]) => plName.toLowerCase() === t.toLowerCase()
  )
  return found?.[0] ?? ""
}

/** Wartość bezpieczna dla Radix Select — pusty string gdy brak dopasowania (unikamy crashy przy starych danych). */
function safeCountrySelectValue(raw: string | undefined | null): string {
  if (!raw?.trim()) return ""
  if (raw in COUNTRY_NAMES_PL) return raw
  return normalizeCountrySelectKey(raw)
}

type DeviceInvoiceFields = {
  productName: string
  serialNumber: string
  purchaseDate: string
  companyName: string
  taxId: string
  street: string
  buildingNumber: string
  apartmentNumber: string
  postalCode: string
  city: string
  country: string
  supplierName: string
  invoiceNumber: string
}

/** Jak walidacja „Zapisz” w sekcji urządzenia — jedno źródło prawdy dla auto-rozwinięcia */
function deviceSectionIncomplete(d: DeviceInvoiceFields): boolean {
  const t = (v: string | undefined) => !(v ?? "").trim()
  return (
    t(d.productName) ||
    t(d.serialNumber) ||
    t(d.purchaseDate) ||
    t(d.companyName) ||
    t(d.street) ||
    t(d.buildingNumber) ||
    t(d.apartmentNumber) ||
    t(d.postalCode) ||
    t(d.city) ||
    t(d.country) ||
    t(d.supplierName) ||
    t(d.invoiceNumber)
  )
}

type SummaryLang = "pl" | "en" | "es" | "fr" | "de" | "it" | "uk" | "ru" | "pt"
const SUMMARY_TRANSLATIONS: Record<SummaryLang, Record<string, string>> = {
  pl: {
    "1. Akcesorium": "1. Urządzenie",
  },
  en: {
    "1. Akcesorium": "1. Device",
    "2. Zgłaszane zagadnienie": "2. Reported issue",
    "2. Dane kontaktowe (do przesyłki autoklawu)": "2. Contact details (for autoclave shipment)",
    "3. Zgody": "3. Consents",
    "Rodzaj zgłoszenia": "Type of report",
    "Nazwa produktu": "Product name",
    "Numer seryjny": "Serial number",
    "Data zakupu": "Purchase date",
    "Nazwa firmy": "Company name",
    "NIP": "Tax ID",
    "Ulica": "Street",
    "Numer budynku": "Building number",
    "Numer lokalu": "Apartment number",
    "Kod pocztowy": "Postal code",
    "Miasto": "City",
    "Kraj": "Country",
    "Nazwa wystawcy": "Issuer name",
    "Numer faktury": "Invoice number",
    "Dodane dokumenty": "Added documents",
    "Edytuj dane": "Edit data",
    "Anuluj": "Cancel",
    "Zapisz": "Save",
    "Dodane dokumenty przypisane do urządzeniu": "Documents assigned to the device",
    "Dodane dokumenty przypisane do urządzenia": "Documents assigned to the device",
    "Wskazane błędy": "Indicated errors",
    "Powód reklamacji": "Reason for complaint",
    "Wybierz powód reklamacji": "Select reason for complaint",
    "Wybierz numery błędów": "Select error numbers",
    "Komentarz": "Comment",
    "Brak wskazanych błędów": "No errors indicated",
    "Brak komentarza": "No comment",
    "Powód reklmamacji": "Reason for complaint",
    "Imię i Nazwisko": "Full name",
    "E-mail": "E-mail",
    "Numer telefonu": "Phone number",
    "Numer VAT": "VAT number",
    "Wybierz z listy": "Choose from the list",
    "Inny adres dostawy": "Different delivery address",
    "Nazwa firmy / nazwa": "Company / name",
    "Adres": "Address",
    "Adres c.d.": "Address (cont.)",
    "Zaznacz wszystkie.": "Select all.",
    "Reklamacja akcesoriów": "Accessory complaint",
    "Gwarancyjne": "Warranty",
    "Pogwarancyjne": "Post-warranty",
    "Produkt uszkodzony": "Product damaged",
    "Nie ten przedmiot": "Wrong item",
    "Inny przedmiot": "Other",
    "brak danych": "no data",
    "Polska": "Poland",
    "Niemcy": "Germany",
    "Republika Czeska": "Czech Republic",
    "Czechy": "Czech Republic",
    "Słowacja": "Slovakia",
    "Imię i nazwisko jest wymagane.": "Full name is required.",
    "Adres e-mail jest wymagany.": "E-mail address is required.",
    "Numer telefonu jest wymagany.": "Phone number is required.",
    "Nazwa ulicy jest wymagana.": "Street name is required.",
    "Numer budynku jest wymagany.": "Building number is required.",
    "Kod pocztowy jest wymagany.": "Postal code is required.",
    "Miasto jest wymagane.": "City is required.",
    "Kraj jest wymagany.": "Country is required.",
    "Numer seryjny jest wymagany.": "Serial number is required.",
    "Nazwa produktu jest wymagana.": "Product name is required.",
    "Data zakupu jest wymagana.": "Purchase date is required.",
    "NIP jest wymagany.": "Tax ID is required.",
    "Nazwa wystawcy jest wymagana.": "Issuer name is required.",
    "Numer faktury jest wymagany.": "Invoice number is required.",
    "Numer lokalu jest wymagany.": "Apartment number is required.",
    "Nazwa firmy jest wymagana.": "Company name is required.",
    "Numer VAT jest wymagany.": "VAT number is required.",
    "Wpisz nazwę firmy": "Enter company name",
    "Wpisz numer VAT": "Enter VAT number",
    "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia.":
      "Please accept all required consents before submitting the request.",
    "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.":
      "I agree to the collection and processing of the data provided in this registration if the device was used in a way that does not comply with the operating instructions. Details are set out in the \"Warranty conditions\" document. User instructions and warranty conditions can be found on our List of available documents.",
    "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.":
      "By completing the complaint form, the Customer consents to the processing of personal data for the purpose of the complaint process by Enbio Technology Sp. z o.o., based in Gdynia. The data controller is Enbio Technology Sp. z o.o., based in Gdynia. Personal data are protected in accordance with the Personal Data Protection Act of 29.08.1997 (Journal of Laws No. 101 of 2002, item 926 as amended) in a way that prevents access by third parties. The Customer has the right to access, correct and request deletion or update of their personal data.",
    "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.":
      "I accept the Privacy Policy of Enbio Technology Sp. z o.o., based in Gdynia. I consent to being contacted by representatives of Enbio Technology Sp. z o.o., based in Gdynia, using the contact details I provided in the form.",
  },
  es: {
    "1. Akcesorium": "1. Dispositivo",
    "2. Dane kontaktowe (do przesyłki autoklawu)": "2. Datos de contacto (para envío del autoclave)",
    "3. Zgody": "3. Consentimientos",
    "Rodzaj zgłoszenia": "Tipo de reporte",
    "Nazwa produktu": "Nombre del producto",
    "Numer seryjny": "Número de serie",
    "Data zakupu": "Fecha de compra",
    "Nazwa firmy": "Nombre de la empresa",
    "NIP": "NIF/CIF",
    "Ulica": "Calle",
    "Numer lokalu": "Número de local",
    "Kod pocztowy": "Código postal",
    "Miasto": "Ciudad",
    "Kraj": "País",
    "Nazwa wystawcy": "Nombre del emisor",
    "Numer faktury": "Número de factura",
    "Dodane dokumenty": "Documentos añadidos",
    "Edytuj dane": "Editar datos",
    "Anuluj": "Cancelar",
    "Zapisz": "Guardar",
    "Dodane dokumenty przypisane do urządzenia": "Documentos asignados al dispositivo",
    "Wskazane błędy": "Errores indicados",
    "Powód reklamacji": "Motivo de la reclamación",
    "Wybierz powód reklamacji": "Seleccione el motivo",
    "Wybierz numery błędów": "Seleccione los números de error",
    "Komentarz": "Comentario",
    "Brak wskazanych błędów": "Sin errores indicados",
    "Brak komentarza": "Sin comentario",
    "Powód reklmamacji": "Motivo de la reclamación",
    "Imię i Nazwisko": "Nombre y apellidos",
    "E-mail": "Correo electrónico",
    "Numer telefonu": "Teléfono",
    "Numer VAT": "Número VAT",
    "Wybierz z listy": "Elija de la lista",
    "Inny adres dostawy": "Otro dirección de entrega",
    "Nazwa firmy / nazwa": "Empresa / nombre",
    "Adres": "Dirección",
    "Adres c.d.": "Dirección (cont.)",
    "Zaznacz wszystkie.": "Marcar todos.",
    "Reklamacja akcesoriów": "Reclamación de accesorios",
    "Gwarancyjne": "Garantía",
    "Pogwarancyjne": "Posgarantía",
    "Produkt uszkodzony": "Producto dañado",
    "Nie ten przedmiot": "Artículo incorrecto",
    "Inny przedmiot": "Otro",
    "brak danych": "sin datos",
    "Polska": "Polonia",
    "Niemcy": "Alemania",
    "Republika Czeska": "República Checa",
    "Czechy": "República Checa",
    "Słowacja": "Eslovaquia",
    "Wpisz nazwę firmy": "Introduzca el nombre de la empresa",
    "Wpisz numer VAT": "Introduzca el número de IVA",
    "Nazwa firmy jest wymagana.": "El nombre de la empresa es obligatorio.",
    "Numer VAT jest wymagany.": "El número de IVA es obligatorio.",
    "Kraj jest wymagany.": "El país es obligatorio.",
    "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia.":
      "Por favor acepte todos los consentimientos requeridos antes de enviar la solicitud.",
    "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.":
      "Acepto la recogida y el tratamiento de los datos facilitados en esta inscripción si el dispositivo se ha utilizado de forma no conforme a las instrucciones. Los detalles figuran en el documento \"Condiciones de garantía\". Las instrucciones y condiciones de garantía están en nuestra Lista de documentos disponibles.",
    "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.":
      "Al cumplimentar el formulario de reclamación, el Cliente consiente el tratamiento de datos personales para el proceso de reclamación por Enbio Technology Sp. z o.o., con sede en Gdynia. El responsable del tratamiento es Enbio Technology Sp. z o.o., Gdynia. Los datos se protegen según la ley de protección de datos. El Cliente puede acceder, rectificar y solicitar la supresión o actualización de sus datos.",
    "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.":
      "Acepto la Política de Privacidad de Enbio Technology Sp. z o.o., Gdynia. Consiento el contacto por parte de Enbio Technology Sp. z o.o. mediante los datos facilitados en el formulario.",
  },
  fr: {
    "1. Akcesorium": "1. Appareil",
    "2. Dane kontaktowe (do przesyłki autoklawu)": "2. Coordonnées (pour l’envoi de l’autoclave)",
    "3. Zgody": "3. Consentements",
    "Rodzaj zgłoszenia": "Type de signalement",
    "Nazwa produktu": "Nom du produit",
    "Numer seryjny": "Numéro de série",
    "Data zakupu": "Date d’achat",
    "Nazwa firmy": "Nom de l’entreprise",
    "NIP": "N° fiscal",
    "Ulica": "Rue",
    "Numer lokalu": "N° d’appartement",
    "Kod pocztowy": "Code postal",
    "Miasto": "Ville",
    "Kraj": "Pays",
    "Nazwa wystawcy": "Nom de l’émetteur",
    "Numer faktury": "N° de facture",
    "Dodane dokumenty": "Documents ajoutés",
    "Edytuj dane": "Modifier les données",
    "Anuluj": "Annuler",
    "Zapisz": "Enregistrer",
    "Dodane dokumenty przypisane do urządzenia": "Documents assignés à l’appareil",
    "Wskazane błędy": "Erreurs indiquées",
    "Powód reklamacji": "Motif de réclamation",
    "Wybierz powód reklamacji": "Choisir le motif",
    "Wybierz numery błędów": "Choisir les numéros d’erreur",
    "Komentarz": "Commentaire",
    "Brak wskazanych błędów": "Aucune erreur indiquée",
    "Brak komentarza": "Aucun commentaire",
    "Powód reklmamacji": "Motif de réclamation",
    "Imię i Nazwisko": "Nom et prénom",
    "E-mail": "E-mail",
    "Numer telefonu": "Téléphone",
    "Numer VAT": "N° TVA",
    "Wybierz z listy": "Choisir dans la liste",
    "Inny adres dostawy": "Autre adresse de livraison",
    "Nazwa firmy / nazwa": "Entreprise / nom",
    "Adres": "Adresse",
    "Adres c.d.": "Adresse (suite)",
    "Zaznacz wszystkie.": "Tout sélectionner.",
    "Reklamacja akcesoriów": "Réclamation accessoire",
    "Gwarancyjne": "Garantie",
    "Pogwarancyjne": "Hors garantie",
    "Produkt uszkodzony": "Produit endommagé",
    "Nie ten przedmiot": "Mauvais article",
    "Inny przedmiot": "Autre",
    "brak danych": "aucune donnée",
    "Polska": "Pologne",
    "Niemcy": "Allemagne",
    "Republika Czeska": "République tchèque",
    "Czechy": "République tchèque",
    "Słowacja": "Slovaquie",
    "Wpisz nazwę firmy": "Entrez le nom de l’entreprise",
    "Wpisz numer VAT": "Entrez le n° de TVA",
    "Nazwa firmy jest wymagana.": "Le nom de l’entreprise est obligatoire.",
    "Numer VAT jest wymagany.": "Le numéro de TVA est obligatoire.",
    "Kraj jest wymagany.": "Le pays est obligatoire.",
    "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia.":
      "Veuillez accepter tous les consentements requis avant d’envoyer la demande.",
    "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.":
      "J’accepte la collecte et le traitement des données fournies si l’appareil a été utilisé en dehors des instructions. Détails dans le document « Conditions de garantie ». Liste des documents disponibles sur notre site.",
    "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.":
      "En remplissant le formulaire de réclamation, le Client consent au traitement des données personnelles par Enbio Technology Sp. z o.o., Gdynia. Le responsable du traitement est Enbio Technology Sp. z o.o. Les données sont protégées conformément à la loi. Le Client peut accéder, rectifier et demander la suppression ou la mise à jour de ses données.",
    "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.":
      "J’accepte la Politique de confidentialité d’Enbio Technology Sp. z o.o., Gdynia. J’accepte d’être contacté par Enbio Technology Sp. z o.o. via les coordonnées fournies.",
  },
  de: {
    "1. Akcesorium": "1. Gerät",
    "2. Dane kontaktowe (do przesyłki autoklawu)": "2. Kontaktdaten (für Autoklavversand)",
    "3. Zgody": "3. Einwilligungen",
    "Rodzaj zgłoszenia": "Art der Meldung",
    "Nazwa produktu": "Produktname",
    "Numer seryjny": "Seriennummer",
    "Data zakupu": "Kaufdatum",
    "Nazwa firmy": "Firmenname",
    "NIP": "Steuer-ID",
    "Ulica": "Straße",
    "Numer lokalu": "Wohnungsnummer",
    "Kod pocztowy": "Postleitzahl",
    "Miasto": "Stadt",
    "Kraj": "Land",
    "Nazwa wystawcy": "Name des Ausstellers",
    "Numer faktury": "Rechnungsnummer",
    "Dodane dokumenty": "Angehängte Dokumente",
    "Edytuj dane": "Daten bearbeiten",
    "Anuluj": "Abbrechen",
    "Zapisz": "Speichern",
    "Dodane dokumenty przypisane do urządzenia": "Dem Gerät zugeordnete Dokumente",
    "Wskazane błędy": "Angegebene Fehler",
    "Powód reklamacji": "Reklamationsgrund",
    "Wybierz powód reklamacji": "Grund wählen",
    "Wybierz numery błędów": "Fehlernummern wählen",
    "Komentarz": "Kommentar",
    "Brak wskazanych błędów": "Keine Fehler angegeben",
    "Brak komentarza": "Kein Kommentar",
    "Powód reklmamacji": "Reklamationsgrund",
    "Imię i Nazwisko": "Vor- und Nachname",
    "E-mail": "E-Mail",
    "Numer telefonu": "Telefonnummer",
    "Numer VAT": "USt-IdNr.",
    "Wybierz z listy": "Aus der Liste wählen",
    "Inny adres dostawy": "Andere Lieferadresse",
    "Nazwa firmy / nazwa": "Firma / Name",
    "Adres": "Adresse",
    "Adres c.d.": "Adresse (Forts.)",
    "Zaznacz wszystkie.": "Alle auswählen.",
    "Reklamacja akcesoriów": "Zubehörreklamation",
    "Gwarancyjne": "Garantie",
    "Pogwarancyjne": "Außerhalb der Garantie",
    "Produkt uszkodzony": "Produkt beschädigt",
    "Nie ten przedmiot": "Falscher Artikel",
    "Inny przedmiot": "Sonstiges",
    "brak danych": "keine Daten",
    "Polska": "Polen",
    "Niemcy": "Deutschland",
    "Republika Czeska": "Tschechische Republik",
    "Czechy": "Tschechische Republik",
    "Słowacja": "Slowakei",
    "Wpisz nazwę firmy": "Firmenname eingeben",
    "Wpisz numer VAT": "USt-IdNr. eingeben",
    "Nazwa firmy jest wymagana.": "Firmenname ist erforderlich.",
    "Numer VAT jest wymagany.": "USt-IdNr. ist erforderlich.",
    "Kraj jest wymagany.": "Land ist erforderlich.",
    "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia.":
      "Bitte akzeptieren Sie alle erforderlichen Einwilligungen vor dem Absenden.",
    "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.":
      "Ich stimme der Erhebung und Verarbeitung der Daten zu, sofern das Gerät nicht gemäß der Bedienungsanleitung verwendet wurde. Details siehe Dokument „Garantiebedingungen\".",
    "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.":
      "Mit dem Ausfüllen des Reklamationsformulars willigt der Kunde in die Verarbeitung personenbezogener Daten durch Enbio Technology Sp. z o.o., Gdynia, ein. Verantwortlicher ist Enbio Technology Sp. z o.o. Der Kunde hat das Recht auf Zugang, Berichtigung und Löschung seiner Daten.",
    "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.":
      "Ich akzeptiere die Datenschutzrichtlinie von Enbio Technology Sp. z o.o., Gdynia. Ich stimme dem Kontakt durch Enbio Technology Sp. z o.o. über die im Formular angegebenen Daten zu.",
  },
  it: {
    "1. Akcesorium": "1. Dispositivo",
    "2. Dane kontaktowe (do przesyłki autoklawu)": "2. Dati di contatto (per spedizione autoclave)",
    "3. Zgody": "3. Consensi",
    "Rodzaj zgłoszenia": "Tipo di segnalazione",
    "Nazwa produktu": "Nome prodotto",
    "Numer seryjny": "Numero di serie",
    "Data zakupu": "Data di acquisto",
    "Nazwa firmy": "Ragione sociale",
    "NIP": "P.IVA",
    "Ulica": "Via",
    "Numer lokalu": "Numero civico",
    "Kod pocztowy": "CAP",
    "Miasto": "Città",
    "Kraj": "Paese",
    "Nazwa wystawcy": "Nome emittente",
    "Numer faktury": "Numero fattura",
    "Dodane dokumenty": "Documenti allegati",
    "Edytuj dane": "Modifica dati",
    "Anuluj": "Annulla",
    "Zapisz": "Salva",
    "Dodane dokumenty przypisane do urządzenia": "Documenti assegnati al dispositivo",
    "Wskazane błędy": "Errori indicati",
    "Powód reklamacji": "Motivo del reclamo",
    "Wybierz powód reklamacji": "Seleziona il motivo",
    "Wybierz numery błędów": "Seleziona i numeri di errore",
    "Komentarz": "Commento",
    "Brak wskazanych błędów": "Nessun errore indicato",
    "Brak komentarza": "Nessun commento",
    "Powód reklmamacji": "Motivo del reclamo",
    "Imię i Nazwisko": "Nome e cognome",
    "E-mail": "E-mail",
    "Numer telefonu": "Telefono",
    "Numer VAT": "P.IVA",
    "Wybierz z listy": "Scegli dall’elenco",
    "Inny adres dostawy": "Altro indirizzo di consegna",
    "Nazwa firmy / nazwa": "Azienda / nome",
    "Adres": "Indirizzo",
    "Adres c.d.": "Indirizzo (segue)",
    "Zaznacz wszystkie.": "Seleziona tutti.",
    "Reklamacja akcesoriów": "Reclamo accessorio",
    "Gwarancyjne": "Garanzia",
    "Pogwarancyjne": "Fuori garanzia",
    "Produkt uszkodzony": "Prodotto danneggiato",
    "Nie ten przedmiot": "Articolo errato",
    "Inny przedmiot": "Altro",
    "brak danych": "nessun dato",
    "Polska": "Polonia",
    "Niemcy": "Germania",
    "Republika Czeska": "Repubblica Ceca",
    "Czechy": "Repubblica Ceca",
    "Słowacja": "Slovacchia",
    "Wpisz nazwę firmy": "Inserire ragione sociale",
    "Wpisz numer VAT": "Inserire partita IVA",
    "Nazwa firmy jest wymagana.": "Ragione sociale obbligatoria.",
    "Numer VAT jest wymagany.": "Partita IVA obbligatoria.",
    "Kraj jest wymagany.": "Il paese è obbligatorio.",
    "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia.":
      "Si prega di accettare tutti i consensi richiesti prima dell’invio.",
    "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.":
      "Acconsento alla raccolta e al trattamento dei dati se il dispositivo è stato usato in modo non conforme alle istruzioni. Dettagli nel documento \"Condizioni di garanzia\".",
    "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.":
      "Compilando il modulo di reclamo, il Cliente consente al trattamento dei dati personali da parte di Enbio Technology Sp. z o.o., Gdynia. Titolare del trattamento: Enbio Technology Sp. z o.o. Il Cliente può accedere, rettificare e chiedere la cancellazione dei propri dati.",
    "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.":
      "Accetto l’Informativa sulla privacy di Enbio Technology Sp. z o.o., Gdynia. Consento al contatto da parte di Enbio Technology Sp. z o.o. tramite i dati forniti nel modulo.",
  },
  uk: {
    "1. Akcesorium": "1. Пристрій",
    "2. Dane kontaktowe (do przesyłki autoklawu)": "2. Контактні дані (для відправки автоклава)",
    "3. Zgody": "3. Згоди",
    "Rodzaj zgłoszenia": "Тип звернення",
    "Nazwa produktu": "Назва продукту",
    "Numer seryjny": "Серійний номер",
    "Data zakupu": "Дата покупки",
    "Nazwa firmy": "Назва компанії",
    "NIP": "Податковий номер",
    "Ulica": "Вулиця",
    "Numer lokalu": "Номер помешкання",
    "Kod pocztowy": "Поштовий індекс",
    "Miasto": "Місто",
    "Kraj": "Країна",
    "Nazwa wystawcy": "Назва емітента",
    "Numer faktury": "Номер рахунку",
    "Dodane dokumenty": "Додані документи",
    "Edytuj dane": "Редагувати дані",
    "Anuluj": "Скасувати",
    "Zapisz": "Зберегти",
    "Dodane dokumenty przypisane do urządzenia": "Документи, призначені пристрою",
    "Wskazane błędy": "Вказані помилки",
    "Powód reklamacji": "Причина скарги",
    "Wybierz powód reklamacji": "Оберіть причину",
    "Wybierz numery błędów": "Оберіть номери помилок",
    "Komentarz": "Коментар",
    "Brak wskazanych błędów": "Немає вказаних помилок",
    "Brak komentarza": "Немає коментаря",
    "Powód reklmamacji": "Причина скарги",
    "Imię i Nazwisko": "Ім'я та прізвище",
    "E-mail": "E-mail",
    "Numer telefonu": "Номер телефону",
    "Numer VAT": "ІПН",
    "Wybierz z listy": "Оберіть зі списку",
    "Inny adres dostawy": "Інша адреса доставки",
    "Nazwa firmy / nazwa": "Компанія / назва",
    "Adres": "Адреса",
    "Adres c.d.": "Адреса (продовж.)",
    "Zaznacz wszystkie.": "Вибрати всі.",
    "Reklamacja akcesoriów": "Рекламація аксесуара",
    "Gwarancyjne": "Гарантія",
    "Pogwarancyjne": "Після гарантії",
    "Produkt uszkodzony": "Пошкоджений товар",
    "Nie ten przedmiot": "Не той товар",
    "Inny przedmiot": "Інше",
    "brak danych": "немає даних",
    "Polska": "Польща",
    "Niemcy": "Німеччина",
    "Republika Czeska": "Чеська Республіка",
    "Czechy": "Чеська Республіка",
    "Słowacja": "Словаччина",
    "Wpisz nazwę firmy": "Введіть назву компанії",
    "Wpisz numer VAT": "Введіть номер ПДВ",
    "Nazwa firmy jest wymagana.": "Назва компанії обов'язкова.",
    "Numer VAT jest wymagany.": "Номер ПДВ обов'язковий.",
    "Kraj jest wymagany.": "Країна обов'язкова.",
    "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia.":
      "Будь ласка, прийміть усі необхідні згоди перед надсиланням.",
    "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.":
      "Погоджуюсь на збір та обробку даних, якщо пристрій використовувався не згідно з інструкцією. Деталі в документі «Умови гарантії».",
    "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.":
      "Заповнюючи форму скарги, Клієнт погоджується на обробку персональних даних Enbio Technology Sp. z o.o., Гдиня. Адміністратор: Enbio Technology Sp. z o.o. Клієнт має право доступу, виправлення та видалення даних.",
    "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.":
      "Приймаю Політику конфіденційності Enbio Technology Sp. z o.o., Гдиня. Погоджуюсь на контакт з представниками Enbio Technology Sp. z o.o. за вказаними в формі даними.",
  },
  ru: {
    "1. Akcesorium": "1. Устройство",
    "2. Dane kontaktowe (do przesyłki autoklawu)": "2. Контактные данные (для отправки автоклава)",
    "3. Zgody": "3. Согласия",
    "Rodzaj zgłoszenia": "Тип обращения",
    "Nazwa produktu": "Название продукта",
    "Numer seryjny": "Серийный номер",
    "Data zakupu": "Дата покупки",
    "Nazwa firmy": "Название компании",
    "NIP": "Налоговый номер",
    "Ulica": "Улица",
    "Numer lokalu": "Номер помещения",
    "Kod pocztowy": "Почтовый индекс",
    "Miasto": "Город",
    "Kraj": "Страна",
    "Nazwa wystawcy": "Название эмитента",
    "Numer faktury": "Номер счёта",
    "Dodane dokumenty": "Добавленные документы",
    "Edytuj dane": "Редактировать данные",
    "Anuluj": "Отмена",
    "Zapisz": "Сохранить",
    "Dodane dokumenty przypisane do urządzenia": "Документы, прикреплённые к устройству",
    "Wskazane błędy": "Указанные ошибки",
    "Powód reklamacji": "Причина жалобы",
    "Wybierz powód reklamacji": "Выберите причину",
    "Wybierz numery błędów": "Выберите номера ошибок",
    "Komentarz": "Комментарий",
    "Brak wskazanych błędów": "Нет указанных ошибок",
    "Brak komentarza": "Нет комментария",
    "Powód reklmamacji": "Причина жалобы",
    "Imię i Nazwisko": "Имя и фамилия",
    "E-mail": "Эл. почта",
    "Numer telefonu": "Номер телефона",
    "Numer VAT": "ИНН",
    "Wybierz z listy": "Выберите из списка",
    "Inny adres dostawy": "Другой адрес доставки",
    "Nazwa firmy / nazwa": "Компания / название",
    "Adres": "Адрес",
    "Adres c.d.": "Адрес (продолж.)",
    "Zaznacz wszystkie.": "Выбрать все.",
    "Reklamacja akcesoriów": "Рекламация аксессуара",
    "Gwarancyjne": "Гарантия",
    "Pogwarancyjne": "После гарантии",
    "Produkt uszkodzony": "Повреждённый товар",
    "Nie ten przedmiot": "Не тот товар",
    "Inny przedmiot": "Другое",
    "brak danych": "нет данных",
    "Polska": "Польша",
    "Niemcy": "Германия",
    "Republika Czeska": "Чешская Республика",
    "Czechy": "Чешская Республика",
    "Słowacja": "Словакия",
    "Wpisz nazwę firmy": "Введите название компании",
    "Wpisz numer VAT": "Введите номер НДС",
    "Nazwa firmy jest wymagana.": "Название компании обязательно.",
    "Numer VAT jest wymagany.": "Номер НДС обязателен.",
    "Kraj jest wymagany.": "Страна обязательна.",
    "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia.":
      "Пожалуйста, примите все необходимые согласия перед отправкой.",
    "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.":
      "Согласен на сбор и обработку данных, если устройство использовалось не по инструкции. Подробности в документе «Условия гарантии».",
    "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.":
      "Заполняя форму жалобы, Клиент соглашается на обработку персональных данных Enbio Technology Sp. z o.o., Гдыня. Администратор: Enbio Technology Sp. z o.o. Клиент имеет право доступа, исправления и удаления данных.",
    "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.":
      "Принимаю Политику конфиденциальности Enbio Technology Sp. z o.o., Гдыня. Согласен на контакт с представителями Enbio Technology Sp. z o.o. по указанным в форме данным.",
  },
  pt: {
    "1. Akcesorium": "1. Dispositivo",
    "2. Dane kontaktowe (do przesyłki autoklawu)": "2. Dados de contacto (para envio do autoclave)",
    "3. Zgody": "3. Consentimentos",
    "Rodzaj zgłoszenia": "Tipo de pedido",
    "Nazwa produktu": "Nome do produto",
    "Numer seryjny": "Número de série",
    "Data zakupu": "Data de compra",
    "Nazwa firmy": "Nome da empresa",
    "NIP": "NIF",
    "Ulica": "Rua",
    "Numer lokalu": "Número de apartamento",
    "Kod pocztowy": "Código postal",
    "Miasto": "Cidade",
    "Kraj": "País",
    "Nazwa wystawcy": "Nome do emissor",
    "Numer faktury": "Número da fatura",
    "Dodane dokumenty": "Documentos adicionados",
    "Edytuj dane": "Editar dados",
    "Anuluj": "Cancelar",
    "Zapisz": "Guardar",
    "Dodane dokumenty przypisane do urządzeniu": "Documentos associados ao dispositivo",
    "Dodane dokumenty przypisane do urządzenia": "Documentos associados ao dispositivo",
    "Wskazane błędy": "Erros indicados",
    "Powód reklamacji": "Motivo da reclamação",
    "Wybierz powód reklamacji": "Selecione o motivo da reclamação",
    "Wybierz numery błędów": "Selecione os números de erro",
    "Komentarz": "Comentário",
    "Brak wskazanych błędów": "Sem erros indicados",
    "Brak komentarza": "Sem comentário",
    "Powód reklmamacji": "Motivo da reclamação",
    "Imię i Nazwisko": "Nome e apelido",
    "E-mail": "E‑mail",
    "Numer telefonu": "Número de telefone",
    "Numer VAT": "NIF",
    "Wybierz z listy": "Escolha da lista",
    "Inny adres dostawy": "Outro endereço de entrega",
    "Nazwa firmy / nazwa": "Empresa / nome",
    "Adres": "Endereço",
    "Adres c.d.": "Endereço (cont.)",
    "Zaznacz wszystkie.": "Selecionar todos.",
    "Reklamacja akcesoriów": "Reclamação de acessórios",
    "Gwarancyjne": "Em garantia",
    "Pogwarancyjne": "Fora de garantia",
    "Produkt uszkodzony": "Produto danificado",
    "Nie ten przedmiot": "Produto incorreto",
    "Inny przedmiot": "Outro produto",
    "brak danych": "sem dados",
    "Polska": "Polónia",
    "Niemcy": "Alemanha",
    "Republika Czeska": "República Checa",
    "Czechy": "República Checa",
    "Słowacja": "Eslováquia",
    "Imię i nazwisko jest wymagane.": "O nome e apelido são obrigatórios.",
    "Adres e-mail jest wymagany.": "O endereço de e‑mail é obrigatório.",
    "Numer telefonu jest wymagany.": "O número de telefone é obrigatório.",
    "Nazwa ulicy jest wymagana.": "O nome da rua é obrigatório.",
    "Numer budynku jest wymagany.": "O número da porta é obrigatório.",
    "Kod pocztowy jest wymagany.": "O código postal é obrigatório.",
    "Miasto jest wymagane.": "A cidade é obrigatória.",
    "Kraj jest wymagany.": "O país é obrigatório.",
    "Numer seryjny jest wymagany.": "O número de série é obrigatório.",
    "Nazwa firmy jest wymagana.": "O nome da empresa é obrigatório.",
    "Numer VAT jest wymagany.": "O número de IVA é obrigatório.",
    "Wpisz nazwę firmy": "Introduza o nome da empresa",
    "Wpisz numer VAT": "Introduza o NIF",
    "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia.":
      "Aceite todos os consentimentos obrigatórios antes de enviar o pedido.",
    "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.":
      "Concordo com a recolha e o tratamento dos dados fornecidos neste registo caso o dispositivo tenha sido utilizado em desacordo com o manual de utilização. Os detalhes encontram‑se no documento \"Condições de garantia\". O manual de utilização e as condições de garantia estão disponíveis na nossa Lista de documentos disponíveis.",
    "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.":
      "Ao preencher o formulário de reclamação, o Cliente consente o tratamento dos dados pessoais para fins de realização do processo de reclamação pela Enbio Technology Sp. z o.o., com sede em Gdynia. O responsável pelo tratamento é a Enbio Technology Sp. z o.o., com sede em Gdynia. Os dados pessoais são protegidos de forma a impedir o acesso por terceiros. O Cliente tem o direito de aceder, corrigir e solicitar a eliminação ou atualização dos seus dados.",
    "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.":
      "Aceito a Política de Privacidade da Enbio Technology Sp. z o.o., com sede em Gdynia. Concordo em ser contactado pelos representantes da Enbio Technology Sp. z o.o. através dos dados de contacto fornecidos no formulário.",
  },
}
function tr(lang: string, text: string): string {
  if (lang === "pl") return text
  const L = SUMMARY_TRANSLATIONS[lang as SummaryLang]
  return (L && L[text]) || SUMMARY_TRANSLATIONS.en[text] || text
}

const formatCountryLabel = (value: string) => {
  if (!value) return ""
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

interface SummaryFormProps {
  formData: any
  summaryData?: any
  onDataChange?: (data: any) => void
  onBack: () => void
  onSubmit: () => void
  selectedCategory?: string | null
  onConsentsValidChange?: (valid: boolean) => void
  language?: string
}

export default function SummaryForm({ formData, summaryData, onDataChange, onBack, onSubmit, selectedCategory, onConsentsValidChange, language = "en" }: SummaryFormProps) {
  const router = useRouter()

  // ✅ Pewne ustalenie kategorii (prop → formData → localStorage)
  const resolvedCategory =
    selectedCategory ??
    formData?.selectedCategory ??
    (typeof window !== "undefined" ? localStorage.getItem("selectedCategory") : null);

  const isAccessory = resolvedCategory === "accessory";

  // ✅ Lista do Selecta z twardym fallbackiem
  const errorsList = isAccessory
    ? (ACCESSORIES_ERRORS && ACCESSORIES_ERRORS.length ? ACCESSORIES_ERRORS : [])
    : (AUTOCLAVE_ERRORS && AUTOCLAVE_ERRORS.length ? AUTOCLAVE_ERRORS : []);
    
  // Bezpieczne mapowanie ID -> label
  const accessoryLabel = (id?: string) =>
    (typeof getAccessoriesErrorLabel === "function" ? getAccessoriesErrorLabel(id as string) : undefined) ??
    ACCESSORIES_ERRORS?.find(e => e.id === id)?.label ??
    id ?? "";


  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [deviceData, setDeviceData] = useState({
    type: "", // This will be updated based on serviceType from formData
    productName: "", // New field for accessory product name
    serialNumber: "",
    purchaseDate: "",
    companyName: "",
    taxId: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
    postalCode: "",
    city: "",
    country: "",
    supplierName: "",
    invoiceNumber: "",
    attachedDocuments: [] as string[], // Changed to array of strings for file names
  })

  const [issueData, setIssueData] = useState({
    attachedIssueDocuments: [] as string[], // Changed to array of strings for file names
    reportedErrors: [] as string[],
    comments: "",
  })

  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
    postalCode: "",
    city: "",
    country: "",
    companyName: "",
    vatNumber: "",
  })

  const [deliveryData, setDeliveryData] = useState({
    otherDeliveryAddress: false,
    companyName: "",
    address: "",
    address2: "",
    postalCode: "",
    city: "",
    country: "",
  })

  const [consents, setConsents] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  })

  const [originalDeviceData, setOriginalDeviceData] = useState(deviceData)
  const [originalIssueData, setOriginalIssueData] = useState(issueData)
  const [originalContactData, setOriginalContactData] = useState(contactData)
  const [originalDeliveryData, setOriginalDeliveryData] = useState(deliveryData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  /** Po pierwszym wczytaniu localStorage — unikamy migawki „Anuluj” na pustych danych przed hydratacją */
  const [summaryHydrated, setSummaryHydrated] = useState(false)
  
  // Sprawdź, czy to formularz pogwarancyjny
  const isPostWarranty = (() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("contactData")
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          return parsed.serviceType === "post-warranty"
        } catch {
          return false
        }
      }
    }
    return false
  })()

  // Wspólne style dla wszystkich inputów i selectów
  const getInputStyles = (value: string) => {
    const baseStyles = "h-[52px] rounded-lg pt-2 pr-5 pb-2 pl-4 transition-colors duration-200 text-base border-solid"
    const filledStyles = "bg-white border-gray-300 text-gray-900"
    const emptyStyles = "bg-gray-50 border-gray-300 text-gray-600 placeholder:text-gray-500"
    const hoverFocusStyles = "hover:bg-white hover:border-white focus:bg-gray-50 focus:border-white"
    return `${baseStyles} ${value ? filledStyles : emptyStyles} ${hoverFocusStyles}`
  }

  // Pobierz dane z localStorage przy montowaniu komponentu
  useEffect(() => {
    const storedContactData = localStorage.getItem("contactData")
    console.log("Odczytane dane z localStorage:", storedContactData)

    if (storedContactData) {
      try {
        const parsedData = JSON.parse(storedContactData)
        console.log("Sparsowane dane:", parsedData)

        // Common contact data
        setContactData({
          name: parsedData.name || "",
          email: parsedData.email || "",
          phone: parsedData.phone || "",
          street: parsedData.street || "",
          buildingNumber: parsedData.buildingNumber || "",
          apartmentNumber: parsedData.apartmentNumber || "",
          postalCode: parsedData.postalCode || "",
          city: parsedData.city || "",
          country: parsedData.country || "",
          companyName: parsedData.companyName || "",
          vatNumber: parsedData.vatNumber || "",
        })

        // Delivery address data
        if (parsedData.otherDeliveryAddress) {
          setDeliveryData({
            otherDeliveryAddress: true,
            companyName: parsedData.deliveryCompanyName || "",
            address: parsedData.deliveryAddress || "",
            address2: parsedData.deliveryAddress2 || "",
            postalCode: parsedData.deliveryPostalCode || "",
            city: parsedData.deliveryCity || "",
            country: parsedData.deliveryCountry || "",
          })
        }

        // Conditional data for device and issue based on category
          setDeviceData((prev) => {
            const newDeviceData = {
              ...prev,
              type: parsedData.selectedCategory === "accessory"
                ? "Reklamacja akcesoriów"
                : parsedData.serviceType === "warranty"
                  ? "Gwarancyjne"
                  : "Pogwarancyjne",
              serialNumber: parsedData.serialNumber || "",
              purchaseDate: parsedData.purchaseDate || "",
              supplierName: parsedData.dealer || "",
              attachedDocuments: parsedData.attachedDocuments ? [parsedData.attachedDocuments] : [],
              productName: parsedData.productLabel || "", // Autoclave product name
            }
            // Handle invoiceData if present (autoclave specific)
            if (parsedData.invoiceData) {
              let invoiceData = parsedData.invoiceData
              if (invoiceData.success === true && invoiceData.data) {
                invoiceData = invoiceData.data
              }
              Object.assign(newDeviceData, {
                companyName: invoiceData?.nabywca?.nazwa_firmy || newDeviceData.companyName,
                street: invoiceData?.nabywca?.ulica || newDeviceData.street,
                buildingNumber: invoiceData?.nabywca?.numer_budynku || newDeviceData.buildingNumber,
                apartmentNumber:
                  invoiceData?.nabywca?.numer_lokalu !== "brak danych"
                    ? invoiceData?.nabywca?.numer_lokalu
                    : newDeviceData.apartmentNumber,
                city: invoiceData?.nabywca?.miasto || newDeviceData.city,
                postalCode: invoiceData?.nabywca?.kod_pocztowy || newDeviceData.postalCode,
                country:
                  normalizeCountrySelectKey(invoiceData?.nabywca?.kraj || "") ||
                  normalizeCountrySelectKey(newDeviceData.country) ||
                  newDeviceData.country,
                taxId: invoiceData?.nabywca?.nip || newDeviceData.taxId,
                purchaseDate: invoiceData?.nabywca?.data_faktury || newDeviceData.purchaseDate,
                supplierName: invoiceData?.wystawca?.nazwa_firmy || newDeviceData.supplierName,
                invoiceNumber: invoiceData?.wystawca?.numer_faktury || newDeviceData.invoiceNumber,
              })
            }
            return newDeviceData
          })

          setIssueData((prev) => ({
            ...prev,
            reportedErrors:
              resolvedCategory === "accessory"
                ? (parsedData.accessoryComplaintReason ? [parsedData.accessoryComplaintReason] : [])
                : (parsedData.selectedErrorCodes || []),
            comments: parsedData.issueDescription || "", // Autoclave comment
            attachedIssueFolderZipName: parsedData.uploadedFolderZipName || "",
            attachedIssueDocuments: [parsedData.attachedIssueDocuments, parsedData.uploadedFolder],
          }))
          // Zainicjalizuj rodzica bieżącymi danymi po odczycie

          const mergedFromStorage = {
            ...(summaryData ?? {}),
            // --- Dane ogólne i identyfikacyjne formularza ---
            form: deviceData.type, // Unikalny identyfikator formularza, jeśli jest potrzebny
            product: deviceData.productName,
            submissionDate: new Date().toISOString().slice(0, 10), // Ukryte pole z dzisiejszą datą
          
            // --- Dane do faktury ---
            invoiceCompanyName: deviceData.companyName,
            invoiceStreet: deviceData.street,
            invoiceBuildingNumber: deviceData.buildingNumber,
            invoiceApartmentNumber: deviceData.apartmentNumber,
            invoiceCity: deviceData.city,
            pinvoicepostalCode: deviceData.postalCode,
            invoiceCountry: deviceData.country,
            invoiceTaxId: deviceData.taxId,
            invoicePurchaseDate: deviceData.purchaseDate,
            invoiceSupplierName: deviceData.supplierName,
            invoiceNumber: deviceData.invoiceNumber,
          
            // --- Dane do dostawy (opcjonalne) ---
            deliveryCompanyName: deliveryData.companyName || '',
            deliveryAddress1: deliveryData.address || '',
            deliveryAddress2: deliveryData.address2 || '',
            deliveryPostalCode: deliveryData.postalCode || '',
            deliveryCity: deliveryData.city || '',
            deliveryCountry: deliveryData.country || '',
            
            // --- Dane osoby kontaktowej ---
            name: contactData.name || "",
            email: contactData.email || "",
            phone: contactData.phone || "",
            street: contactData.street || "",
            buildingNumber: contactData.buildingNumber || "",
            apartmentNumber: contactData.apartmentNumber || "",
            postalCode: contactData.postalCode || "",
            city: contactData.city || "",
            country: contactData.country || "",
            companyName: contactData.companyName || "",
            vatNumber: contactData.vatNumber || "",
            
            // --- Dane zgłoszenia serwisowego ---
            autoclaveSerialNumber: issueData.attachedIssueFolderZipName,
            repairType: deviceData.type,
            errorCode: issueData.reportedErrors,
            problemDescription: issueData.comments,
          
            // --- Zgody (checkboxy) ---
            repairCostConsent: consents.marketing,
            gdprConsent: consents.terms,
            privacyPolicyConsent: consents.privacy,
            recyclingAccept: consents.marketing,
          
            supplierName: deviceData.supplierName,
            // --- Załączniki (pola typu 'file') ---
            // Stan początkowy ustawiony na 'null', będzie przechowywać obiekt File
            scanDoc1: null,
            mediaAttachment: null, // "Add photo or a movie"
          }
          onDataChange?.(mergedFromStorage)
      } catch (error) {
        console.error("Error parsing contact data from localStorage:", error)
      }
    }
    setSummaryHydrated(true)
  }, [])

  // Zapisuj zmiany do rodzica (np. główny formularz) — pomijane gdy brak callbacku (np. FormContainer)
  useEffect(() => {
    if (!onDataChange) return
    const merged = {
      ...(summaryData ?? {}),
      // --- Dane ogólne i identyfikacyjne formularza ---
      form: deviceData.type,
      product: deviceData.productName,
      submissionDate: new Date().toISOString().slice(0, 10), // Ukryte pole z dzisiejszą datą
    
      // --- Dane do faktury ---
      invoiceCompanyName: deviceData.companyName,
      invoiceStreet: deviceData.street,
      invoiceBuildingNumber: deviceData.buildingNumber,
      invoiceApartmentNumber: deviceData.apartmentNumber,
      invoiceCity: deviceData.city,
      pinvoicepostalCode: deviceData.postalCode,
      invoiceCountry: deviceData.country,
      invoiceTaxId: deviceData.taxId,
      invoicePurchaseDate: deviceData.purchaseDate,
      invoiceSupplierName: deviceData.supplierName,
      invoiceNumber: deviceData.invoiceNumber,
    
      // --- Dane do dostawy (opcjonalne) ---
      deliveryCompanyName: deliveryData.companyName || '',
      deliveryAddress1: deliveryData.address || '',
      deliveryAddress2: deliveryData.address2 || '',
      deliveryPostalCode: deliveryData.postalCode || '',
      deliveryCity: deliveryData.city || '',
      deliveryCountry: deliveryData.country || '',
      
      // --- Dane osoby kontaktowej ---
      name: contactData.name || "",
      email: contactData.email || "",
      phone: contactData.phone || "",
      street: contactData.street || "",
      buildingNumber: contactData.buildingNumber || "",
      apartmentNumber: contactData.apartmentNumber || "",
      postalCode: contactData.postalCode || "",
      city: contactData.city || "",
      country: contactData.country || "",
      companyName: contactData.companyName || "",
      vatNumber: contactData.vatNumber || "",
      
      // --- Dane zgłoszenia serwisowego ---
      autoclaveSerialNumber: issueData.attachedIssueFolderZipName,
      repairType: deviceData.type,
      errorCode: issueData.reportedErrors,
      problemDescription: issueData.comments,
    
      // --- Zgody (checkboxy) ---
      repairCostConsent: consents.marketing,
      gdprConsent: consents.terms,
      privacyPolicyConsent: consents.privacy,
      recyclingAccept: consents.marketing,
    
      supplierName: deviceData.supplierName,
      // --- Załączniki (pola typu 'file') ---
      // Stan początkowy ustawiony na 'null', będzie przechowywać obiekt File
      scanDoc1: null,
      mediaAttachment: null, // "Add photo or a movie"
    }
    onDataChange(merged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceData, issueData, contactData, deliveryData])

  const handleLocalSubmit = () => {
    if (!(consents.terms && consents.privacy && consents.marketing)) {
      alert(tr(language, "Proszę zaakceptować wszystkie wymagane zgody przed wysłaniem zgłoszenia."))
      return
    }

    setIsSubmitting(true)
    // onSubmit() // Call the parent onSubmit
  }

  // Informuj rodzica o kompletności wymaganych zgód
  useEffect(() => {
    const valid = !!(consents.terms && consents.privacy && consents.marketing)
    onConsentsValidChange && onConsentsValidChange(valid)
  }, [consents, onConsentsValidChange])

  const handleEdit = (section: string) => {
    // Zapisz oryginalne dane przed wejściem w tryb edycji
    if (section === "device") {
      setOriginalDeviceData({ ...deviceData })
      setDeviceData((prev) => ({
        ...prev,
        country: normalizeCountrySelectKey(prev.country) || prev.country,
      }))
    } else if (section === "issue") {
      setOriginalIssueData({ ...issueData })
    } else if (section === "contact") {
      setOriginalContactData({ ...contactData })
      setOriginalDeliveryData({ ...deliveryData })
    }

    setEditingSection(section)
  }

  const handleSave = (section: string) => {
    if (section === "device") {
      const errors: string[] = []
      const d = deviceData
      if (!d.productName?.trim()) errors.push(tr(language, "Nazwa produktu jest wymagana."))
      if (!d.serialNumber?.trim()) errors.push(tr(language, "Numer seryjny jest wymagany."))
      if (!d.purchaseDate?.trim()) errors.push(tr(language, "Data zakupu jest wymagana."))
      if (!d.companyName?.trim()) errors.push(tr(language, "Nazwa firmy jest wymagana."))
      if (!d.street?.trim()) errors.push(tr(language, "Nazwa ulicy jest wymagana."))
      if (!d.buildingNumber?.trim()) errors.push(tr(language, "Numer budynku jest wymagany."))
      if (!d.apartmentNumber?.trim()) errors.push(tr(language, "Numer lokalu jest wymagany."))
      if (!d.postalCode?.trim()) errors.push(tr(language, "Kod pocztowy jest wymagany."))
      if (!d.city?.trim()) errors.push(tr(language, "Miasto jest wymagane."))
      if (!d.country?.trim()) errors.push(tr(language, "Kraj jest wymagany."))
      if (!d.supplierName?.trim()) errors.push(tr(language, "Nazwa wystawcy jest wymagana."))
      if (!d.invoiceNumber?.trim()) errors.push(tr(language, "Numer faktury jest wymagany."))
      if (errors.length > 0) {
        alert(errors.join("\n"))
        return
      }
    }

    if (section === "contact") {
      const errors: string[] = []

      if (!contactData.name || !contactData.name.trim()) {
        errors.push(tr(language, "Imię i nazwisko jest wymagane."))
      }
      if (!contactData.email || !contactData.email.trim()) {
        errors.push(tr(language, "Adres e-mail jest wymagany."))
      }
      if (!contactData.phone || !contactData.phone.trim()) {
        errors.push(tr(language, "Numer telefonu jest wymagany."))
      }
      if (!contactData.street || !contactData.street.trim()) {
        errors.push(tr(language, "Nazwa ulicy jest wymagana."))
      }
      if (!contactData.buildingNumber || !contactData.buildingNumber.trim()) {
        errors.push(tr(language, "Numer budynku jest wymagany."))
      }
      if (!contactData.postalCode || !contactData.postalCode.trim()) {
        errors.push(tr(language, "Kod pocztowy jest wymagany."))
      }
      if (!contactData.city || !contactData.city.trim()) {
        errors.push(tr(language, "Miasto jest wymagane."))
      }
      if (!contactData.country || !contactData.country.trim()) {
        errors.push(tr(language, "Kraj jest wymagany."))
      }
      if (!isAccessory) {
        if (!contactData.companyName || !contactData.companyName.trim()) {
          errors.push(tr(language, "Nazwa firmy jest wymagana."))
        }
        if (!contactData.vatNumber || !contactData.vatNumber.trim()) {
          errors.push(tr(language, "Numer VAT jest wymagany."))
        }
      }

      if (errors.length > 0) {
        alert(errors.join("\n"))
        return
      }
    }

    setEditingSection(null)
    // Here you would typically save the data to a backend
    //alert(`Zmiany w sekcji "${section}" zostały zapisane.`)
  }

  const handleCancel = () => {
    // Przywróć oryginalne dane w zależności od edytowanej sekcji
    const section = editingSection // Declare the section variable
    if (section === "device") {
      setDeviceData(originalDeviceData)
    } else if (section === "issue") {
      setIssueData(originalIssueData)
    } else if (section === "contact") {
      setContactData(originalContactData)
      setDeliveryData(originalDeliveryData)
    }

    setEditingSection(null)
  }

  // Rozwiń edycję „1. Urządzenie”, dopóki brakuje wymaganych pól (nie przeszkadzaj przy edycji innych sekcji).
  useEffect(() => {
    if (!summaryHydrated) return
    if (editingSection === "contact" || editingSection === "issue") return
    if (!deviceSectionIncomplete(deviceData)) return

    if (editingSection !== null) return

    setOriginalDeviceData({ ...deviceData })
    setDeviceData((prev) => {
      const nc = normalizeCountrySelectKey(prev.country) || prev.country
      return nc === prev.country ? prev : { ...prev, country: nc }
    })
    setEditingSection("device")
  }, [summaryHydrated, deviceData, editingSection])

  const handleErrorSelect = (value: string) => {
    if (!issueData.reportedErrors.includes(value)) {
      setIssueData({
        ...issueData,
        reportedErrors: [...issueData.reportedErrors, value],
      })
    }
  }

  const handleRemoveError = (errorToRemove: string) => {
    setIssueData({
      ...issueData,
      reportedErrors: issueData.reportedErrors.filter((error) => error !== errorToRemove),
    })
  }

  const handleConsentChange = (type: keyof typeof consents) => {
    if (type === "all") {
      const newValue = !consents.all
      setConsents({
        all: newValue,
        terms: newValue,
        privacy: newValue,
        marketing: newValue,
      })
      onDataChange?.({
        repairCostConsent: newValue,
        gdprConsent: newValue,
        privacyPolicyConsent: newValue,
        recyclingAccept: newValue,
      })
      
    } else {
      const newConsents = {
        ...consents,
        [type]: !consents[type], // Corrected logic for individual consent toggle
      }

      // Update 'all' checkbox based on individual consents
      newConsents.all = newConsents.terms && newConsents.privacy && newConsents.marketing

      setConsents(newConsents)
      onDataChange?.({
        repairCostConsent: newConsents.marketing,
        gdprConsent: newConsents.terms,
        privacyPolicyConsent: newConsents.privacy,
        recyclingAccept: newConsents.marketing,
      })
    }
  }

  const renderField = (labelKey: string, value: string | string[] | null | undefined, isFile = false) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return null
    }
    const displayValue = Array.isArray(value) ? value.map((v) => tr(language, v)).join(", ") : tr(language, value)
    return (
      <>
        <div className="text-gray-600">{tr(language, labelKey)}</div>
        <div className="text-gray-900 text-right flex justify-end items-center gap-1">
          {isFile && <Paperclip className="h-4 w-4 text-gray-600" />}
          {displayValue}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Main h1 title is now in FormContainer */}

      {/* Section 1: Device Data */}
      <div className="mb-6">
        <h2 className="text-gray-900 text-xl font-medium mb-4">{tr(language, "1. Akcesorium")}</h2>
        <div className="bg-white rounded-md p-6">
          {editingSection === "device" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-gray-600">{tr(language, "Rodzaj zgłoszenia")}</div>
                <div className="text-gray-900 text-right">{tr(language, deviceData.type)}</div>
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Nazwa produktu")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.productName}
                  onChange={(e) => setDeviceData({ ...deviceData, productName: e.target.value })}
                  className={getInputStyles(deviceData.productName)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Numer seryjny")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.serialNumber}
                  required
                  onChange={(e) => setDeviceData({ ...deviceData, serialNumber: e.target.value })}
                  className={getInputStyles(deviceData.serialNumber)}
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Data zakupu")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.purchaseDate}
                  onChange={(e) => setDeviceData({ ...deviceData, purchaseDate: e.target.value })}
                  className={getInputStyles(deviceData.purchaseDate)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Nazwa firmy")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.companyName}
                  onChange={(e) => setDeviceData({ ...deviceData, companyName: e.target.value })}
                  className={getInputStyles(deviceData.companyName)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">{tr(language, "NIP")}</Label>
                <Input
                  value={deviceData.taxId}
                  onChange={(e) => setDeviceData({ ...deviceData, taxId: e.target.value })}
                  className={getInputStyles(deviceData.taxId)}
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Ulica")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.street}
                  onChange={(e) => setDeviceData({ ...deviceData, street: e.target.value })}
                  className={getInputStyles(deviceData.street)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Numer budynku")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.buildingNumber}
                  onChange={(e) => setDeviceData({ ...deviceData, buildingNumber: e.target.value })}
                  className={getInputStyles(deviceData.buildingNumber)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Numer lokalu")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.apartmentNumber}
                  onChange={(e) => setDeviceData({ ...deviceData, apartmentNumber: e.target.value })}
                  className={getInputStyles(deviceData.apartmentNumber)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Kod pocztowy")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.postalCode}
                  onChange={(e) => setDeviceData({ ...deviceData, postalCode: e.target.value })}
                  className={getInputStyles(deviceData.postalCode)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Miasto")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.city}
                  onChange={(e) => setDeviceData({ ...deviceData, city: e.target.value })}
                  className={getInputStyles(deviceData.city)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Kraj")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={safeCountrySelectValue(deviceData.country)}
                  onValueChange={(value) => setDeviceData({ ...deviceData, country: value })}
                  required
                >
                  <SelectTrigger className={getInputStyles(deviceData.country || "")}>
                    <SelectValue placeholder={tr(language, "Wybierz z listy")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300">
                    {Object.entries(COUNTRY_NAMES_PL)
                      .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                      .map(([value]) => (
                        <SelectItem key={value} value={value} className="text-gray-600">
                          {formatCountryLabel(value)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Nazwa wystawcy")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.supplierName}
                  onChange={(e) => setDeviceData({ ...deviceData, supplierName: e.target.value })}
                  className={getInputStyles(deviceData.supplierName)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Numer faktury")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={deviceData.invoiceNumber}
                  onChange={(e) => setDeviceData({ ...deviceData, invoiceNumber: e.target.value })}
                  className={getInputStyles(deviceData.invoiceNumber)}
                  required
                />
              </div>

              {deviceData.attachedDocuments.length > 0 && (
                <div className="grid grid-cols-2 gap-y-4 text-sm mt-4">
                  <div className="text-gray-600">{tr(language, "Dodane dokumenty")}</div>
                  <div className="text-gray-900 text-right flex justify-end items-center">
                    <Paperclip className="h-4 w-4 mr-1 text-gray-600" />
                    <span>{deviceData?.attachedDocuments}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              {renderField("Rodzaj zgłoszenia", deviceData.type)}
              {renderField("Nazwa produktu", deviceData.productName)}
              {renderField("Numer seryjny", deviceData.serialNumber)}
              {renderField("Data zakupu", deviceData.purchaseDate)}
              {renderField("Nazwa firmy", deviceData.companyName)}
              {renderField("NIP", deviceData.taxId)}
              {renderField("Ulica", deviceData.street)}
              {renderField("Numer budynku", deviceData.buildingNumber)}
              {renderField("Numer lokalu", deviceData.apartmentNumber)}
              {renderField("Kod pocztowy", deviceData.postalCode)}
              {renderField("Miasto", deviceData.city)}
              {renderField(
                "Kraj",
                deviceData.country ? COUNTRY_NAMES_PL[deviceData.country] || deviceData.country : ""
              )}
              {renderField("Nazwa wystawcy", deviceData.supplierName)}
              {renderField("Numer faktury", deviceData.invoiceNumber)}
              {renderField("Dodane dokumenty", deviceData.attachedDocuments, true)}
            </div>
          )}

          <div className="flex justify-end mt-4">
            {editingSection === "device" ? (
              <div className="flex gap-2">
                <Button
                  variant="link"
                  onClick={() => handleCancel()}
                  className="text-gray-600 hover:text-gray-300 p-0 h-auto flex items-center"
                >
                  {tr(language, "Anuluj")}
                </Button>
                <Button
                  variant="link"
                  onClick={() => handleSave("device")}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto flex items-center"
                >
                  {tr(language, "Zapisz")}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => handleEdit("device")}
                className="flex items-center gap-2 text-[#3B82F6] hover:text-[#60A5FA] transition-colors cursor-pointer bg-transparent border-none"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontStyle: "normal",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                <span>{tr(language, "Edytuj dane")}</span>
                <div className="w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-gray-900" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Reported Issue (hidden for now – can be re-enabled) */}
      {false && (
      <div className="mb-6">
        <h2 className="text-gray-900 text-xl font-medium mb-4">{tr(language, "2. Zgłaszane zagadnienie")}</h2>
        <div className="bg-white rounded-md p-6">
          {editingSection === "issue" ? (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-y-4 text-sm mb-4">
                  <div className="text-gray-600">{tr(language, "Dodane dokumenty przypisane do urządzenia")}</div>
                  <div className="text-gray-900 text-right flex justify-end items-center">
                    <Paperclip className="h-4 w-4 mr-1 text-gray-600" />
                    <ul>
                      {issueData.attachedIssueFolderZipName}
                    </ul>
            
                  </div>
                </div>
      
              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                    {selectedCategory === "accessory" ? tr(language, "Powód reklamacji") : tr(language, "Wskazane błędy")}
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {issueData.reportedErrors.map((error, index) => (
                    <Badge
                      key={index}
                      className="bg-gray-50 hover:bg-gray-50 text-gray-600 border border-gray-300"
                    >
                      {selectedCategory === "accessory" ? tr(language, getAccessoriesErrorLabel(error)) : getErrorLabel(error)}
                      <button
                        onClick={() => handleRemoveError(error)}
                        className="ml-2 text-gray-600 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>


                <Select onValueChange={handleErrorSelect}>
                  <SelectTrigger className={getInputStyles(issueData.reportedErrors.length > 0 ? "filled" : "")}>
                    <SelectValue
                      placeholder={selectedCategory === "accessory" ? tr(language, "Wybierz powód reklamacji") : tr(language, "Wybierz numery błędów")}
                    />
                  </SelectTrigger>

                  <SelectContent className="select-dark-content max-h-[300px] bg-gray-50 border-gray-300">
                    {errorsList.map((error) => (
                      <SelectItem
                        key={error.id}
                        value={error.id}
                        className="select-dark-item text-gray-600"
                        disabled={issueData.reportedErrors.includes(error.id)}
                      >
                        {error.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>


              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">{tr(language, "Komentarz")}</Label>
                <Input
                  value={issueData.comments}
                  onChange={(e) => setIssueData({ ...issueData, comments: e.target.value })}
                  className={getInputStyles(issueData.comments)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 text-sm">

              <div className="text-gray-600">{tr(language, "Dodane dokumenty przypisane do urządzenia")}</div>
              <div className="text-gray-900 text-right flex justify-end items-center">
                <Paperclip className="h-4 w-4 mr-1 text-gray-600" />
                    <ul>
                      {issueData.attachedIssueFolderZipName}
                    </ul>
              </div>
      
              <div className="text-gray-600">  
                  {selectedCategory === "accessory" ? tr(language, "Powód reklmamacji") : tr(language, "Wskazane błędy")}
              </div>
              <div className="text-gray-900 text-right flex justify-end gap-2 flex-wrap">
                {issueData.reportedErrors.length > 0 ? (
                  issueData.reportedErrors.map((error, index) => (
                    <Badge
                      key={index}
                      className="bg-transparent text-gray-900 border border-[#5f6a77] rounded-full pt-[10px] pr-[20px] pb-[8px] pl-[20px] hover:bg-white"
                    >
                      {isAccessory ? tr(language, getAccessoriesErrorLabel(error)) : getErrorLabel(error)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-600">{tr(language, "Brak wskazanych błędów")}</span>
                )}
              </div>

              <div className="text-gray-600">{tr(language, "Komentarz")}</div>
              <div className="text-gray-900 text-right">
                {issueData.comments || <span className="text-gray-600">{tr(language, "Brak komentarza")}</span>}
              </div>
            </div>
          )}

        <div className="flex justify-end mt-4">
          {editingSection === "issue" && (
            <div className="flex gap-2">
              <Button
                variant="link"
                onClick={() => handleCancel()}
                className="text-gray-600 hover:text-gray-300 p-0 h-auto flex items-center"
              >
                {tr(language, "Anuluj")}
              </Button>
              <Button
                variant="link"
                onClick={() => handleSave("issue")}
                className="text-blue-400 hover:text-blue-300 p-0 h-auto flex items-center"
              >
                {tr(language, "Zapisz")}
              </Button>
            </div>
          )}
        </div>
        </div>
      </div>
      )}

      {/* Section 2: Contact Data */}
      <div className="mb-6">
        <h2 className="text-gray-900 text-xl font-medium mb-4">{tr(language, "2. Dane kontaktowe (do przesyłki autoklawu)")}</h2>
        <div className="bg-white rounded-md p-6">
          {editingSection === "contact" ? (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Imię i Nazwisko")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  className={getInputStyles(contactData.name)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "E-mail")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  className={getInputStyles(contactData.email)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Numer telefonu")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  className={getInputStyles(contactData.phone)}
                  required
                />
              </div>

              {!isAccessory && (
                <>
              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Nazwa firmy")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.companyName || ""}
                  onChange={(e) => setContactData({ ...contactData, companyName: e.target.value })}
                  className={getInputStyles(contactData.companyName || "")}
                  placeholder={tr(language, "Wpisz nazwę firmy")}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Numer VAT")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.vatNumber || ""}
                  onChange={(e) => setContactData({ ...contactData, vatNumber: e.target.value })}
                  className={getInputStyles(contactData.vatNumber || "")}
                  placeholder={tr(language, "Wpisz numer VAT")}
                  required
                />
              </div>
                </>
              )}

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Ulica")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.street}
                  onChange={(e) => setContactData({ ...contactData, street: e.target.value })}
                  className={getInputStyles(contactData.street)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Numer lokalu")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.buildingNumber}
                  onChange={(e) => setContactData({ ...contactData, buildingNumber: e.target.value })}
                  className={getInputStyles(contactData.buildingNumber)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Kod pocztowy")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.postalCode}
                  onChange={(e) => setContactData({ ...contactData, postalCode: e.target.value })}
                  className={getInputStyles(contactData.postalCode)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Miasto")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={contactData.city}
                  onChange={(e) => setContactData({ ...contactData, city: e.target.value })}
                  className={getInputStyles(contactData.city)}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-900 text-sm mb-2 block">
                  {tr(language, "Kraj")} <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={safeCountrySelectValue(contactData.country)} 
                  onValueChange={(value) => setContactData({ ...contactData, country: value })}
                  required
                >
                  <SelectTrigger className={getInputStyles(contactData.country || "")}>
                    <SelectValue placeholder={tr(language, "Wybierz z listy")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300">
                    {Object.entries(COUNTRY_NAMES_PL)
                      .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                      .map(([value]) => (
                        <SelectItem key={value} value={value} className="text-gray-600">
                          {formatCountryLabel(value)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {isPostWarranty && deliveryData.otherDeliveryAddress && (
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <h3 className="text-gray-900 text-lg font-medium mb-4">{tr(language, "Inny adres dostawy")}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-900 text-sm mb-2 block">{tr(language, "Nazwa firmy / nazwa")}</Label>
                      <Input
                        value={deliveryData.companyName || ""}
                        onChange={(e) => setDeliveryData({ ...deliveryData, companyName: e.target.value })}
                        className={getInputStyles(deliveryData.companyName || "")}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-900 text-sm mb-2 block">{tr(language, "Adres")}</Label>
                      <Input
                        value={deliveryData.address || ""}
                        onChange={(e) => setDeliveryData({ ...deliveryData, address: e.target.value })}
                        className={getInputStyles(deliveryData.address || "")}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-900 text-sm mb-2 block">{tr(language, "Adres c.d.")}</Label>
                      <Input
                        value={deliveryData.address2 || ""}
                        onChange={(e) => setDeliveryData({ ...deliveryData, address2: e.target.value })}
                        className={getInputStyles(deliveryData.address2 || "")}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-900 text-sm mb-2 block">{tr(language, "Kod pocztowy")}</Label>
                      <Input
                        value={deliveryData.postalCode || ""}
                        onChange={(e) => setDeliveryData({ ...deliveryData, postalCode: e.target.value })}
                        className={getInputStyles(deliveryData.postalCode || "")}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-900 text-sm mb-2 block">{tr(language, "Miasto")}</Label>
                      <Input
                        value={deliveryData.city || ""}
                        onChange={(e) => setDeliveryData({ ...deliveryData, city: e.target.value })}
                        className={getInputStyles(deliveryData.city || "")}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-900 text-sm mb-2 block">{tr(language, "Kraj")}</Label>
                      <Select 
                        value={safeCountrySelectValue(deliveryData.country)} 
                        onValueChange={(value) => setDeliveryData({ ...deliveryData, country: value })}
                      >
                        <SelectTrigger className={getInputStyles(deliveryData.country || "")}>
                          <SelectValue placeholder={tr(language, "Wybierz z listy")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300">
                          {Object.entries(COUNTRY_NAMES_PL)
                            .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                            .map(([value]) => (
                              <SelectItem key={value} value={value} className="text-gray-600">
                                {formatCountryLabel(value)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              {renderField("Imię i Nazwisko", contactData.name)}
              {renderField("E-mail", contactData.email)}
              {renderField("Numer telefonu", contactData.phone)}
              {!isAccessory && renderField("Nazwa firmy", contactData.companyName)}
              {!isAccessory && renderField("Numer VAT", contactData.vatNumber)}
              {renderField("Ulica", contactData.street)}
              {renderField("Numer lokalu", contactData.buildingNumber)}
              {renderField("Kod pocztowy", contactData.postalCode)}
              {renderField("Miasto", contactData.city)}
              {renderField("Kraj", contactData.country ? (COUNTRY_NAMES_PL[contactData.country] || contactData.country) : "")}
            </div>
          )}

          {isPostWarranty && !editingSection && deliveryData.otherDeliveryAddress && (
            <div className="mt-6 pt-6 border-t border-gray-300">
              <h3 className="text-gray-900 text-lg font-medium mb-4">{tr(language, "Inny adres dostawy")}</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                {renderField("Nazwa firmy / nazwa", deliveryData.companyName)}
                {renderField("Adres", deliveryData.address)}
                {renderField("Adres c.d.", deliveryData.address2)}
                {renderField("Kod pocztowy", deliveryData.postalCode)}
                {renderField("Miasto", deliveryData.city)}
                {renderField("Kraj", deliveryData.country ? (COUNTRY_NAMES_PL[deliveryData.country] || deliveryData.country) : "")}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4 relative z-10">
            {editingSection === "contact" ? (
              <div className="flex gap-2">
                <Button
                  variant="link"
                  onClick={() => handleCancel()}
                  className="text-gray-600 hover:text-gray-300 p-0 h-auto flex items-center"
                >
                  {tr(language, "Anuluj")}
                </Button>
                <Button
                  variant="link"
                  onClick={() => handleSave("contact")}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto flex items-center"
                >
                  {tr(language, "Zapisz")}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleEdit("contact")
                }}
                className="flex items-center gap-2 text-[#3B82F6] hover:text-[#60A5FA] transition-colors cursor-pointer bg-transparent border-none z-10 relative"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontStyle: "normal",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                <span>{tr(language, "Edytuj dane")}</span>
                <div className="w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-gray-900" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Consents */}
      <div className="mb-6">
        <h2 className="text-gray-900 text-xl font-medium mb-4">{tr(language, "3. Zgody")}</h2>
        <div className="bg-white rounded-md p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleConsentChange("all")}>
              <div className="mt-1 relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                  {consents.all && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>}
                </div>
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-normal cursor-pointer">
                  {tr(language, "Zaznacz wszystkie.")}
                </Label>
              </div>
            </div>

            <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleConsentChange("terms")}>
              <div className="mt-1 relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                  {consents.terms && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>}
                </div>
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-normal cursor-pointer">
                  {tr(language, "Zgadzam się na zbieranie i przetwarzanie podanych w ramach niniejszej rejestracji, jeśli urządzenie było użytkowane niezgodnie z instrukcją obsługi. Szczegółowe postanowienia znajdują się w dokumencie „Warunki gwarancji\". Instrukcje użytkowania i warunki gwarancji można znaleźć na naszej Liście dostępnych dokumentów.")}
                </Label>
              </div>
            </div>

            <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleConsentChange("privacy")}>
              <div className="mt-1 relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                  {consents.privacy && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>}
                </div>
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-normal cursor-pointer">
                  {tr(language, "Wypełniając formularz reklamacyjny, Klient wyraża zgodę na przetwarzanie danych osobowych w celu realizacji procesu reklamacyjnego przez Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Administratorem danych osobowych jest Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Dane osobowe są chronione zgodnie z ustawą z dnia 29.08.1997 r. o ochronie danych osobowych (Dz.U. Nr 101 z 2002 r., poz. 926 z późn. zm.) w sposób uniemożliwiający dostęp do nich osobom trzecim. Klient ma prawo wglądu do swoich danych osobowych, ich poprawiania oraz żądania usunięcia lub aktualizacji.")}
                </Label>
              </div>
            </div>

            <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleConsentChange("marketing")}>
              <div className="mt-1 relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                  {consents.marketing && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>}
                </div>
              </div>
              <div>
                <Label className="text-gray-700 text-xs font-normal cursor-pointer">
                  {tr(language, "Akceptuję Politykę Prywatności Enbio Technology Sp. z o.o., z siedzibą w Gdyni. Wyrażam zgodę na kontakt przedstawiciele Enbio Technology Sp. z o.o., z siedzibą w Gdyni za pomocą danych kontaktowych, które podałem w formularzu.")}
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
