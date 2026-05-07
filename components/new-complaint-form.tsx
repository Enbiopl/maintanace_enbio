"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronDown, Info, ArrowLeft, Paperclip, Camera, Folder, X, Download, Trash2, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipArrow } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { useMeasureHeight } from "@/hooks/use-measure-height"
import SummaryForm from "@/components/summary-form"
import { COUNTRY_NAMES_PL } from "@/lib/form-data"

type FormStep = "product-selection" | "complaint-form" | "service-selection" | "service-form" | "summary"

interface ProductOption {
  id: string
  label: string
}

const AUTOCLAVE_OPTIONS: ProductOption[] = [
  { id: "enbio-s", label: "Enbio S" },
  { id: "enbio-pro", label: "Enbio Pro" },
  { id: "enbio-s-beauty", label: "Enbio S Beauty Edition" },
]

const ACCESSORY_OPTIONS: ProductOption[] = [
  { id: "magic-filter", label: "Magic Filter" },
  { id: "enbio-table", label: "Enbio Table" },
  { id: "other", label: "Inny" },
]

const SUPPORTED_LANGUAGES = ["en", "pl", "es", "fr", "de", "it", "uk", "ru", "pt"] as const

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  pl: "Polski",
  es: "Espanol",
  fr: "Francais",
  de: "Deutsch",
  it: "Italiano",
  uk: "Ukrainian",
  ru: "Russian",
  pt: "Portugues",
}

const HEADING_TRANSLATIONS: Record<SupportedLanguage, string> = {
  pl: "Jak możemy Ci pomóc?",
  en: "How can we help you?",
  es: "¿Cómo podemos ayudarte?",
  fr: "Comment pouvons-nous vous aider ?",
  de: "Wie können wir Ihnen helfen?",
  it: "Come possiamo aiutarti?",
  uk: "Чим ми можемо вам допомогти?",
  ru: "Чем мы можем вам помочь?",
  pt: "Como podemos ajudá-lo?",
}

const UI_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  pl: {
    "Serwis gwarancyjny": "Przegląd w okresie gwarancyjnym",
    "Serwis pogwarancyjny": "Przegląd pogwarancyjny",
  },
  en: {
    "Kraj": "Country",
    "Wybierz z listy": "Choose from the list",
    "Polska": "Poland",
    "Niemcy": "Germany",
    "Czechy": "Czech Republic",
    "Opisz problem...": "Describe the problem...",
    "Inny": "Other",
    "Wystąpił błąd podczas przetwarzania faktury": "An error occurred while processing the invoice",
    "Wystąpił błąd podczas przesyłania pliku. Spróbuj ponownie.":
      "An error occurred while uploading the file. Please try again.",
    "Inny adres dostawy": "Different delivery address",
    "Nazwa firmy / nazwa": "Company / name",
    "Adres": "Address",
    "Wpisz adres firmy": "Enter company address",
    "Adres c.d.": "Address (cont.)",
    "Miasto odbioru": "Destination city",
    "Przesyłanie folderu...": "Uploading folder...",
    "Wstecz": "Back",
    "Wyślij zgłoszenie serwisowe": "Submit service request",
    "Wyślij zgłoszenie": "Submit request",
    "Wyślij formularz": "Submit form",
    "Dodaj zdjęcie faktury lub świadectwa gwarancji": "Add an invoice or warranty document photo",
    "Przetwarzanie faktury...": "Processing invoice...",
    "Przeciągnij lub wybierz plik": "Drag and drop or choose a file",
    "zrób zdjęcie": "take a photo",
    "Dane z faktury zostały rozpoznane i będą użyte w formularzu.":
      "Data from the invoice has been recognized and will be used in the form.",
    "Dozwolone formaty: JPG, PDF": "Allowed formats: JPG, PDF",
    "Maksymalny rozmiar: 10 MB": "Maximum size: 10 MB",
    "Dodaj folder autokławu": "Add autoclave folder",
    "Przeciągnij lub": "Drag and drop or",
    "wybierz folder": "choose a folder",
    "Folder:": "Folder:",
    "plików": "files",
    "Usuń folder": "Remove folder",
    "Folder został pomyślnie dodany.": "The folder has been added successfully.",
    "Wybierz folder o numerze autoklawu,": "Choose the folder with the autoclave number,",
    "np. ST01-PL-24-00001": "e.g. ST01-PL-24-00001",
    "Przesyłanie folderu...": "Uploading folder...",
    "1. Dane urządzenia": "1. Device data",
    "Autoklaw": "Autoclave",
    "Kliknij ponownie, aby zmienić wybór": "Click again to change your selection",
    "Serwis gwarancyjny": "Warranty maintenance",
    "Dla urządzeń objętych aktywną gwarancją producenta.": "For devices covered by an active manufacturer's warranty.",
    "Serwis pogwarancyjny": "Post‑warranty maintenance",
    "Jeśli gwarancja już wygasła lub nie masz pewności": "If the warranty has expired or you are not sure",
    "Sprawdź czy Twoje urządzenie jest na gwarancji": "Check if your device is under warranty",
    "Twoje urządzenie może być objęte gwarancją, jeśli:": "Your device may be covered by a warranty if:",
    "Od daty zakupu nie minęły 2 lata.": "Less than 2 years have passed since the purchase date.",
    "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją.":
      "In your country, the required maintenance has been carried out according to the manual.",
    "UWAGA!": "ATTENTION!",
    "Warunki przeglądu różnią się w zależności od kraju.": "Maintenance requirements vary depending on the country.",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:":
      "To check the maintenance details, refer to the documentation:",
    'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub':
      'USB stick supplied with the device → file "Warranty conditions" or',
    'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub':
      'USB stick supplied with the device → file "User manual" or',
    'Zakładka "Info" w menu autoklawu.': 'The "Info" tab in the autoclave menu.',
    "2. Dane kontaktowe": "2. Contact details (Delivery address)",
    "do przesyłki": "for shipment",
    "Nazwa firmy": "Company name",
    "Numer seryjny": "Serial number",
    "Wpisz nazwę firmy": "Enter company name",
    "Numer VAT": "VAT number",
    "Wpisz numer VAT": "Enter VAT number",
    "Wpisz numer": "Enter serial number",
    "Imię i nazwisko": "Full name",
    "Wpisz pełne imię i nazwisko": "Enter full name",
    "Adres e-mail": "E-mail address",
    "Podaj adres e-mail": "Enter e-mail address",
    "Telefon": "Phone",
    "Nazwa ulicy": "Street name",
    "Wpisz pełną nazwę ulicy": "Enter full street name",
    "Numer budynku": "Building number",
    "Podaj numer": "Enter number",
    "Numer z prefiksem kraju (np. +48 123 456 789)": "Number with country code (e.g. +48 123 456 789)",
    "Numer lokalu": "Apartment number",
    "Wpisz jeżeli występuje": "Enter if applicable",
    "Kod pocztowy": "Postal code",
    "Wpisz kod": "Enter postal code",
    "Miasto": "City",
    "Miasto odbioru": "Destination city",
    "Numery błędów lub/i komentarz": "Error numbers and/or comment",
    "Gdzie szukać": "Where to find them",
    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone.":
      "The error number appears on the autoclave screen. Tap it to go to the next one. Repeat until all numbers are displayed.",
    "Wybierz numery błędów, zdjęcia lub komentarze":
      "Select error numbers, photos or comments",
    "Wybrano 1 błędów": "1 error selected",
    "Wybrano 2 błędów": "2 errors selected",
    "Wybrano 3 błędów": "3 errors selected",
    "Wybrano 4 błędów": "4 errors selected",
    "Wybrano 5 błędów": "5 errors selected",
    "Wybrano 6 błędów": "6 errors selected",
    "Wybrano 7 błędów": "7 errors selected",
    "Wybrano 8 błędów": "8 errors selected",
    "Wybrano 9 błędów": "9 errors selected",
    "Wybrano 10 błędów": "10 errors selected",
    "komentarz": "comment",
    "Wybierz z listy błędów": "Choose from the list of errors",
    "Maszyna wydaje dziwne dźwięki.": "The machine makes strange noises.",
    "Maszyna wydaje dziwne dźwięki...": "The machine makes strange noises...",
    "Komentarz": "Comment",
    "Potwierdź": "Confirm",
    "Dodaj komentarz": "Add a comment",
    "Twój komentarz...": "Your comment...",
    "Zapisano": "Saved",
    "Zatwierdź": "Confirm",
    "Akcesoria": "Accessories",
    "Zacznij pisać tutaj (nazwa akcesorium)...":
      "Start typing here (accessory name)...",
    "Powód reklamacji": "Reason for complaint",
    "Produkt uszkodzony": "Product damaged",
    "Nie ten przedmiot": "Wrong item",
    "Sukces!": "Success!",
    "Ładowanie formularza...": "Loading form...",
    "Błąd:": "Error:",
    "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.":
      "A network error has occurred. Check the developer console.",
    "Komentarz nie może być pusty.": "Comment cannot be empty.",
    "Proszę dodać zdjęcie faktury lub świadectwa gwarancji.":
      "Please add a photo of the invoice or warranty document.",
    "Imię i nazwisko jest wymagane.": "Full name is required.",
    "Adres e-mail jest wymagany.": "E-mail address is required.",
    "Numer telefonu jest wymagany.": "Phone number is required.",
    "Numer seryjny jest wymagany.": "Serial number is required.",
    "Nazwa ulicy jest wymagana.": "Street name is required.",
    "Numer budynku jest wymagany.": "Building number is required.",
    "Kod pocztowy jest wymagany.": "Postal code is required.",
    "Miasto jest wymagane.": "City is required.",
    "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).":
      "Attach the folder from the USB stick with autoclave logs (the USB stick is located at the back of the device).",
    "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...":
      "Short description (e.g. I received a different product than ordered)...",
    "Dane rozpoznane z faktury, sprawdź poprawność":
      "Data recognized from the invoice, please verify correctness",
    "Zaznaczenie wszystkich zgód jest wymagane":
      "Selecting all consents is required",
    "Błąd nr": "Error no.",
    "Błąd wyświetlacza": "Display error",
    "Główne działanie": "Main operation",
    "Uszkodzenie mechaniczne": "Mechanical damage",
    "Błąd próżni": "Vacuum error",
    "Zdeformowany plastik": "Deformed plastic",
    "Wilgotny wsad": "Wet load",
    "Niedopasowana obudowa drzwi": "Mismatched door housing",
    "Problem z otwieraniem drzwi": "Door opening problem",
    "Wyciek / przeciek wody": "Water leak",
  },
  fr: {
    "Kraj": "Pays",
    "Wybierz z listy": "Choisissez dans la liste",
    "Polska": "Pologne",
    "Niemcy": "Allemagne",
    "Czechy": "République tchèque",
    "Opisz problem...": "Décrivez le problème...",
    "Inny": "Autre",
    "Wystąpił błąd podczas przetwarzania faktury": "Une erreur s'est produite lors du traitement de la facture",
    "Inny adres dostawy": "Autre adresse de livraison",
    "Nazwa firmy / nazwa": "Nom de l’entreprise / nom",
    "Adres": "Adresse",
    "Wpisz adres firmy": "Saisissez l’adresse de l’entreprise",
    "Adres c.d.": "Adresse (suite)",
    "Miasto odbioru": "Ville de destination",
    "Przesyłanie folderu...": "Téléchargement du dossier...",
    "Wstecz": "Retour",
    "Wyślij zgłoszenie serwisowe": "Envoyer la demande de service",
    "Wyślij zgłoszenie": "Envoyer la demande",
    "Wyślij formularz": "Envoyer le formulaire",
    "Dodaj zdjęcie faktury lub świadectwa gwarancji": "Ajoutez une photo de la facture ou du document de garantie",
    "Przetwarzanie faktury...": "Traitement de la facture...",
    "Przeciągnij lub wybierz plik": "Glissez‑déposez ou sélectionnez un fichier",
    "zrób zdjęcie": "prenez une photo",
    "Dane z faktury zostały rozpoznane i będą użyte w formularzu.":
      "Les données de la facture ont été reconnues et seront utilisées dans le formulaire.",
    "Dozwolone formaty: JPG, PDF": "Formats autorisés : JPG, PDF",
    "Maksymalny rozmiar: 10 MB": "Taille maximale : 10 Mo",
    "Dodaj folder autokławu": "Ajoutez le dossier de l’autoclave",
    "Przeciągnij lub": "Glissez‑déposez ou",
    "wybierz folder": "sélectionnez un dossier",
    "Folder:": "Dossier :",
    "plików": "fichiers",
    "Usuń folder": "Supprimer le dossier",
    "Folder został pomyślnie dodany.": "Le dossier a été ajouté avec succès.",
    "Wybierz folder o numerze autoklawu,": "Choisissez le dossier portant le numéro de l’autoclave,",
    "np. ST01-PL-24-00001": "par ex. ST01-PL-24-00001",
    "Przesyłanie folderu...": "Téléchargement du dossier...",
    "1. Dane urządzenia": "1. Données de l’appareil",
    "Autoklaw": "Autoclave",
    "Kliknij ponownie, aby zmienić wybór": "Cliquez à nouveau pour modifier le choix",
    "Serwis gwarancyjny": "Réparation sous garantie",
    "Dla urządzeń objętych aktywną gwarancją producenta.": "Pour les appareils couverts par la garantie du fabricant.",
    "Serwis pogwarancyjny": "Réparation hors garantie",
    "Jeśli gwarancja już wygasła lub nie masz pewności": "Si la garantie est expirée ou si vous n’êtes pas sûr(e)",
    "Sprawdź czy Twoje urządzenie jest na gwarancji": "Vérifiez si votre appareil est sous garantie",
    "Twoje urządzenie może być objęte gwarancją, jeśli:":
      "Votre appareil peut être couvert par la garantie si :",
    "Od daty zakupu nie minęły 2 lata.": "Moins de 2 ans se sont écoulés depuis la date d’achat.",
    "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją.":
      "Dans votre pays, la révision obligatoire a été effectuée conformément au manuel.",
    "UWAGA!": "ATTENTION !",
    "Warunki przeglądu różnią się w zależności od kraju.":
      "Les conditions de révision varient d’un pays à l’autre.",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:":
      "Pour vérifier les détails de la révision, consultez la documentation :",
    'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub':
      'Clé USB fournie avec l’appareil → fichier "Conditions de garantie" ou',
    'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub':
      'Clé USB fournie avec l’appareil → fichier "Mode d’emploi" ou',
    'Zakładka "Info" w menu autoklawu.': 'Onglet "Info" dans le menu de l’autoclave.',
    "2. Dane kontaktowe": "2. Coordonnées (adresse de livraison)",
    "do przesyłki": "pour l'envoi",
    "Nazwa firmy": "Nom de l’entreprise",
    "Wpisz nazwę firmy": "Saisissez le nom de l’entreprise",
    "Numer VAT": "Numéro de TVA",
    "Wpisz numer VAT": "Saisissez le numéro de TVA",
    "Numer seryjny": "Numéro de série",
    "Wpisz numer": "Saisissez le numéro de série",
    "Imię i nazwisko": "Nom et prénom",
    "Wpisz pełne imię i nazwisko": "Saisissez le nom et le prénom complets",
    "Adres e-mail": "Adresse e‑mail",
    "Podaj adres e-mail": "Saisissez l’adresse e‑mail",
    "Telefon": "Téléphone",
    "Nazwa ulicy": "Nom de la rue",
    "Wpisz pełną nazwę ulicy": "Saisissez le nom complet de la rue",
    "Numer budynku": "Numéro du bâtiment",
    "Podaj numer": "Saisissez le numéro",
    "Numer lokalu": "Numéro d’appartement",
    "Wpisz jeżeli występuje": "Saisissez‑le si applicable",
    "Kod pocztowy": "Code postal",
    "Wpisz kod": "Saisissez le code postal",
    "Miasto": "Ville",
    "Miasto odbioru": "Ville de destination",
    "Numery błędów lub/i komentarz": "Numéros d’erreur et/ou commentaire",
    "Gdzie szukać": "Où les trouver",
    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone.":
      "Le numéro d’erreur s’affiche sur l’écran de l’autoclave. Touchez‑le pour passer au suivant. Répétez jusqu’à ce que tous les numéros soient affichés.",
    "Wybierz numery błędów, zdjęcia lub komentarze":
      "Sélectionnez les numéros d’erreur, photos ou commentaires",
    "Wybrano 1 błędów": "1 erreur sélectionnée",
    "Wybrano 2 błędów": "2 erreurs sélectionnées",
    "Wybrano 3 błędów": "3 erreurs sélectionnées",
    "Wybrano 4 błędów": "4 erreurs sélectionnées",
    "Wybrano 5 błędów": "5 erreurs sélectionnées",
    "Wybrano 6 błędów": "6 erreurs sélectionnées",
    "Wybrano 7 błędów": "7 erreurs sélectionnées",
    "Wybrano 8 błędów": "8 erreurs sélectionnées",
    "Wybrano 9 błędów": "9 erreurs sélectionnées",
    "Wybrano 10 błędów": "10 erreurs sélectionnées",
    "komentarz": "commentaire",
    "Wybierz z listy błędów": "Choisissez dans la liste des erreurs",
    "Maszyna wydaje dziwne dźwięki.": "La machine émet des bruits étranges.",
    "Maszyna wydaje dziwne dźwięki...": "La machine émet des bruits étranges...",
    "Komentarz": "Commentaire",
    "Potwierdź": "Confirmer",
    "Dodaj komentarz": "Ajouter un commentaire",
    "Twój komentarz...": "Votre commentaire...",
    "Zapisano": "Enregistré",
    "Zatwierdź": "Valider",
    "Akcesoria": "Accessoires",
    "Zacznij pisać tutaj (nazwa akcesorium)...":
      "Commencez à écrire ici (nom de l’accessoire)...",
    "Powód reklamacji": "Motif de la réclamation",
    "Produkt uszkodzony": "Produit endommagé",
    "Nie ten przedmiot": "Mauvais article",
    "Sukces!": "Succès !",
    "Ładowanie formularza...": "Chargement du formulaire...",
    "Błąd:": "Erreur :",
    "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.":
      "Une erreur réseau s’est produite. Consultez la console du développeur.",
    "Komentarz nie może być pusty.": "Le commentaire ne peut pas être vide.",
    "Proszę dodać zdjęcie faktury lub świadectwa gwarancji.":
      "Veuillez ajouter une photo de la facture ou du document de garantie.",
    "Imię i nazwisko jest wymagane.": "Le nom et le prénom sont obligatoires.",
    "Adres e-mail jest wymagany.": "L’adresse e‑mail est obligatoire.",
    "Numer telefonu jest wymagany.": "Le numéro de téléphone est obligatoire.",
    "Numer seryjny jest wymagany.": "Le numéro de série est obligatoire.",
    "Nazwa ulicy jest wymagana.": "Le nom de la rue est obligatoire.",
    "Numer budynku jest wymagany.": "Le numéro du bâtiment est obligatoire.",
    "Kod pocztowy jest wymagany.": "Le code postal est obligatoire.",
    "Miasto jest wymagane.": "La ville est obligatoire.",
    "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).":
      "Joignez le dossier du lecteur USB contenant les journaux de l’autoclave (le lecteur se trouve à l’arrière de l’appareil).",
    "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...":
      "Brève description (par ex. j’ai reçu un produit différent de celui commandé)...",
    "Dane rozpoznane z faktury, sprawdź poprawność":
      "Données reconnues à partir de la facture, vérifiez leur exactitude",
    "Zaznaczenie wszystkich zgód jest wymagane":
      "La sélection de tous les consentements est requise",
    "Błąd nr": "Erreur n°",
    "Błąd wyświetlacza": "Erreur d'affichage",
    "Główne działanie": "Fonctionnement principal",
    "Uszkodzenie mechaniczne": "Dommage mécanique",
    "Błąd próżni": "Erreur de vide",
    "Zdeformowany plastik": "Plastique déformé",
    "Wilgotny wsad": "Chargement humide",
    "Niedopasowana obudowa drzwi": "Carter de porte non conforme",
    "Problem z otwieraniem drzwi": "Problème d'ouverture de porte",
    "Wyciek / przeciek wody": "Fuite d'eau",
  },
  es: {
    "Kraj": "País",
    "Wybierz z listy": "Elige de la lista",
    "Polska": "Polonia",
    "Niemcy": "Alemania",
    "Czechy": "República Checa",
    "Opisz problem...": "Describe el problema...",
    "Inny": "Otro",
    "Wystąpił błąd podczas przetwarzania faktury": "Se ha producido un error al procesar la factura",
    "Inny adres dostawy": "Otra dirección de envío",
    "Nazwa firmy / nazwa": "Nombre de la empresa / nombre",
    "Adres": "Dirección",
    "Wpisz adres firmy": "Introduce la dirección de la empresa",
    "Adres c.d.": "Dirección (continuación)",
    "Miasto odbioru": "Ciudad de destino",
    "Przesyłanie folderu...": "Subiendo la carpeta...",
    "Wstecz": "Atrás",
    "Wyślij zgłoszenie serwisowe": "Enviar solicitud de servicio",
    "Wyślij zgłoszenie": "Enviar solicitud",
    "Wyślij formularz": "Enviar formulario",
    "Dodaj zdjęcie faktury lub świadectwa gwarancji":
      "Añade una foto de la factura o del documento de garantía",
    "Przetwarzanie faktury...": "Procesando la factura...",
    "Przeciągnij lub wybierz plik": "Arrastra y suelta o elige un archivo",
    "zrób zdjęcie": "toma una foto",
    "Dane z faktury zostały rozpoznane i będą użyte w formularzu.":
      "Los datos de la factura se han reconocido y se usarán en el formulario.",
    "Dozwolone formaty: JPG, PDF": "Formatos permitidos: JPG, PDF",
    "Maksymalny rozmiar: 10 MB": "Tamaño máximo: 10 MB",
    "Dodaj folder autokławu": "Añade la carpeta del autoclave",
    "Przeciągnij lub": "Arrastra o",
    "wybierz folder": "elige una carpeta",
    "Folder:": "Carpeta:",
    "plików": "archivos",
    "Usuń folder": "Eliminar carpeta",
    "Folder został pomyślnie dodany.": "La carpeta se ha añadido correctamente.",
    "Wybierz folder o numerze autoklawu,": "Elige la carpeta con el número del autoclave,",
    "np. ST01-PL-24-00001": "p. ej. ST01-PL-24-00001",
    "1. Dane urządzenia": "1. Datos del dispositivo",
    "Autoklaw": "Autoclave",
    "Kliknij ponownie, aby zmienić wybór": "Haz clic de nuevo para cambiar la selección",
    "Serwis gwarancyjny": "Reparación en garantía",
    "Dla urządzeń objętych aktywną gwarancją producenta.":
      "Para dispositivos cubiertos por la garantía activa del fabricante.",
    "Serwis pogwarancyjny": "Reparación posgarantía",
    "Jeśli gwarancja już wygasła lub nie masz pewności":
      "Si la garantía ha caducado o no estás seguro",
    "Sprawdź czy Twoje urządzenie jest na gwarancji":
      "Comprueba si tu dispositivo está en garantía",
    "Twoje urządzenie może być objęte gwarancją, jeśli:":
      "Tu dispositivo puede estar cubierto por la garantía si:",
    "Od daty zakupu nie minęły 2 lata.": "Han pasado menos de 2 años desde la fecha de compra.",
    "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją.":
      "En tu país, la revisión obligatoria se ha realizado según el manual.",
    "UWAGA!": "ATENCIÓN",
    "Warunki przeglądu różnią się w zależności od kraju.":
      "Las condiciones de revisión varían según el país.",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:":
      "Para comprobar los detalles de la revisión, consulta la documentación:",
    'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub':
      'Pendrive incluido con el dispositivo → archivo "Condiciones de garantía" o',
    'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub':
      'Pendrive incluido con el dispositivo → archivo "Manual de usuario" o',
    'Zakładka "Info" w menu autoklawu.': 'Pestaña "Info" en el menú del autoclave.',
    "2. Dane kontaktowe": "2. Datos de contacto (dirección de envío)",
    "do przesyłki": "para envío",
    "Nazwa firmy": "Nombre de la empresa",
    "Numer seryjny": "Número de serie",
    "Wpisz nazwę firmy": "Introduce el nombre de la empresa",
    "Wpisz numer": "Introduce el número de serie",
    "Numer VAT": "Número de IVA",
    "Wpisz numer VAT": "Introduce el número de IVA",
    "Imię i nazwisko": "Nombre y apellidos",
    "Wpisz pełne imię i nazwisko": "Introduce nombre y apellidos completos",
    "Adres e-mail": "Dirección de correo electrónico",
    "Podaj adres e-mail": "Introduce la dirección de correo electrónico",
    "Telefon": "Teléfono",
    "Nazwa ulicy": "Nombre de la calle",
    "Wpisz pełną nazwę ulicy": "Introduce el nombre completo de la calle",
    "Numer budynku": "Número del edificio",
    "Podaj numer": "Introduce el número",
    "Numer z prefiksem kraju (np. +48 123 456 789)": "Número con prefijo de país (ej. +34 123 456 789)",
    "Numer lokalu": "Número de apartamento",
    "Wpisz jeżeli występuje": "Introduce si aplica",
    "Kod pocztowy": "Código postal",
    "Wpisz kod": "Introduce el código",
    "Miasto": "Ciudad",
    "Numery błędów lub/i komentarz": "Números de error y/o comentario",
    "Gdzie szukać": "Dónde encontrarlos",
    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone.":
      "El número de error aparece en la pantalla del autoclave. Tócalo para pasar al siguiente. Repite hasta que se muestren todos los números.",
    "Wybierz numery błędów, zdjęcia lub komentarze":
      "Elige números de error, fotos o comentarios",
    "Wybrano 1 błędów": "1 error seleccionado",
    "Wybrano 2 błędów": "2 errores seleccionados",
    "Wybrano 3 błędów": "3 errores seleccionados",
    "Wybrano 4 błędów": "4 errores seleccionados",
    "Wybrano 5 błędów": "5 errores seleccionados",
    "Wybrano 6 błędów": "6 errores seleccionados",
    "Wybrano 7 błędów": "7 errores seleccionados",
    "Wybrano 8 błędów": "8 errores seleccionados",
    "Wybrano 9 błędów": "9 errores seleccionados",
    "Wybrano 10 błędów": "10 errores seleccionados",
    "komentarz": "comentario",
    "Wybierz z listy błędów": "Elige de la lista de errores",
    "Maszyna wydaje dziwne dźwięki.": "La máquina hace ruidos extraños.",
    "Maszyna wydaje dziwne dźwięki...": "La máquina hace ruidos extraños...",
    "Komentarz": "Comentario",
    "Potwierdź": "Confirmar",
    "Dodaj komentarz": "Añadir comentario",
    "Twój komentarz...": "Tu comentario...",
    "Zapisano": "Guardado",
    "Zatwierdź": "Confirmar",
    "Akcesoria": "Accesorios",
    "Zacznij pisać tutaj (nazwa akcesorium)...":
      "Empieza a escribir aquí (nombre del accesorio)...",
    "Powód reklamacji": "Motivo de la reclamación",
    "Produkt uszkodzony": "Producto dañado",
    "Nie ten przedmiot": "No es el producto correcto",
    "Sukces!": "Éxito!",
    "Ładowanie formularza...": "Cargando formulario...",
    "Błąd:": "Error:",
    "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.":
      "Se ha producido un error de red. Consulta la consola del desarrollador.",
    "Komentarz nie może być pusty.": "El comentario no puede estar vacío.",
    "Proszę dodać zdjęcie faktury lub świadectwa gwarancji.":
      "Añade una foto de la factura o del documento de garantía.",
    "Imię i nazwisko jest wymagane.": "El nombre y los apellidos son obligatorios.",
    "Adres e-mail jest wymagany.": "La dirección de correo electrónico es obligatoria.",
    "Numer telefonu jest wymagany.": "El número de teléfono es obligatorio.",
    "Numer seryjny jest wymagany.": "El número de serie es obligatorio.",
    "Nazwa ulicy jest wymagana.": "El nombre de la calle es obligatorio.",
    "Numer budynku jest wymagany.": "El número del edificio es obligatorio.",
    "Kod pocztowy jest wymagany.": "El código postal es obligatorio.",
    "Miasto jest wymagane.": "La ciudad es obligatoria.",
    "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).":
      "Adjunta la carpeta del pendrive con los registros del autoclave (el pendrive se encuentra en la parte trasera del dispositivo).",
    "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...":
      "Breve descripción (p. ej. he recibido un producto diferente al pedido)...",
    "Dane rozpoznane z faktury, sprawdź poprawność":
      "Datos reconocidos de la factura, comprueba que sean correctos",
    "Zaznaczenie wszystkich zgód jest wymagane":
      "Es necesario marcar todos los consentimientos",
    "Błąd nr": "Error n.°",
    "Błąd wyświetlacza": "Error de pantalla",
    "Główne działanie": "Funcionamiento principal",
    "Uszkodzenie mechaniczne": "Daño mecánico",
    "Błąd próżni": "Error de vacío",
    "Zdeformowany plastik": "Plástico deformado",
    "Wilgotny wsad": "Carga húmeda",
    "Niedopasowana obudowa drzwi": "Carcasa de puerta no compatible",
    "Problem z otwieraniem drzwi": "Problema al abrir la puerta",
    "Wyciek / przeciek wody": "Fuga de agua",
  },
  de: {
    "Kraj": "Land",
    "Wybierz z listy": "Aus der Liste wählen",
    "Polska": "Polen",
    "Niemcy": "Deutschland",
    "Czechy": "Tschechische Republik",
    "Opisz problem...": "Beschreiben Sie das Problem...",
    "Inny": "Sonstiges",
    "Wystąpił błąd podczas przetwarzania faktury": "Beim Verarbeiten der Rechnung ist ein Fehler aufgetreten",
    "Inny adres dostawy": "Andere Lieferadresse",
    "Nazwa firmy / nazwa": "Firma / Name",
    "Adres": "Adresse",
    "Wpisz adres firmy": "Firmenadresse eingeben",
    "Adres c.d.": "Adresse (Forts.)",
    "Miasto odbioru": "Bestimmungsort",
    "Przesyłanie folderu...": "Ordner wird hochgeladen...",
    "Wstecz": "Zurück",
    "Wyślij zgłoszenie serwisowe": "Serviceanfrage senden",
    "Wyślij zgłoszenie": "Anfrage senden",
    "Wyślij formularz": "Formular absenden",
    "Dodaj zdjęcie faktury lub świadectwa gwarancji": "Fügen Sie ein Foto der Rechnung oder des Garantiedokuments hinzu",
    "Przetwarzanie faktury...": "Rechnung wird verarbeitet...",
    "Przeciągnij lub wybierz plik": "Ziehen Sie die Datei hierher oder wählen Sie sie aus",
    "zrób zdjęcie": "Foto aufnehmen",
    "Dane z faktury zostały rozpoznane i będą użyte w formularzu.":
      "Die Rechnungsdaten wurden erkannt und werden im Formular verwendet.",
    "Dozwolone formaty: JPG, PDF": "Erlaubte Formate: JPG, PDF",
    "Maksymalny rozmiar: 10 MB": "Max. Größe: 10 MB",
    "Dodaj folder autokławu": "Autoklaven-Ordner hinzufügen",
    "Przeciągnij lub": "Ziehen oder",
    "wybierz folder": "Ordner wählen",
    "Folder:": "Ordner:",
    "plików": "Dateien",
    "Usuń folder": "Ordner entfernen",
    "Folder został pomyślnie dodany.": "Der Ordner wurde erfolgreich hinzugefügt.",
    "Wybierz folder o numerze autoklawu,": "Wählen Sie den Ordner mit der Autoklaven-Nummer,",
    "np. ST01-PL-24-00001": "z. B. ST01-PL-24-00001",
    "1. Dane urządzenia": "1. Gerätedaten",
    "Autoklaw": "Autoklav",
    "Kliknij ponownie, aby zmienić wybór": "Klicken Sie erneut, um die Auswahl zu ändern",
    "Serwis gwarancyjny": "Garantiereparatur",
    "Dla urządzeń objętych aktywną gwarancją producenta.": "Für Geräte mit aktiver Herstellergarantie.",
    "Serwis pogwarancyjny": "Reparatur außerhalb der Garantie",
    "Jeśli gwarancja już wygasła lub nie masz pewności": "Wenn die Garantie abgelaufen ist oder Sie unsicher sind",
    "Sprawdź czy Twoje urządzenie jest na gwarancji": "Prüfen Sie, ob Ihr Gerät unter Garantie steht",
    "Twoje urządzenie może być objęte gwarancją, jeśli:": "Ihr Gerät kann unter Garantie stehen, wenn:",
    "Od daty zakupu nie minęły 2 lata.": "Seit dem Kaufdatum sind weniger als 2 Jahre vergangen.",
    "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją.":
      "In Ihrem Land wurde die erforderliche Wartung gemäß Anleitung durchgeführt.",
    "UWAGA!": "ACHTUNG!",
    "Warunki przeglądu różnią się w zależności od kraju.": "Die Wartungsanforderungen unterscheiden sich je nach Land.",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:":
      "Details zur Wartung finden Sie in der Dokumentation:",
    'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub':
      'Mitgelieferter USB-Stick → Datei "Garantiebedingungen" oder',
    'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub':
      'Mitgelieferter USB-Stick → Datei "Bedienungsanleitung" oder',
    'Zakładka "Info" w menu autoklawu.': 'Register "Info" im Autoklavenmenü.',
    "2. Dane kontaktowe": "2. Kontaktdaten (Lieferadresse)",
    "do przesyłki": "für den Versand",
    "Nazwa firmy": "Firmenname",
    "Numer seryjny": "Seriennummer",
    "Wpisz nazwę firmy": "Firmenname eingeben",
    "Wpisz numer": "Seriennummer eingeben",
    "Numer VAT": "USt-IdNr.",
    "Wpisz numer VAT": "USt-IdNr. eingeben",
    "Imię i nazwisko": "Vor- und Nachname",
    "Wpisz pełne imię i nazwisko": "Vor- und Nachname eingeben",
    "Adres e-mail": "E-Mail-Adresse",
    "Podaj adres e-mail": "E-Mail-Adresse eingeben",
    "Telefon": "Telefon",
    "Nazwa ulicy": "Straße",
    "Wpisz pełną nazwę ulicy": "Straße eingeben",
    "Numer budynku": "Hausnummer",
    "Podaj numer": "Nummer eingeben",
    "Numer z prefiksem kraju (np. +48 123 456 789)": "Nummer mit Ländervorwahl (z. B. +49 123 456 789)",
    "Numer lokalu": "Wohnungsnummer",
    "Wpisz jeżeli występuje": "Falls zutreffend eingeben",
    "Kod pocztowy": "Postleitzahl",
    "Wpisz kod": "Postleitzahl eingeben",
    "Miasto": "Stadt",
    "Numery błędów lub/i komentarz": "Fehlernummern und/oder Kommentar",
    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone.":
      "Die Fehlernummer erscheint auf dem Autoklav-Display. Tippen Sie darauf für die nächste. Wiederholen Sie, bis alle Nummern angezeigt sind.",
    "Wybierz numery błędów, zdjęcia lub komentarze": "Fehlernummern, Fotos oder Kommentare auswählen",
    "Wybrano 1 błędów": "1 Fehler ausgewählt",
    "Wybrano 2 błędów": "2 Fehler ausgewählt",
    "Wybrano 3 błędów": "3 Fehler ausgewählt",
    "Wybrano 4 błędów": "4 Fehler ausgewählt",
    "Wybrano 5 błędów": "5 Fehler ausgewählt",
    "Wybrano 6 błędów": "6 Fehler ausgewählt",
    "Wybrano 7 błędów": "7 Fehler ausgewählt",
    "Wybrano 8 błędów": "8 Fehler ausgewählt",
    "Wybrano 9 błędów": "9 Fehler ausgewählt",
    "Wybrano 10 błędów": "10 Fehler ausgewählt",
    "Maszyna wydaje dziwne dźwięki.": "Die Maschine macht seltsame Geräusche.",
    "Maszyna wydaje dziwne dźwięki...": "Die Maschine macht seltsame Geräusche...",
    "Dodaj komentarz": "Kommentar hinzufügen",
    "Twój komentarz...": "Ihr Kommentar...",
    "Sukces!": "Erfolg!",
    "Ładowanie formularza...": "Formular wird geladen...",
    "Błąd:": "Fehler:",
    "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.":
      "Ein Netzwerkfehler ist aufgetreten. Überprüfen Sie die Entwicklerkonsole.",
    "Komentarz nie może być pusty.": "Der Kommentar darf nicht leer sein.",
    "Proszę dodać zdjęcie faktury lub świadectwa gwarancji.":
      "Bitte fügen Sie ein Foto der Rechnung oder des Garantiedokuments hinzu.",
    "Imię i nazwisko jest wymagane.": "Vor- und Nachname sind erforderlich.",
    "Adres e-mail jest wymagany.": "E-Mail-Adresse ist erforderlich.",
    "Numer telefonu jest wymagany.": "Telefonnummer ist erforderlich.",
    "Numer seryjny jest wymagany.": "Seriennummer ist erforderlich.",
    "Nazwa ulicy jest wymagana.": "Straße ist erforderlich.",
    "Numer budynku jest wymagany.": "Hausnummer ist erforderlich.",
    "Kod pocztowy jest wymagany.": "Postleitzahl ist erforderlich.",
    "Miasto jest wymagane.": "Stadt ist erforderlich.",
    "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).":
      "Fügen Sie den Ordner vom USB-Stick mit Autoklaven-Logs bei (der USB-Stick befindet sich auf der Geräterückseite).",
    "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...":
      "Kurze Beschreibung (z. B. ich habe ein anderes Produkt als bestellt erhalten)...",
    "Dane rozpoznane z faktury, sprawdź poprawność":
      "Aus der Rechnung erkannte Daten – bitte Richtigkeit prüfen",
    "Zaznaczenie wszystkich zgód jest wymagane":
      "Alle Einwilligungen müssen angekreuzt werden",
    "Akcesoria": "Zubehör",
    "Zacznij pisać tutaj (nazwa akcesorium)...":
      "Beginnen Sie hier mit der Eingabe (Zubehörname)...",
    "Powód reklamacji": "Reklamationsgrund",
    "Produkt uszkodzony": "Beschädigtes Produkt",
    "Nie ten przedmiot": "Falscher Artikel",
    "Wybierz z listy błędów": "Wählen Sie aus der Fehlerliste",
    "Błąd nr": "Fehler Nr.",
    "Błąd wyświetlacza": "Anzeigefehler",
    "Główne działanie": "Hauptbetrieb",
    "Uszkodzenie mechaniczne": "Mechanischer Schaden",
    "Błąd próżni": "Vakuumfehler",
    "Zdeformowany plastik": "Verformtes Plastik",
    "Wilgotny wsad": "Nasse Ladung",
    "Niedopasowana obudowa drzwi": "Nicht passendes Türgehäuse",
    "Problem z otwieraniem drzwi": "Problem beim Türöffnen",
    "Wyciek / przeciek wody": "Wasserleck",
    "Zapisano": "Gespeichert",
    "Zatwierdź": "Bestätigen",
    "Komentarz": "Kommentar",
    "Maszyna wydaje dziwne dźwięki...": "Die Maschine macht seltsame Geräusche...",
    "Potwierdź": "Bestätigen",
    "Numery błędów lub/i komentarz": "Fehlernummern und/oder Kommentar",
    "Gdzie szukać": "Wo zu finden",
    "Wybierz numery błędów, zdjęcia lub komentarze": "Fehlernummern, Fotos oder Kommentare auswählen",
    "komentarz": "Kommentar",
  },
  it: {
    "Kraj": "Paese",
    "Wybierz z listy": "Scegli dall'elenco",
    "Polska": "Polonia",
    "Niemcy": "Germania",
    "Czechy": "Repubblica Ceca",
    "Opisz problem...": "Descrivi il problema...",
    "Inny": "Altro",
    "Wystąpił błąd podczas przetwarzania faktury": "Si è verificato un errore durante l'elaborazione della fattura",
    "Inny adres dostawy": "Altro indirizzo di spedizione",
    "Nazwa firmy / nazwa": "Azienda / nome",
    "Adres": "Indirizzo",
    "Wpisz adres firmy": "Inserisci l'indirizzo dell'azienda",
    "Adres c.d.": "Indirizzo (segue)",
    "Miasto odbioru": "Città di destinazione",
    "Przesyłanie folderu...": "Caricamento cartella...",
    "Wstecz": "Indietro",
    "Wyślij zgłoszenie serwisowe": "Invia richiesta di assistenza",
    "Wyślij zgłoszenie": "Invia richiesta",
    "Wyślij formularz": "Invia modulo",
    "Dodaj zdjęcie faktury lub świadectwa gwarancji": "Aggiungi una foto della fattura o del documento di garanzia",
    "Przetwarzanie faktury...": "Elaborazione fattura...",
    "Przeciągnij lub wybierz plik": "Trascina o seleziona un file",
    "zrób zdjęcie": "scatta una foto",
    "Dane z faktury zostały rozpoznane i będą użyte w formularzu.":
      "I dati della fattura sono stati riconosciuti e saranno utilizzati nel modulo.",
    "Dozwolone formaty: JPG, PDF": "Formati consentiti: JPG, PDF",
    "Maksymalny rozmiar: 10 MB": "Dimensione massima: 10 MB",
    "Dodaj folder autokławu": "Aggiungi cartella autoclave",
    "Przeciągnij lub": "Trascina o",
    "wybierz folder": "seleziona cartella",
    "Folder:": "Cartella:",
    "plików": "file",
    "Usuń folder": "Rimuovi cartella",
    "Folder został pomyślnie dodany.": "La cartella è stata aggiunta correttamente.",
    "Wybierz folder o numerze autoklawu,": "Scegli la cartella con il numero dell'autoclave,",
    "np. ST01-PL-24-00001": "es. ST01-PL-24-00001",
    "1. Dane urządzenia": "1. Dati dispositivo",
    "Autoklaw": "Autoclave",
    "Kliknij ponownie, aby zmienić wybór": "Clicca di nuovo per cambiare la selezione",
    "Serwis gwarancyjny": "Riparazione in garanzia",
    "Dla urządzeń objętych aktywną gwarancją producenta.": "Per dispositivi coperti da garanzia del produttore attiva.",
    "Serwis pogwarancyjny": "Riparazione fuori garanzia",
    "Jeśli gwarancja już wygasła lub nie masz pewności": "Se la garanzia è scaduta o non sei sicuro",
    "Sprawdź czy Twoje urządzenie jest na gwarancji": "Verifica se il tuo dispositivo è in garanzia",
    "Twoje urządzenie może być objęte gwarancją, jeśli:": "Il tuo dispositivo può essere in garanzia se:",
    "Od daty zakupu nie minęły 2 lata.": "Sono passati meno di 2 anni dalla data di acquisto.",
    "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją.":
      "Nel tuo paese la manutenzione richiesta è stata eseguita secondo il manuale.",
    "UWAGA!": "ATTENZIONE!",
    "Warunki przeglądu różnią się w zależności od kraju.": "Le condizioni di manutenzione variano a seconda del paese.",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:":
      "Per i dettagli sulla manutenzione consulta la documentazione:",
    'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub':
      'Pen drive incluso con il dispositivo → file "Condizioni di garanzia" o',
    'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub':
      'Pen drive incluso con il dispositivo → file "Manuale utente" o',
    'Zakładka "Info" w menu autoklawu.': 'Scheda "Info" nel menu dell\'autoclave.',
    "2. Dane kontaktowe": "2. Dati di contatto (indirizzo di consegna)",
    "do przesyłki": "per la spedizione",
    "Nazwa firmy": "Nome azienda",
    "Numer seryjny": "Numero di serie",
    "Wpisz nazwę firmy": "Inserisci il nome dell'azienda",
    "Wpisz numer": "Inserisci il numero di serie",
    "Numer VAT": "Partita IVA",
    "Wpisz numer VAT": "Inserisci la partita IVA",
    "Imię i nazwisko": "Nome e cognome",
    "Wpisz pełne imię i nazwisko": "Inserisci nome e cognome completi",
    "Adres e-mail": "Indirizzo e-mail",
    "Podaj adres e-mail": "Inserisci l'indirizzo e-mail",
    "Telefon": "Telefono",
    "Nazwa ulicy": "Via",
    "Wpisz pełną nazwę ulicy": "Inserisci il nome completo della via",
    "Numer budynku": "Numero civico",
    "Podaj numer": "Inserisci il numero",
    "Numer z prefiksem kraju (np. +48 123 456 789)": "Numero con prefisso internazionale (es. +39 123 456 789)",
    "Numer lokalu": "Numero interno",
    "Wpisz jeżeli występuje": "Inserisci se presente",
    "Kod pocztowy": "CAP",
    "Wpisz kod": "Inserisci il CAP",
    "Miasto": "Città",
    "Numery błędów lub/i komentarz": "Numeri di errore e/o commento",
    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone.":
      "Il numero di errore appare sullo schermo dell'autoclave. Toccalo per passare al successivo. Ripeti fino a visualizzare tutti i numeri.",
    "Wybierz numery błędów, zdjęcia lub komentarze": "Seleziona numeri di errore, foto o commenti",
    "Wybrano 1 błędów": "1 errore selezionato",
    "Wybrano 2 błędów": "2 errori selezionati",
    "Wybrano 3 błędów": "3 errori selezionati",
    "Wybrano 4 błędów": "4 errori selezionati",
    "Wybrano 5 błędów": "5 errori selezionati",
    "Wybrano 6 błędów": "6 errori selezionati",
    "Wybrano 7 błędów": "7 errori selezionati",
    "Wybrano 8 błędów": "8 errori selezionati",
    "Wybrano 9 błędów": "9 errori selezionati",
    "Wybrano 10 błędów": "10 errori selezionati",
    "Maszyna wydaje dziwne dźwięki.": "La macchina emette suoni strani.",
    "Maszyna wydaje dziwne dźwięki...": "La macchina emette suoni strani...",
    "Dodaj komentarz": "Aggiungi commento",
    "Twój komentarz...": "Il tuo commento...",
    "Sukces!": "Successo!",
    "Ładowanie formularza...": "Caricamento modulo...",
    "Błąd:": "Errore:",
    "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.":
      "Si è verificato un errore di rete. Controlla la console dello sviluppatore.",
    "Komentarz nie może być pusty.": "Il commento non può essere vuoto.",
    "Proszę dodać zdjęcie faktury lub świadectwa gwarancji.":
      "Aggiungi una foto della fattura o del documento di garanzia.",
    "Imię i nazwisko jest wymagane.": "Nome e cognome obbligatori.",
    "Adres e-mail jest wymagany.": "Indirizzo e-mail obbligatorio.",
    "Numer telefonu jest wymagany.": "Numero di telefono obbligatorio.",
    "Numer seryjny jest wymagany.": "Numero di serie obbligatorio.",
    "Nazwa ulicy jest wymagana.": "Via obbligatoria.",
    "Numer budynku jest wymagany.": "Numero civico obbligatorio.",
    "Kod pocztowy jest wymagany.": "CAP obbligatorio.",
    "Miasto jest wymagane.": "Città obbligatoria.",
    "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).":
      "Allega la cartella dalla pen drive con i log dell'autoclave (la pen drive si trova sul retro del dispositivo).",
    "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...":
      "Breve descrizione (es. ho ricevuto un prodotto diverso da quello ordinato)...",
    "Dane rozpoznane z faktury, sprawdź poprawność":
      "Dati riconosciuti dalla fattura, verifica la correttezza",
    "Zaznaczenie wszystkich zgód jest wymagane":
      "È obbligatorio selezionare tutti i consensi",
    "Akcesoria": "Accessori",
    "Zacznij pisać tutaj (nazwa akcesorium)...":
      "Inizia a scrivere qui (nome accessorio)...",
    "Powód reklamacji": "Motivo del reclamo",
    "Produkt uszkodzony": "Prodotto danneggiato",
    "Nie ten przedmiot": "Articolo errato",
    "Wybierz z listy błędów": "Scegli dall'elenco degli errori",
    "Błąd nr": "Errore n.",
    "Błąd wyświetlacza": "Errore display",
    "Główne działanie": "Funzionamento principale",
    "Uszkodzenie mechaniczne": "Danno meccanico",
    "Błąd próżni": "Errore vuoto",
    "Zdeformowany plastik": "Plastica deformata",
    "Wilgotny wsad": "Carico umido",
    "Niedopasowana obudowa drzwi": "Custodia porta non compatibile",
    "Problem z otwieraniem drzwi": "Problema apertura porta",
    "Wyciek / przeciek wody": "Perdita d'acqua",
    "Zapisano": "Salvato",
    "Zatwierdź": "Conferma",
    "Komentarz": "Commento",
    "Potwierdź": "Conferma",
    "Gdzie szukać": "Dove trovarli",
    "komentarz": "commento",
  },
  uk: {
    "Kraj": "Країна",
    "Wybierz z listy": "Оберіть зі списку",
    "Polska": "Польща",
    "Niemcy": "Німеччина",
    "Czechy": "Чеська Республіка",
    "Opisz problem...": "Опишіть проблему...",
    "Inny": "Інше",
    "Wystąpił błąd podczas przetwarzania faktury": "Під час обробки рахунку сталася помилка",
    "Inny adres dostawy": "Інша адреса доставки",
    "Nazwa firmy / nazwa": "Компанія / ім'я",
    "Adres": "Адреса",
    "Wpisz adres firmy": "Введіть адресу компанії",
    "Adres c.d.": "Адреса (продовж.)",
    "Miasto odbioru": "Місто призначення",
    "Przesyłanie folderu...": "Завантаження папки...",
    "Wstecz": "Назад",
    "Wyślij zgłoszenie serwisowe": "Надіслати сервісну заявку",
    "Wyślij zgłoszenie": "Надіслати заявку",
    "Wyślij formularz": "Надіслати форму",
    "Dodaj zdjęcie faktury lub świadectwa gwarancji": "Додайте фото рахунку або гарантійного документу",
    "Przetwarzanie faktury...": "Обробка рахунку...",
    "Przeciągnij lub wybierz plik": "Перетягніть або виберіть файл",
    "zrób zdjęcie": "зробіть фото",
    "Dane z faktury zostały rozpoznane i będą użyte w formularzu.":
      "Дані з рахунку розпізнано та вони будуть використані у формі.",
    "Dozwolone formaty: JPG, PDF": "Дозволені формати: JPG, PDF",
    "Maksymalny rozmiar: 10 MB": "Макс. розмір: 10 МБ",
    "Dodaj folder autokławu": "Додати папку автоклава",
    "Przeciągnij lub": "Перетягніть або",
    "wybierz folder": "виберіть папку",
    "Folder:": "Папка:",
    "plików": "файлів",
    "Usuń folder": "Видалити папку",
    "Folder został pomyślnie dodany.": "Папку успішно додано.",
    "Wybierz folder o numerze autoklawu,": "Виберіть папку з номером автоклава,",
    "np. ST01-PL-24-00001": "напр. ST01-PL-24-00001",
    "1. Dane urządzenia": "1. Дані пристрою",
    "Autoklaw": "Автоклав",
    "Kliknij ponownie, aby zmienić wybór": "Натисніть знову, щоб змінити вибір",
    "Serwis gwarancyjny": "Гарантійний ремонт",
    "Dla urządzeń objętych aktywną gwarancją producenta.": "Для пристроїв з активною гарантією виробника.",
    "Serwis pogwarancyjny": "Післягарантійний ремонт",
    "Jeśli gwarancja już wygasła lub nie masz pewności": "Якщо гарантія закінчилась або ви не впевнені",
    "Sprawdź czy Twoje urządzenie jest na gwarancji": "Перевірте, чи ваш пристрій на гарантії",
    "Twoje urządzenie może być objęte gwarancją, jeśli:": "Ваш пристрій може бути на гарантії, якщо:",
    "Od daty zakupu nie minęły 2 lata.": "З дати покупки минуло менше 2 років.",
    "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją.":
      "У вашій країні обов'язковий огляд виконано згідно з інструкцією.",
    "UWAGA!": "УВАГА!",
    "Warunki przeglądu różnią się w zależności od kraju.": "Умови огляду залежать від країни.",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:":
      "Деталі огляду дивіться в документації:",
    'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub':
      'USB-накопичувач у комплекті → файл «Умови гарантії» або',
    'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub':
      'USB-накопичувач у комплекті → файл «Інструкція користувача» або',
    'Zakładka "Info" w menu autoklawu.': 'Вкладка «Інфо» в меню автоклава.',
    "2. Dane kontaktowe": "2. Контактні дані (адреса доставки)",
    "do przesyłki": "для відправки",
    "Nazwa firmy": "Назва компанії",
    "Numer seryjny": "Серійний номер",
    "Wpisz nazwę firmy": "Введіть назву компанії",
    "Wpisz numer": "Введіть серійний номер",
    "Numer VAT": "ІПН",
    "Wpisz numer VAT": "Введіть ІПН",
    "Imię i nazwisko": "Ім'я та прізвище",
    "Wpisz pełne imię i nazwisko": "Введіть повне ім'я та прізвище",
    "Adres e-mail": "Ел. пошта",
    "Podaj adres e-mail": "Введіть ел. пошту",
    "Telefon": "Телефон",
    "Nazwa ulicy": "Вулиця",
    "Wpisz pełną nazwę ulicy": "Введіть повну назву вулиці",
    "Numer budynku": "Номер будинку",
    "Podaj numer": "Введіть номер",
    "Numer z prefiksem kraju (np. +48 123 456 789)": "Номер з кодом країни (напр. +48 123 456 789)",
    "Numer lokalu": "Номер квартири",
    "Wpisz jeżeli występuje": "Введіть за наявності",
    "Kod pocztowy": "Поштовий індекс",
    "Wpisz kod": "Введіть індекс",
    "Miasto": "Місто",
    "Numery błędów lub/i komentarz": "Номери помилок та/або коментар",
    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone.":
      "Номер помилки відображається на екрані автоклава. Натисніть, щоб перейти до наступного. Повторюйте, поки не відобразяться всі номери.",
    "Wybierz numery błędów, zdjęcia lub komentarze": "Оберіть номери помилок, фото або коментарі",
    "Wybrano 1 błędów": "1 помилку обрано",
    "Wybrano 2 błędów": "2 помилки обрано",
    "Wybrano 3 błędów": "3 помилки обрано",
    "Wybrano 4 błędów": "4 помилки обрано",
    "Wybrano 5 błędów": "5 помилок обрано",
    "Wybrano 6 błędów": "6 помилок обрано",
    "Wybrano 7 błędów": "7 помилок обрано",
    "Wybrano 8 błędów": "8 помилок обрано",
    "Wybrano 9 błędów": "9 помилок обрано",
    "Wybrano 10 błędów": "10 помилок обрано",
    "Maszyna wydaje dziwne dźwięki.": "Машина видає дивні звуки.",
    "Maszyna wydaje dziwne dźwięki...": "Машина видає дивні звуки...",
    "Dodaj komentarz": "Додати коментар",
    "Twój komentarz...": "Ваш коментар...",
    "Sukces!": "Успіх!",
    "Ładowanie formularza...": "Завантаження форми...",
    "Błąd:": "Помилка:",
    "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.":
      "Виникла мережева помилка. Перевірте консоль розробника.",
    "Komentarz nie może być pusty.": "Коментар не може бути порожнім.",
    "Proszę dodać zdjęcie faktury lub świadectwa gwarancji.":
      "Додайте фото рахунку або гарантійного документу.",
    "Imię i nazwisko jest wymagane.": "Ім'я та прізвище обов'язкові.",
    "Adres e-mail jest wymagany.": "Ел. пошта обов'язкова.",
    "Numer telefonu jest wymagany.": "Номер телефону обов'язковий.",
    "Numer seryjny jest wymagany.": "Серійний номер обов'язковий.",
    "Nazwa ulicy jest wymagana.": "Вулиця обов'язкова.",
    "Numer budynku jest wymagany.": "Номер будинку обов'язковий.",
    "Kod pocztowy jest wymagany.": "Поштовий індекс обов'язковий.",
    "Miasto jest wymagane.": "Місто обов'язкове.",
    "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).":
      "Додайте папку з USB-накопичувача з логами автоклава (USB ззаду пристрою).",
    "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...":
      "Короткий опис (напр. отримав інший товар ніж замовив)...",
    "Dane rozpoznane z faktury, sprawdź poprawność":
      "Дані розпізнано з рахунку, перевірте правильність",
    "Zaznaczenie wszystkich zgód jest wymagane":
      "Потрібно позначити всі згоди",
    "Akcesoria": "Аксесуари",
    "Zacznij pisać tutaj (nazwa akcesorium)...":
      "Почніть вводити тут (назва аксесуара)...",
    "Powód reklamacji": "Причина рекламації",
    "Produkt uszkodzony": "Пошкоджений товар",
    "Nie ten przedmiot": "Інший товар",
    "Wybierz z listy błędów": "Оберіть зі списку помилок",
    "Błąd nr": "Помилка №",
    "Błąd wyświetlacza": "Помилка дисплея",
    "Główne działanie": "Основна робота",
    "Uszkodzenie mechaniczne": "Механічне пошкодження",
    "Błąd próżni": "Помилка вакууму",
    "Zdeformowany plastik": "Деформований пластик",
    "Wilgotny wsad": "Вологий завантаження",
    "Niedopasowana obudowa drzwi": "Невідповідний корпус двері",
    "Problem z otwieraniem drzwi": "Проблема з відкриттям двері",
    "Wyciek / przeciek wody": "Витік води",
    "Zapisano": "Збережено",
    "Zatwierdź": "Підтвердити",
    "Komentarz": "Коментар",
    "Potwierdź": "Підтвердити",
    "Gdzie szukać": "Де шукати",
    "komentarz": "коментар",
  },
  ru: {
    "Kraj": "Страна",
    "Wybierz z listy": "Выберите из списка",
    "Polska": "Польша",
    "Niemcy": "Германия",
    "Czechy": "Чешская Республика",
    "Opisz problem...": "Опишите проблему...",
    "Inny": "Другое",
    "Wystąpił błąd podczas przetwarzania faktury": "При обработке счёта произошла ошибка",
    "Inny adres dostawy": "Другой адрес доставки",
    "Nazwa firmy / nazwa": "Компания / имя",
    "Adres": "Адрес",
    "Wpisz adres firmy": "Введите адрес компании",
    "Adres c.d.": "Адрес (продолж.)",
    "Miasto odbioru": "Город назначения",
    "Przesyłanie folderu...": "Загрузка папки...",
    "Wstecz": "Назад",
    "Wyślij zgłoszenie serwisowe": "Отправить сервисную заявку",
    "Wyślij zgłoszenie": "Отправить заявку",
    "Wyślij formularz": "Отправить форму",
    "Dodaj zdjęcie faktury lub świadectwa gwarancji": "Добавьте фото счёта или гарантийного документа",
    "Przetwarzanie faktury...": "Обработка счёта...",
    "Przeciągnij lub wybierz plik": "Перетащите или выберите файл",
    "zrób zdjęcie": "сделайте фото",
    "Dane z faktury zostały rozpoznane i będą użyte w formularzu.":
      "Данные со счёта распознаны и будут использованы в форме.",
    "Dozwolone formaty: JPG, PDF": "Допустимые форматы: JPG, PDF",
    "Maksymalny rozmiar: 10 MB": "Макс. размер: 10 МБ",
    "Dodaj folder autokławu": "Добавить папку автоклава",
    "Przeciągnij lub": "Перетащите или",
    "wybierz folder": "выберите папку",
    "Folder:": "Папка:",
    "plików": "файлов",
    "Usuń folder": "Удалить папку",
    "Folder został pomyślnie dodany.": "Папка успешно добавлена.",
    "Wybierz folder o numerze autoklawu,": "Выберите папку с номером автоклава,",
    "np. ST01-PL-24-00001": "напр. ST01-PL-24-00001",
    "1. Dane urządzenia": "1. Данные устройства",
    "Autoklaw": "Автоклав",
    "Kliknij ponownie, aby zmienić wybór": "Нажмите снова, чтобы изменить выбор",
    "Serwis gwarancyjny": "Гарантийный ремонт",
    "Dla urządzeń objętych aktywną gwarancją producenta.": "Для устройств с действующей гарантией производителя.",
    "Serwis pogwarancyjny": "Послегарантийный ремонт",
    "Jeśli gwarancja już wygasła lub nie masz pewności": "Если гарантия истекла или вы не уверены",
    "Sprawdź czy Twoje urządzenie jest na gwarancji": "Проверьте, находится ли ваше устройство на гарантии",
    "Twoje urządzenie może być objęte gwarancją, jeśli:": "Ваше устройство может быть на гарантии, если:",
    "Od daty zakupu nie minęły 2 lata.": "С даты покупки прошло менее 2 лет.",
    "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją.":
      "В вашей стране обязательный осмотр выполнен согласно инструкции.",
    "UWAGA!": "ВНИМАНИЕ!",
    "Warunki przeglądu różnią się w zależności od kraju.": "Условия осмотра зависят от страны.",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:":
      "Подробности осмотра см. в документации:",
    'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub':
      'USB-накопитель в комплекте → файл «Условия гарантии» или',
    'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub':
      'USB-накопитель в комплекте → файл «Инструкция пользователя» или',
    'Zakładka "Info" w menu autoklawu.': 'Вкладка «Инфо» в меню автоклава.',
    "2. Dane kontaktowe": "2. Контактные данные (адрес доставки)",
    "do przesyłki": "для отправки",
    "Nazwa firmy": "Название компании",
    "Numer seryjny": "Серийный номер",
    "Wpisz nazwę firmy": "Введите название компании",
    "Wpisz numer": "Введите серийный номер",
    "Numer VAT": "ИНН",
    "Wpisz numer VAT": "Введите ИНН",
    "Imię i nazwisko": "Имя и фамилия",
    "Wpisz pełne imię i nazwisko": "Введите полные имя и фамилию",
    "Adres e-mail": "Эл. почта",
    "Podaj adres e-mail": "Введите эл. почту",
    "Telefon": "Телефон",
    "Nazwa ulicy": "Улица",
    "Wpisz pełną nazwę ulicy": "Введите полное название улицы",
    "Numer budynku": "Номер дома",
    "Podaj numer": "Введите номер",
    "Numer z prefiksem kraju (np. +48 123 456 789)": "Номер с кодом страны (напр. +48 123 456 789)",
    "Numer lokalu": "Номер квартиры",
    "Wpisz jeżeli występuje": "Введите при наличии",
    "Kod pocztowy": "Почтовый индекс",
    "Wpisz kod": "Введите индекс",
    "Miasto": "Город",
    "Numery błędów lub/i komentarz": "Номера ошибок и/или комментарий",
    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone.":
      "Номер ошибки отображается на экране автоклава. Нажмите, чтобы перейти к следующему. Повторяйте, пока не отобразятся все номера.",
    "Wybierz numery błędów, zdjęcia lub komentarze": "Выберите номера ошибок, фото или комментарии",
    "Wybrano 1 błędów": "1 ошибка выбрана",
    "Wybrano 2 błędów": "2 ошибки выбрано",
    "Wybrano 3 błędów": "3 ошибки выбрано",
    "Wybrano 4 błędów": "4 ошибки выбрано",
    "Wybrano 5 błędów": "5 ошибок выбрано",
    "Wybrano 6 błędów": "6 ошибок выбрано",
    "Wybrano 7 błędów": "7 ошибок выбрано",
    "Wybrano 8 błędów": "8 ошибок выбрано",
    "Wybrano 9 błędów": "9 ошибок выбрано",
    "Wybrano 10 błędów": "10 ошибок выбрано",
    "Maszyna wydaje dziwne dźwięki.": "Машина издает странные звуки.",
    "Maszyna wydaje dziwne dźwięki...": "Машина издает странные звуки...",
    "Dodaj komentarz": "Добавить комментарий",
    "Twój komentarz...": "Ваш комментарий...",
    "Sukces!": "Успех!",
    "Ładowanie formularza...": "Загрузка формы...",
    "Błąd:": "Ошибка:",
    "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.":
      "Произошла сетевая ошибка. Проверьте консоль разработчика.",
    "Komentarz nie może być pusty.": "Комментарий не может быть пустым.",
    "Proszę dodać zdjęcie faktury lub świadectwa gwarancji.":
      "Добавьте фото счёта или гарантийного документа.",
    "Imię i nazwisko jest wymagane.": "Имя и фамилия обязательны.",
    "Adres e-mail jest wymagany.": "Эл. почта обязательна.",
    "Numer telefonu jest wymagany.": "Номер телефона обязателен.",
    "Numer seryjny jest wymagany.": "Серийный номер обязателен.",
    "Nazwa ulicy jest wymagana.": "Улица обязательна.",
    "Numer budynku jest wymagany.": "Номер дома обязателен.",
    "Kod pocztowy jest wymagany.": "Почтовый индекс обязателен.",
    "Miasto jest wymagane.": "Город обязателен.",
    "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).":
      "Приложите папку с USB-накопителя с логами автоклава (USB сзади устройства).",
    "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...":
      "Краткое описание (напр. получил другой товар, чем заказывал)...",
    "Dane rozpoznane z faktury, sprawdź poprawność":
      "Данные распознаны со счёта, проверьте правильность",
    "Zaznaczenie wszystkich zgód jest wymagane":
      "Необходимо отметить все согласия",
    "Akcesoria": "Аксессуары",
    "Zacznij pisać tutaj (nazwa akcesorium)...":
      "Начните вводить здесь (название аксессуара)...",
    "Powód reklamacji": "Причина рекламации",
    "Produkt uszkodzony": "Повреждённый товар",
    "Nie ten przedmiot": "Другой товар",
    "Wybierz z listy błędów": "Выберите из списка ошибок",
    "Błąd nr": "Ошибка №",
    "Błąd wyświetlacza": "Ошибка дисплея",
    "Główne działanie": "Основная работа",
    "Uszkodzenie mechaniczne": "Механическое повреждение",
    "Błąd próżni": "Ошибка вакуума",
    "Zdeformowany plastik": "Деформированный пластик",
    "Wilgotny wsad": "Влажная загрузка",
    "Niedopasowana obudowa drzwi": "Несоответствующий корпус двери",
    "Problem z otwieraniem drzwi": "Проблема с открытием двери",
    "Wyciek / przeciek wody": "Утечка воды",
    "Zapisano": "Сохранено",
    "Zatwierdź": "Подтвердить",
    "Komentarz": "Комментарий",
    "Potwierdź": "Подтвердить",
    "Gdzie szukać": "Где искать",
    "komentarz": "комментарий",
  },
  pt: {
    "Kraj": "País",
    "Wybierz z listy": "Escolha da lista",
    "Polska": "Polónia",
    "Niemcy": "Alemanha",
    "Czechy": "República Checa",
    "Opisz problem...": "Descreva o problema...",
    "Inny": "Outro",
    "Wystąpił błąd podczas przetwarzania faktury": "Ocorreu um erro ao processar a fatura",
    "Inny adres dostawy": "Outro endereço de entrega",
    "Nazwa firmy / nazwa": "Empresa / nome",
    "Adres": "Endereço",
    "Wpisz adres firmy": "Introduza o endereço da empresa",
    "Adres c.d.": "Endereço (cont.)",
    "Miasto odbioru": "Cidade de destino",
    "Przesyłanie folderu...": "A enviar a pasta...",
    "Wstecz": "Voltar",
    "Wyślij zgłoszenie serwisowe": "Enviar pedido de assistência",
    "Wyślij zgłoszenie": "Enviar pedido",
    "Wyślij formularz": "Enviar formulário",
    "Dodaj zdjęcie faktury lub świadectwa gwarancji": "Adicione uma foto da fatura ou do certificado de garantia",
    "Przetwarzanie faktury...": "A processar a fatura...",
    "Przeciągnij lub wybierz plik": "Arraste e largue ou escolha um ficheiro",
    "zrób zdjęcie": "tirar fotografia",
    "Dane z faktury zostały rozpoznane i będą użyte w formularzu.":
      "Os dados da fatura foram reconhecidos e serão utilizados no formulário.",
    "Dozwolone formaty: JPG, PDF": "Formatos permitidos: JPG, PDF",
    "Maksymalny rozmiar: 10 MB": "Tamanho máximo: 10 MB",
    "Dodaj folder autokławu": "Adicionar pasta do autoclave",
    "Przeciągnij lub": "Arraste ou",
    "wybierz folder": "escolha uma pasta",
    "Folder:": "Pasta:",
    "plików": "ficheiros",
    "Usuń folder": "Remover pasta",
    "Folder został pomyślnie dodany.": "A pasta foi adicionada com sucesso.",
    "Wybierz folder o numerze autoklawu,": "Escolha a pasta com o número do autoclave,",
    "np. ST01-PL-24-00001": "por ex. ST01-PL-24-00001",
    "1. Dane urządzenia": "1. Dados do dispositivo",
    "Autoklaw": "Autoclave",
    "Kliknij ponownie, aby zmienić wybór": "Clique novamente para alterar a seleção",
    "Serwis gwarancyjny": "Assistência em garantia",
    "Dla urządzeń objętych aktywną gwarancją producenta.": "Para dispositivos cobertos por garantia ativa do fabricante.",
    "Serwis pogwarancyjny": "Assistência fora de garantia",
    "Jeśli gwarancja już wygasła lub nie masz pewności": "Se a garantia já expirou ou não tem a certeza",
    "Sprawdź czy Twoje urządzenie jest na gwarancji": "Verifique se o seu dispositivo está em garantia",
    "Twoje urządzenie może być objęte gwarancją, jeśli:": "O seu dispositivo pode estar em garantia se:",
    "Od daty zakupu nie minęły 2 lata.": "Ainda não passaram 2 anos desde a data de compra.",
    "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją.":
      "No seu país, a revisão obrigatória foi realizada de acordo com o manual.",
    "UWAGA!": "ATENÇÃO!",
    "Warunki przeglądu różnią się w zależności od kraju.": "As condições de revisão variam consoante o país.",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji.":
      "Para verificar os detalhes da revisão, consulte a documentação:",
    "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:":
      "Para verificar os detalhes da revisão, consulte a documentação:",
    'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub':
      'Pen USB fornecida com o dispositivo → ficheiro "Condições de garantia" ou',
    'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub':
      'Pen USB fornecida com o dispositivo → ficheiro "Manual do utilizador" ou',
    'Zakładka "Info" w menu autoklawu.': 'Separador "Info" no menu do autoclave.',
    "2. Dane kontaktowe": "2. Dados de contacto (endereço de entrega)",
    "do przesyłki": "para envio",
    "Nazwa firmy": "Nome da empresa",
    "Numer seryjny": "Número de série",
    "Wpisz nazwę firmy": "Introduza o nome da empresa",
    "Wpisz numer": "Introduza o número de série",
    "Numer VAT": "NIF",
    "Wpisz numer VAT": "Introduza o NIF",
    "Imię i nazwisko": "Nome e apelido",
    "Wpisz pełne imię i nazwisko": "Introduza o nome completo",
    "Adres e-mail": "Endereço de e‑mail",
    "Podaj adres e-mail": "Introduza o endereço de e‑mail",
    "Telefon": "Telefone",
    "Nazwa ulicy": "Nome da rua",
    "Wpisz pełną nazwę ulicy": "Introduza o nome completo da rua",
    "Numer budynku": "Número da porta",
    "Podaj numer": "Introduza o número",
    "Numer z prefiksem kraju (np. +48 123 456 789)": "Número com indicativo do país (ex.: +351 ...)",
    "Numer lokalu": "Número de apartamento",
    "Wpisz jeżeli występuje": "Introduza se aplicável",
    "Kod pocztowy": "Código postal",
    "Wpisz kod": "Introduza o código postal",
    "Miasto": "Cidade",
    "Numery błędów lub/i komentarz": "Números de erro e/ou comentário",
    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone.":
      "O número de erro é apresentado no ecrã do autoclave. Toque para ir para o seguinte e repita até mostrar todos os números.",
    "Wybierz numery błędów, zdjęcia lub komentarze":
      "Selecione números de erro, fotografias ou comentários",
    "Wybrano 1 błędów": "1 erro selecionado",
    "Wybrano 2 błędów": "2 erros selecionados",
    "Wybrano 3 błędów": "3 erros selecionados",
    "Wybrano 4 błędów": "4 erros selecionados",
    "Wybrano 5 błędów": "5 erros selecionados",
    "Wybrano 6 błędów": "6 erros selecionados",
    "Wybrano 7 błędów": "7 erros selecionados",
    "Wybrano 8 błędów": "8 erros selecionados",
    "Wybrano 9 błędów": "9 erros selecionados",
    "Wybrano 10 błędów": "10 erros selecionados",
    "Maszyna wydaje dziwne dźwięki.": "A máquina emite sons estranhos.",
    "Maszyna wydaje dziwne dźwięki...": "A máquina emite sons estranhos...",
    "Dodaj komentarz": "Adicionar comentário",
    "Twój komentarz...": "O seu comentário...",
    "Sukces!": "Sucesso!",
    "Ładowanie formularza...": "A carregar o formulário...",
    "Błąd:": "Erro:",
    "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.":
      "Ocorreu um erro de rede. Verifique a consola do programador.",
    "Komentarz nie może być pusty.": "O comentário não pode estar vazio.",
    "Proszę dodać zdjęcie faktury lub świadectwa gwarancji.":
      "Adicione uma fotografia da fatura ou do certificado de garantia.",
    "Imię i nazwisko jest wymagane.": "O nome e apelido são obrigatórios.",
    "Adres e-mail jest wymagany.": "O endereço de e‑mail é obrigatório.",
    "Numer telefonu jest wymagany.": "O número de telefone é obrigatório.",
    "Numer seryjny jest wymagany.": "O número de série é obrigatório.",
    "Nazwa ulicy jest wymagana.": "O nome da rua é obrigatório.",
    "Numer budynku jest wymagany.": "O número da porta é obrigatório.",
    "Kod pocztowy jest wymagany.": "O código postal é obrigatório.",
    "Miasto jest wymagane.": "A cidade é obrigatória.",
    "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).":
      "Anexe a pasta da pen USB com os registos do autoclave (a pen encontra‑se na parte traseira do dispositivo).",
    "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...":
      "Breve descrição (por ex.: recebi um produto diferente do encomendado)...",
    "Dane rozpoznane z faktury, sprawdź poprawność":
      "Dados reconhecidos a partir da fatura, verifique se estão corretos",
    "Zaznaczenie wszystkich zgód jest wymagane":
      "É necessário assinalar todos os consentimentos",
    "Akcesoria": "Acessórios",
    "Zacznij pisać tutaj (nazwa akcesorium)...":
      "Comece a escrever aqui (nome do acessório)...",
    "Powód reklamacji": "Motivo da reclamação",
    "Produkt uszkodzony": "Produto danificado",
    "Nie ten przedmiot": "Produto incorreto",
    "Wybierz z listy błędów": "Escolha da lista de erros",
    "Błąd nr": "Erro n.º",
    "Błąd wyświetlacza": "Erro do ecrã",
    "Główne działanie": "Funcionamento principal",
    "Uszkodzenie mechaniczne": "Avaria mecânica",
    "Błąd próżni": "Erro de vácuo",
    "Zdeformowany plastik": "Plástico deformado",
    "Wilgotny wsad": "Carga húmida",
    "Niedopasowana obudowa drzwi": "Carcaça da porta desalinhada",
    "Problem z otwieraniem drzwi": "Problema ao abrir a porta",
    "Wyciek / przeciek wody": "Fuga de água",
    "Zapisano": "Guardado",
    "Zatwierdź": "Confirmar",
    "Komentarz": "Comentário",
    "Potwierdź": "Confirmar",
    "Gdzie szukać": "Onde encontrar",
    "komentarz": "comentário",
  },
}

const tr = (language: SupportedLanguage, text: string) =>
  UI_TRANSLATIONS[language][text] ?? UI_TRANSLATIONS.en[text] ?? text

const NAMED_ERRORS = [
  "Błąd wyświetlacza",
  "Główne działanie",
  "Uszkodzenie mechaniczne",
  "Błąd próżni",
  "Zdeformowany plastik",
  "Wilgotny wsad",
  "Niedopasowana obudowa drzwi",
  "Problem z otwieraniem drzwi",
  "Wyciek / przeciek wody",
]

export default function NewComplaintForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<FormStep>("product-selection")
  const [selectedCategory, setSelectedCategory] = useState<"autoclave" | "accessory" | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [serviceType, setServiceType] = useState<string>("")
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const [isFolderUploading, setIsFolderUploading] = useState(false) // State for folder upload animation
  const [folderUploadProgress, setFolderUploadProgress] = useState(0) // State for folder upload progress
  const [isErrorSelectionOpen, setIsErrorSelectionOpen] = useState(false) // State for error selection collapsible
  const [isFileUploading, setIsFileUploading] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0)
    const [comment, setComment] = useState("");
  const [fileUploadStatus, setFileUploadStatus] = useState<{
    success?: boolean
    error?: string
  } | null>(null)
    const [isFileImageUploading, setIsFileImageUploading] = useState(false)
  const [fileImageUploadProgress, setFileImageUploadProgress] = useState(0)
  const [fileImageUploadStatus, setFileImageUploadStatus] = useState<{
    success?: boolean
    error?: string
  } | null>(null)
  const [invoiceData, setInvoiceData] = useState<{
    nabywca?: {
      nazwa_firmy?: string
      ulica?: string
      numer_budynku?: string
      numer_lokalu?: string
      miasto?: string
      kod_pocztowy?: string
      kraj?: string
      nip?: string
      data_faktury?: string
    }
    wystawca?: {
      nazwa_firmy?: string
      numer_faktury?: string
    }
  } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedErrors, setSelectedErrors] = useState<string[]>([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [errorComment, setErrorComment] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<{ name: string; files: File[] } | null>(null)
 const [selectedImageFile, setSelectedImageFile] = useState(null);
   const [tempComment, setTempComment] = useState('');

  const [imagePreview, setImagePreview] = useState(null);

  const [isImageFileUploading, setIsImageFileUploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean
    message?: string
    originalFolder?: string
    zipFileName?: string
  } | null>(null)
  const { ref: contentRef, height: contentHeight } = useMeasureHeight()
  const [summaryData,setSummaryData]: any = useState({
    formId: "",
    attachment1: null,
    attachment2: null,
  })

  const urlLangParam = searchParams.get("lang")
  const language: SupportedLanguage =
    (urlLangParam && SUPPORTED_LANGUAGES.includes(urlLangParam as SupportedLanguage)
      ? (urlLangParam as SupportedLanguage)
      : "en")

  const handleLanguageChange = (nextLanguage: SupportedLanguage) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextLanguage === "en") {
      params.delete("lang")
    } else {
      params.set("lang", nextLanguage)
    }
    const nextQuery = params.toString()
    router.push(nextQuery ? `/?${nextQuery}` : "/")
  }

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language
    }
  }, [language])

  useEffect(() => {
    if (typeof window === "undefined") return

    const STORAGE_KEY = "enbio_maintanance_form_id"
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const uuid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${now.getTime()}-${Math.random().toString(16).slice(2)}`

    const formId = `ACC_MAINTANANCE_${year}_${month}_${day}_${uuid}`
    window.localStorage.setItem(STORAGE_KEY, formId)

    setSummaryData((prev: any) => ({
      ...prev,
      formId,
      formType: "maintenance",
    }))
  }, [])
  const [consentsValid, setConsentsValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Form data state
  const [formData, setFormData] = useState({
    // Common Contact details
    name: "",
    email: "",
    phonePrefix: "",
    phoneNumber: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
    postalCode: "",
    city: "",
    country: "",
    companyName: "", // For post-warranty service
    vatNumber: "", // For post-warranty service
    // Other delivery address
    otherDeliveryAddress: false,
    deliveryCompanyName: "",
    deliveryAddress: "",
    deliveryAddress2: "",
    deliveryPostalCode: "",
    deliveryCity: "",
    deliveryCountry: "",

    // Autoclave Service Form specific details
    serialNumber: "",
    purchaseDate: "",
    dealer: "",
    deviceCountry: "",
    issueDescription: "", // This is the comment for autoclave
    invoiceData: [],
    serviceUploadedFile: null as File | null,
    selectedErrorCodes: [] as string[], // Error codes for autoclave
    uploadedFolder: null as FileList | null, // Autoclave logs folder
    uploadedFolderName: "",
    uploadedFolderZipName: "",

    // Accessory Complaint Form specific details
    complaintReason: "", // e.g., "damaged", "not-this-item", "other"
    accessoryCustomReasonText: "", // New: for "other" complaint reason text
    accessoryOtherProductName: "", // New: for "other" accessory product name
    uploadedFile: null as File | null, // For accessory invoice
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})

  const handleProductSelect = (productId: string, category: "autoclave" | "accessory") => {
    setSelectedProduct(productId)
    setSelectedCategory(category)

    if (category === "autoclave") {
      // Autoklawy prowadzą do wyboru serwisu z animacją
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep("service-selection")
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    } else {
      // Akcesoria prowadzą do formularza reklamacyjnego z animacją
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep("complaint-form")
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    }
  }
  const handleCommentChange = (e) => {
    setTempComment(e.target.value);
    setIsConfirmed(false);
  };

  // Zatwierdza komentarz, przenosząc go do stanu głównego
  const handleConfirmClick = () => {
    if (tempComment.trim() === '') {
      alert(tr(language, "Komentarz nie może być pusty."));
      return;
    }
    // Kopiuje tymczasowy komentarz do głównego stanu
    setComment(tempComment);

    //if (onConfirm) {
      // Przekazuje ostateczny komentarz do komponentu nadrzędnego
      //onConfirm({ comment: tempComment });
    //}

    setIsConfirmed(true);
    console.log(`Zapisano komentarz: "${tempComment}"`);
  };
  const handleServiceTypeSelect = (type: string) => {
    setServiceType(type)
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentStep("service-form")
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleErrorCode = (code: string) => {
    setFormData((prev) => {
      const currentCodes = prev.selectedErrorCodes
      if (currentCodes.includes(code)) {
        return {
          ...prev,
          selectedErrorCodes: currentCodes.filter((c) => c !== code),
        }
      } else {
        return {
          ...prev,
          selectedErrorCodes: [...currentCodes, code],
        }
      }
    })
  }

  const simulateUpload = (
      file: File,
      setFileState: (file: File | null) => void,
      setIsUploadingState: (isUploading: boolean) => void,
      setUploadProgressState: (progress: number) => void,
  ) => {
    setIsUploadingState(true)
    setUploadProgressState(0)

    let progress = 0
    const interval = setInterval(() => {
      progress += 10 // Increment by 10%
      if (progress <= 100) {
        setUploadProgressState(progress)
      } else {
        clearInterval(interval)
        setFileState(file) // Set the file after simulation
        setIsUploadingState(false)
        setUploadProgressState(0) // Reset progress for next upload
      }
    }, 100) // Update every 100ms
  }

  const simulateFolderUpload = (
      files: FileList,
      setFolderState: (files: FileList | null) => void,
      setIsUploadingState: (isUploading: boolean) => void,
      setUploadProgressState: (progress: number) => void,
  ) => {
    setIsUploadingState(true)
    setUploadProgressState(0)

    let progress = 0
    const interval = setInterval(() => {
      progress += 10 // Increment by 10%
      if (progress <= 100) {
        setUploadProgressState(progress)
      } else {
        clearInterval(interval)
        setFolderState(files) // Set the folder after simulation
        setIsUploadingState(false)
        setUploadProgressState(0) // Reset progress for next upload
      }
    }, 100) // Update every 100ms
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      simulateUpload(
          file,
          (f) => setFormData((prev) => ({ ...prev, uploadedFile: f })),
          setIsUploading,
          setUploadProgress,
      )
    }
  }

  const handleDeleteFile = () => {
    setFormData((prev) => ({ ...prev, uploadedFile: null }))
  }

  const handleFileDelete = () => {
    setSelectedFile(null);
    setFileUploadStatus(null);
    setInvoiceData(null);
    setFileUploadProgress(0);
    setIsFileUploading(false);
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFileDownload = () => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleServiceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Rozpocznij upload
      setIsFileUploading(true)
      setFileUploadProgress(0)
      setFileUploadStatus(null)
      setSummaryData((prev:any) => ({...prev, attachment1: file}))

      try {
        const formData = new FormData()
        const storedFormId =
          (typeof window !== "undefined" &&
            window.localStorage.getItem("enbio_maintanance_form_id")) ||
          summaryData.formId
        if (storedFormId) {
          formData.append("formId", storedFormId)
        }
        formData.append("file", file)

        // Symulacja postępu uploadu
        const progressInterval = setInterval(() => {
          setFileUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 300)

        // Wyślij plik przez proxy (omija CORS)
        const response = await fetch("/api/process-invoice", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)

        if (response.ok) {
          const result = await response.json()
          console.log("Invoice processing response:", result)
          setFileUploadProgress(100)

          if (result.success === false) {
            setFileUploadStatus({
              success: false,
              error: result.error || tr(language, "Wystąpił błąd podczas przetwarzania faktury"),
            })
          } else {
            // Zapisz dane faktury
            console.log("Otrzymane dane faktury:", result) // Dodaj logowanie
            setInvoiceData(result)
            setFileUploadStatus({
              success: true,
            })

            // Jeśli mamy dane nabywcy, uzupełnij formularz
            console.log(result.data)
            console.log(fileUploadStatus)
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          const message =
            (errorData && typeof errorData.error === "string" && errorData.error) ||
            tr(language, "Wystąpił błąd podczas przesyłania pliku. Spróbuj ponownie.")
          setFileUploadStatus({ success: false, error: message })
        }
      } catch (error) {
        console.error("Upload error:", error)
        setFileUploadStatus({
          success: false,
          error: tr(language, "Wystąpił błąd podczas przesyłania pliku. Spróbuj ponownie."),
        })
      } finally {
        setTimeout(() => {
          setIsFileUploading(false)
        }, 500)
      }
    }
  }

  const handleDeleteServiceFile = () => {
    setFormData((prev) => ({ ...prev, serviceUploadedFile: null }))
  }

    const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      // Utwórz podgląd obrazu
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // wyciągnij nazwę folderu z pierwszego pliku
      const first = files[0] as File & { webkitRelativePath?: string }
      const firstPath = first.webkitRelativePath || ""
      const folderName = firstPath.split("/")[0] || "folder"

      // zapisz do formData: samą listę plików + nazwy folderu
      setFormData(prev => ({
        ...prev,
        uploadedFolder: files,
        uploadedFolderName: folderName,
        uploadedFolderZipName: `${folderName}.zip`,
      }))

      setSummaryData((prev:any)=> ({...prev,attachment2: files}))

      // (jeśli chcesz zachować progres/animację jak dotąd)
      simulateFolderUpload(
        files,
        (f) => setFormData(prev => ({ ...prev, uploadedFolder: f })),
        setIsFolderUploading,
        setFolderUploadProgress,
      )
    }
  }

  const handleDeleteFolder = () => {
    setFormData((prev) => ({ ...prev, uploadedFolder: null }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCategory === "autoclave" && serviceType === "warranty" && fileUploadProgress !== 100) {
      alert(tr(language, "Proszę dodać zdjęcie faktury lub świadectwa gwarancji."))
      return
    }
    const errors: string[] = []
    const newFieldErrors: Record<string, boolean> = {}

    if (!formData.serialNumber.trim()) {
      errors.push(tr(language, "Numer seryjny jest wymagany."))
      newFieldErrors.serialNumber = true
    }

    if (!formData.name.trim()) {
      errors.push(tr(language, "Imię i nazwisko jest wymagane."))
      newFieldErrors.name = true
    }

    if (!formData.email.trim()) {
      errors.push(tr(language, "Adres e-mail jest wymagany."))
      newFieldErrors.email = true
    }

    if (!formData.phonePrefix.trim() || !formData.phoneNumber.trim()) {
      errors.push(tr(language, "Numer telefonu jest wymagany."))
      newFieldErrors.phonePrefix = true
      newFieldErrors.phoneNumber = true
    }

    if (!formData.street.trim()) {
      errors.push(tr(language, "Nazwa ulicy jest wymagana."))
      newFieldErrors.street = true
    }

    if (!formData.buildingNumber.trim()) {
      errors.push(tr(language, "Numer budynku jest wymagany."))
      newFieldErrors.buildingNumber = true
    }

    if (!formData.postalCode.trim()) {
      errors.push(tr(language, "Kod pocztowy jest wymagany."))
      newFieldErrors.postalCode = true
    }

    if (!formData.city.trim()) {
      errors.push(tr(language, "Miasto jest wymagane."))
      newFieldErrors.city = true
    }

    setFieldErrors(newFieldErrors)
    if (errors.length > 0) {
      alert(errors.join("\n"))
      return
    }

    let dataToSave: any = {
      // Common contact details
      name: formData.name,
      email: formData.email,
      phone: `${formData.phonePrefix} ${formData.phoneNumber}`.trim(),
      street: formData.street,
      buildingNumber: formData.buildingNumber,
      apartmentNumber: formData.apartmentNumber,
      postalCode: formData.postalCode,
      city: formData.city,
      country: formData.country,

      // Category selection
      selectedCategory,
      selectedProduct,
      productLabel: getSelectedProductLabel(),
      serviceType, // Only relevant for autoclave
      invoiceData,
      comment,
      attachedDocuments: [selectedFile?.name],
      attachedissueDocuments: [selectedFile?.name],
    }

    if (selectedCategory === "autoclave") {
      dataToSave = {
        ...dataToSave,
        // Autoclave specific fields
        serialNumber: formData.serialNumber,
        purchaseDate: formData.purchaseDate,
        dealer: formData.dealer,
        deviceCountry: formData.deviceCountry,
        issueDescription: formData.issueDescription, // Autoclave comment
        selectedErrorCodes: formData.selectedErrorCodes, // Autoclave errors
        serviceUploadedFile: formData.serviceUploadedFile ? formData.serviceUploadedFile.name : null,
        uploadedFolder: formData.uploadedFolder ? Array.from(formData.uploadedFolder).map((f) => f.name) : null,
        uploadedFolderZipName: formData.uploadedFolderZipName || null,
        attachedDocuments: [selectedFile?.name],
        // Post-warranty service company fields
        companyName: formData.companyName || "",
        vatNumber: formData.vatNumber || "",
        // Other delivery address
        otherDeliveryAddress: formData.otherDeliveryAddress || false,
        deliveryCompanyName: formData.deliveryCompanyName || "",
        deliveryAddress: formData.deliveryAddress || "",
        deliveryAddress2: formData.deliveryAddress2 || "",
        deliveryPostalCode: formData.deliveryPostalCode || "",
        deliveryCity: formData.deliveryCity || "",
        deliveryCountry: formData.deliveryCountry || "",
      }
    } else if (selectedCategory === "accessory") {
      dataToSave = {
        ...dataToSave,
        // Accessory specific fields, mapped to SummaryForm's expected fields
        // Map complaint reason to issueDescription or a new field
        issueDescription:
            ["damaged", "not-this-item", "other"].includes(formData.complaintReason)
              ? tempComment
              : formData.complaintReason,
        // If "other" product was selected, its custom name should also be passed
        accessoryOtherProductName: selectedProduct === "other" ? formData.accessoryOtherProductName : null,
        accessoryComplaintReason: formData.complaintReason, // <- zapisz id powodu: "damaged" | "not-this-item" | "other"
        uploadedFile: formData.uploadedFile ? formData.uploadedFile.name : null, // Accessory invoice
        // No selectedErrorCodes for accessories, so it will be an empty array by default in SummaryForm
        attachedIssueDocuments: [selectedImageFile?.name],
      }
    }
    const storedFormId =
      (typeof window !== "undefined" &&
        window.localStorage.getItem("enbio_maintanance_form_id")) ||
      summaryData.formId

    const dataWithFormId = {
      ...dataToSave,
      formId: storedFormId,
      lang: language,
    }

    localStorage.setItem("contactData", JSON.stringify(dataWithFormId))

    setSummaryData((prev: any) => ({
      ...prev,
      ...dataWithFormId,
      formId: storedFormId,
      lang: language,
    }))

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep("summary")
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 300)
  }

  const handleFinalSubmit = async (event:any) => {
    event.preventDefault()
    if (isSubmitting) return

    const customerName = (summaryData?.name || "").trim()
    const autoclaveNumber = (summaryData?.serialNumber || "").trim()
    const validationErrors: string[] = []

    if (!customerName) {
      validationErrors.push(tr(language, "Imię i nazwisko jest wymagane."))
    }
    if (selectedCategory === "autoclave" && !autoclaveNumber) {
      validationErrors.push(tr(language, "Numer seryjny jest wymagany."))
    }
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"))
      return
    }

    setIsSubmitting(true)
    console.log("Wysyłanie danych do serwera:", summaryData)

    try {
      const response = await fetch("/api/process-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summaryData),
      })

      const result = await response.json().catch(() => ({}))
      console.log("Odpowiedź serwera:", result)

      if (response.ok) {
        router.push(`/success${language !== "en" ? `?lang=${language}` : ""}`)
      } else {
        alert(
          tr(language, "Błąd:") +
            " " +
            ((result && (result.message || result.error)) || ""),
        )
      }
    } catch (error) {
      console.error("Krytyczny błąd wysyłania formularza:", error)
      alert(
        tr(
          language,
          "Wystąpił błąd sieci. Sprawdź konsolę deweloperską.",
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackFromSummary = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      if (selectedCategory === "autoclave") {
        setCurrentStep("service-form")
      } else {
        setCurrentStep("complaint-form")
      }
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 300)
  }

  const getInputStyles = (value: string, hasError: boolean = false) => {
    const baseStyles =
        "h-[48px] sm:h-[52px] rounded-lg pt-2 pr-5 pb-2 pl-4 transition-colors duration-200 text-base border-solid"
    const filledStyles = "bg-white border-gray-300 text-gray-900"
    const emptyStyles = "bg-white border-gray-300 text-gray-600 placeholder:text-gray-400"
    const errorStyles = "bg-white border-red-500 text-gray-900 placeholder:text-red-400"

    // Add hover and focus styles
    const hoverFocusStyles = "hover:bg-white hover:border-gray-400 focus:bg-white focus:border-gray-400"

    const stateStyles = hasError ? errorStyles : value ? filledStyles : emptyStyles

    return `${baseStyles} ${stateStyles} ${hoverFocusStyles}`
  }

  const formatCountryLabel = (value: string) => {
    if (!value) return ""
    return value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
  }

  const getSelectedProductLabel = () => {
    if (selectedCategory === "autoclave") {
      return AUTOCLAVE_OPTIONS.find((opt) => opt.id === selectedProduct)?.label || ""
    } else if (selectedCategory === "accessory") {
      return ACCESSORY_OPTIONS.find((opt) => opt.id === selectedProduct)?.label || ""
    }
    return ""
  }

  const handleBackToSelection = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep("product-selection")
      setSelectedCategory(null)
      setSelectedProduct("")
      setServiceType("")
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 300)
  }

  const handleBackToServiceSelection = () => {
    // 👉 wyczyść wybór typu serwisu (odznaczy radio)
    setServiceType("");

    // (opcjonalnie) wyczyść też dane sekcji serwisowej
    setFormData(prev => ({
      ...prev,
      serviceUploadedFile: null,
      selectedErrorCodes: [],
      issueDescription: "",
      uploadedFolder: null,
    }));

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep("service-selection");
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const renderFileUploadSection = (
      file: File | null,
      onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void,
      onFileDelete: () => void,
      onFileDownload: () => void,
      successMessage: string,
      tooltipContent: string,
      isCurrentlyUploading: boolean,
      currentUploadProgress: number,
      isRequired: boolean, // New prop for required
  ) => {
    const fileInputId = `file-upload-${Math.random().toString(36).substring(7)}` // Unique ID for input

    return (
        <div>
          <div className="border-t border-gray-200 pt-8 mt-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-900 text-sm">
                  {tr(language, "Dodaj zdjęcie faktury lub świadectwa gwarancji")}
                </Label>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-600 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent
                        side="top"
                        align="end"
                        className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 [border-radius:0.375rem_0.375rem_0px_0.375rem!important] z-50 -translate-x-2"
                        sideOffset={5}
                    >
                      <p className="text-sm">
                        {tr(language, "Dodaj zdjęcie faktury lub świadectwa gwarancji")}
                      </p>
                      <TooltipArrow className="fill-blue-100" offset={8} />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="border border-dashed border-gray-300 rounded-md p-4 py-8 min-h-[100px] flex items-center bg-white relative">
                <input
                    type="file"
                    id="fileUpload"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleServiceFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isFileUploading}
                     required
                />
                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm w-full">
                  {isFileUploading ? (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-900">
                            {tr(language, "Przetwarzanie faktury...")}
                          </span>
                          <span className="text-gray-900">{fileUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                              style={{ width: `${fileUploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                  ) : selectedFile ? (
                      <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="h-4 w-4 text-gray-900" />
                        <span className="text-gray-900">{selectedFile.name}</span>
                        </div>
                              <div className="flex items-center gap-3 z-20 flex-shrink-0">
                    <Download
                      className="w-4 text-gray-600 hover:text-gray-900 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onFileDownload(); }}
                    />
                    <X
                      className="w-4 text-gray-600 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onFileDelete(); }}
                    />
                  </div>
                      </div>
                  ) : (
                      <>
                        <span>{tr(language, "Przeciągnij lub wybierz plik")}</span>
                        <Paperclip className="h-4 w-4" />
                        <span>{tr(language, "zrób zdjęcie")}</span>
                        <Camera className="h-4 w-4" />
                      </>
                  )}
                </div>
              </div>

              {fileUploadStatus && !fileUploadStatus.success && (
                  <div className="mt-2 text-sm text-red-500">
                    {tr(language, fileUploadStatus.error || "")}
                  </div>
              )}

              {invoiceData && (
                  <div className="mt-2 text-sm text-green-500">
                    {tr(
                      language,
                      "Dane z faktury zostały rozpoznane i będą użyte w formularzu."
                    )}
                  </div>
              )}

              <div className="flex justify-between mt-2">
                <span className="text-gray-600 text-xs">
                  {tr(language, "Dozwolone formaty: JPG, PDF")}
                </span>
                <span className="text-gray-600 text-xs">
                  {tr(language, "Maksymalny rozmiar: 10 MB")}
                </span>
              </div>
            </div>
          </div>
        </div>
    )
  }

  const renderFolderUploadSection = (
      folder: FileList | null,
      onFolderUpload: (event: React.ChangeEvent<HTMLInputElement>) => void,
      onFolderDelete: () => void,
      tooltipContent: string,
      isCurrentlyUploading: boolean,
      currentUploadProgress: number,
  ) => {
    const folderInputId = `folder-upload-${Math.random().toString(36).substring(7)}` // Unique ID for input
    const folderName = folder && folder.length > 0 ? folder[0].webkitRelativePath.split("/")[0] : ""

    return (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
            <Label htmlFor={folderInputId} className="text-gray-900 text-sm font-normal text-[14px]">
              {tr(language, "Dodaj folder autokławu")}
            </Label>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-600 cursor-help flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    align="end"
                    className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 [border-radius:0.375rem_0.375rem_0px_0.375rem!important] z-50 -translate-x-2"
                    sideOffset={5}
                >
                  <p className="text-sm">{tooltipContent}</p>
                  <TooltipArrow className="fill-blue-100" offset={8} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div
              className={`border border-solid rounded-md p-4 py-8 min-h-[100px] flex items-center relative transition-all duration-200 ${
                  folder
                      ? "bg-white border-gray-300"
                      : isCurrentlyUploading
                          ? "bg-white border-gray-300 cursor-not-allowed"
                          : "bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900 cursor-pointer group"
              }`}
          >
            <input
                id={folderInputId}
                type="file"
                // @ts-ignore - webkitdirectory nie jest standardową właściwością, ale działa w większości przeglądarek
                webkitdirectory=""
                directory=""
                onChange={onFolderUpload}
                className={`absolute inset-0 w-full h-full opacity-0 ${
                    isCurrentlyUploading || !!folder ? "pointer-events-none" : "cursor-pointer"
                }`}
                disabled={isCurrentlyUploading || !!folder} 
                // Disable input during upload or if folder exists
            />
            {isCurrentlyUploading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-gray-600 text-sm w-full px-2">
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-100 ease-linear"
                        style={{ width: `${currentUploadProgress}%` }}
                    ></div>
                  </div>
                  <span>
                    {tr(language, "Przesyłanie folderu...")} {currentUploadProgress}%
                  </span>
                </div>
            ) : !folder ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-600 text-sm w-full group-hover:text-gray-900 transition-colors duration-200 px-2">
                  <div className="flex items-center gap-1">
                    <span>{tr(language, "Przeciągnij lub")}</span>
                    <span className="text-gray-600 underline">
                      {tr(language, "wybierz folder")}
                    </span>
                    <Folder className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  </div>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm w-full px-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-900 text-base flex-1 truncate">
                    {tr(language, "Folder:")} {folderName} ({folder.length}{" "}
                    {tr(language, "plików")})
                  </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* No direct download for folder via URL.createObjectURL, so omitting download button */}
                      <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation() // Stop propagation
                            onFolderDelete()
                          }}
                          className="w-5 h-5 rounded bg-transparent flex items-center justify-center transition-colors"
                          title={tr(language, "Usuń folder")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {folder && (
            <div className="mt-2 text-sm text-green-600">
              {tr(language, "Folder został pomyślnie dodany.")}
            </div>
          )}

          <p className="text-gray-600 text-xs mt-4">
            {tr(language, "Wybierz folder o numerze autoklawu,")}
            <br />
            {tr(language, "np. ST01-PL-24-00001")}
          </p>
        </div>
    )
  }

  const renderProductSelection = () => (
      <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 lg:px-36 lg:py-24 w-full border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Autoclave Section */}
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="text-gray-900 text-lg font-medium">
                {tr(language, "Autoklaw")}
              </span>
            </div>

            <div className="space-y-3 md:space-y-4 leading-3">
              {AUTOCLAVE_OPTIONS.map((option) => (
                  <button
                      key={option.id}
                      onClick={() => handleProductSelect(option.id, "autoclave")}
                      className="block w-full text-left p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-md min-h-[48px] flex items-center"
                  >
                    {tr(language, option.label)}
                  </button>
              ))}
            </div>
          </div>

          {/* Accessories Section (hidden – only autoclaves selectable) */}
          {false && (
            <div>
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <span className="text-gray-900 text-lg font-medium">{tr(language, "Akcesoria")}</span>
              </div>

              <div className="space-y-3 md:space-y-4 leading-3">
                {ACCESSORY_OPTIONS.map((option) => (
                    <div
                        key={option.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer min-h-[48px]"
                        onClick={() => handleProductSelect(option.id, "accessory")}
                    >
                      <span className="text-gray-700 hover:text-gray-900 transition-colors">{tr(language, option.label)}</span>
                    </div>
                ))}
                {selectedProduct === "other" && selectedCategory === "accessory" && (
                    <div className="mt-4">
                      <Textarea
                          placeholder={tr(language, "Zacznij pisać tutaj (nazwa akcesorium)...")}
                          value={formData.accessoryOtherProductName}
                          onChange={(e) => handleInputChange("accessoryOtherProductName", e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-600 min-h-[80px] resize-none rounded-lg focus:border-gray-400 focus:ring-0 w-full text-base"
                      />
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  )

  const renderServiceSelection = () => (
      <div className="bg-white rounded-xl p-4 sm:p-6 md:p-12 border border-gray-200 w-full">
        <h2 className="text-gray-900 text-lg sm:text-xl font-semibold mb-4 sm:mb-6 tracking-tight">
          {tr(language, "1. Dane urządzenia")}
        </h2>

        <div className="bg-white rounded-md p-4 sm:p-5 w-full max-w-[430px]">
          <div className="space-y-4 sm:space-y-6">
            {/* Selected Product Display */}
            <button
                type="button"
                onClick={handleBackToSelection}
                className="flex items-start gap-3 mb-6 sm:mb-8 w-full text-left bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded-md p-2 -m-2 transition-all duration-300 ease-in-out min-h-[48px]"
            >
              <div className="mt-1 relative flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-gray-900 font-medium text-base cursor-pointer block">
                  {tr(language, "Autoklaw")}
                </Label>
                <p className="text-gray-600 text-sm mt-1 break-words">{tr(language, getSelectedProductLabel())}</p>
              </div>
            </button>
            <p className="text-gray-600 text-xs mt-2 ml-8">
              {tr(language, "Kliknij ponownie, aby zmienić wybór")}
            </p>

            <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-4 sm:mt-6">
              {/* Service Type Selection */}
              <div className="space-y-4 sm:space-y-6">
                <div
                    className={`flex items-start gap-3 transition-all duration-300 ease-in-out hover:bg-gray-100 rounded-md p-2 -m-2 cursor-pointer min-h-[60px] ${serviceType === "warranty" ? "bg-gray-100" : ""}`}
                    onClick={() => handleServiceTypeSelect("warranty")}
                >
                  <div className="mt-1 relative flex items-center justify-center flex-shrink-0">
                    <input
                        type="radio"
                        id="warranty"
                        name="serviceType"
                        value="warranty"
                        checked={serviceType === "warranty"}
                        onChange={() => {}}
                        className="appearance-none w-5 h-5 rounded-full border border-gray-400 checked:border-gray-300 focus:outline-none transition-all duration-200"
                    />
                    {serviceType === "warranty" && (
                        <div className="absolute w-2.5 h-2.5 bg-gray-900 rounded-full pointer-events-none"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="warranty" className="text-gray-900 font-medium text-base cursor-pointer block">
                      {tr(language, "Serwis gwarancyjny")}
                    </Label>
                    <p className="text-gray-600 text-sm mt-1">
                      {tr(language, "Dla urządzeń objętych aktywną gwarancją producenta.")}
                    </p>
                  </div>
                </div>

                <div
                    className={`flex items-start gap-3 transition-all duration-300 ease-in-out hover:bg-gray-100 rounded-md p-2 -m-2 cursor-pointer min-h-[60px] ${serviceType === "post-warranty" ? "bg-gray-100" : ""}`}
                    onClick={() => handleServiceTypeSelect("post-warranty")}
                >
                  <div className="mt-1 relative flex items-center justify-center flex-shrink-0">
                    <input
                        type="radio"
                        id="post-warranty"
                        name="serviceType"
                        value="post-warranty"
                        checked={serviceType === "post-warranty"}
                        onChange={() => {}}
                        className="appearance-none w-5 h-5 rounded-full border border-gray-400 checked:border-gray-300 focus:outline-none transition-all duration-200"
                    />
                    {serviceType === "post-warranty" && (
                        <div className="absolute w-2.5 h-2.5 bg-gray-900 rounded-full pointer-events-none"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="post-warranty" className="text-gray-900 font-medium text-base cursor-pointer block">
                      {tr(language, "Serwis pogwarancyjny")}
                    </Label>
                    <p className="text-gray-600 text-sm mt-1">
                      {tr(language, "Jeśli gwarancja już wygasła lub nie masz pewności")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warranty Check Collapsible */}
              <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-4">
                <Collapsible open={isServiceOpen} onOpenChange={setIsServiceOpen}>
                  <CollapsibleTrigger className="flex items-center text-gray-900 transition-all duration-300 focus:outline-none rounded-sm min-h-[48px] w-full">
                    <span className="text-sm flex-1 text-left">
                      {tr(language, "Sprawdź czy Twoje urządzenie jest na gwarancji")}
                    </span>
                    <div
                        className={`ml-2 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center transition-all duration-300 ease-in-out flex-shrink-0 ${isServiceOpen ? "rotate-180" : "rotate-0"}`}
                    >
                      <ChevronDown className="h-3 w-3 text-gray-900" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <div className="mt-4 text-gray-700 text-sm space-y-4">
                      <div>
                        <h4 className="text-gray-900 font-semibold mb-3">
                          {tr(language, "Twoje urządzenie może być objęte gwarancją, jeśli:")}
                        </h4>
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                          <li>
                            {tr(language, "Od daty zakupu nie minęły 2 lata.")}
                          </li>
                          <li>
                            {tr(
                              language,
                              "W Twoim kraju wymagany przegląd został wykonany zgodnie z instrukcją."
                            )}
                          </li>
                        </ol>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-gray-900 font-bold text-sm">!</span>
                          </div>
                          <div>
                            <p className="text-red-700 font-semibold mb-1">{tr(language, "UWAGA!")}</p>
                            <p className="text-red-600 font-normal">
                              {tr(language, "Warunki przeglądu różnią się w zależności od kraju.")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-2 mb-3">
                          <span className="text-gray-600">🔗</span>
                          <p className="text-gray-700 font-normal">
                            {tr(
                              language,
                              "Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:"
                            )}
                          </p>
                        </div>
                        <ul className="list-disc list-inside space-y-2 ml-6 text-gray-700 font-normal">
                          <li>
                            {tr(
                              language,
                              'Pendrive dołączony do urządzenia → plik "Warunki gwarancji" lub'
                            )}
                          </li>
                          <li>
                            {tr(
                              language,
                              'Pendrive dołączony do urządzenia → plik "Instrukcja użytkownika" lub'
                            )}
                          </li>
                          <li>
                            {tr(language, 'Zakładka "Info" w menu autoklawu.')}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-start mt-4 sm:mt-6">
          <button
              type="button"
              onClick={handleBackToSelection}
              className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity min-h-[48px] px-2 -mx-2"
              style={{
                fontFamily: "Inter, sans-serif",
                fontStyle: "normal",
                fontWeight: 500,
                fontSize: "14px",
                letterSpacing: "-0.5px",
                color: "#6b7280",
              }}
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span>{tr(language, "Wstecz")}</span>
          </button>
        </div>
      </div>
  )

  const renderServiceForm = () => {
    return (
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl p-4 sm:p-6 md:p-12 border border-gray-200 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-16">
            {/* Left Column - Device Data */}
            <div>
              <h2 className="text-gray-900 text-lg sm:text-xl font-semibold mb-4 sm:mb-6 tracking-tight">
                {tr(language, "1. Dane urządzenia")}
              </h2>

              <div className="bg-white rounded-md p-4 sm:p-5">
                {/* Selected Product Display */}
                <button
                    type="button"
                    onClick={handleBackToServiceSelection}
                    className="flex items-start gap-3 mb-6 sm:mb-8 w-full text-left bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded-md p-2 -m-2 transition-all duration-300 ease-in-out min-h-[48px]"
                >
                  <div className="mt-1 relative flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-gray-900 font-medium text-base cursor-pointer block">
                      {serviceType === "warranty"
                        ? tr(language, "Serwis gwarancyjny")
                        : tr(language, "Serwis pogwarancyjny")}
                    </Label>
                    <p className="text-gray-600 text-sm mt-1 break-words">{tr(language, getSelectedProductLabel())}</p>
                  </div>
                </button>
                <p className="text-gray-600 text-xs mt-2 ml-8">
                  {tr(language, "Kliknij ponownie, aby zmienić wybór")}
                </p>

                <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-4 sm:mt-6">
                  <div className="space-y-8 sm:space-y-11">
                    {/* Proof of Purchase (Conditional for Warranty) */}
                    {serviceType === "warranty" &&
                        renderFileUploadSection(
                            formData.serviceUploadedFile,
                            handleServiceFileUpload,
                            handleFileDelete,
                            handleFileDownload,
                            "Dane z faktury zostały rozpoznane i będą użyte w formularzu.",
                            "Dodaj zdjęcie faktury lub dokumentu gwarancyjnego",
                            isUploading,
                            uploadProgress,
                            true, // This field is now required
                        )}

                    {/* Error Numbers or Comments (currently disabled for all service types) */}
                    {false && (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                        <Label className="text-gray-900 text-sm font-normal text-[14px]">
                          {tr(language, "Numery błędów lub/i komentarz")}
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-xs">
                            {tr(language, "Gdzie szukać")}
                          </span>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-600 cursor-help flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent
                                  side="top"
                                  align="end"
                                  className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 [border-radius:0.375rem_0.375rem_0px_0.375rem!important] z-50 -translate-x-2"
                                  sideOffset={5}
                              >
                                <p className="text-sm">
                                  {tr(
                                    language,
                                    "Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego. Powtarzaj, aż wszystkie numery zostaną wyświetlone."
                                  )}
                                </p>
                                <TooltipArrow className="fill-blue-100" offset={8} />
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <Collapsible open={isErrorSelectionOpen} onOpenChange={setIsErrorSelectionOpen}>
                        <div className="bg-white border border-gray-300 rounded-lg">
                          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-t-lg border-b border-gray-300 min-h-[48px] bg-white">
                          <span className="text-gray-600 text-sm flex-1 text-gray-600">
                            {isErrorSelectionOpen ||
                            (formData.selectedErrorCodes.length === 0 && !formData.issueDescription)
                              ? tr(
                                  language,
                                  "Wybierz numery błędów, zdjęcia lub komentarze"
                                )
                              : `${formData.selectedErrorCodes.length > 0 ? tr(
                                  language,
                                  `Wybrano ${formData.selectedErrorCodes.length} błędów`
                                ) : ""}${formData.selectedErrorCodes.length > 0 && formData.issueDescription ? " + " : ""}${formData.issueDescription ? tr(language, "komentarz") : ""}`}
                          </span>
                            <ChevronDown className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          </CollapsibleTrigger>

                          {/* Display selected errors and comment when closed and data exists */}
                          {!isErrorSelectionOpen &&
                              (formData.selectedErrorCodes.length > 0 || formData.issueDescription) && (
                                  <div className="p-4 bg-white">
                                    {/* Selected Errors */}
                                    {formData.selectedErrorCodes.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          {formData.selectedErrorCodes.map((code) => (
                                              <div
                                                  key={code}
                                                  className="bg-blue-600 text-white px-3 py-1 rounded-full h-10 text-sm flex items-center gap-2"
                                              >
                                                <span>
                                                {code.startsWith("Błąd nr ")
                                                  ? `${tr(language, "Błąd nr")} ${code.replace("Błąd nr ", "")}`
                                                  : tr(language, code)}
                                              </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleErrorCode(code)}
                                                    className="hover:bg-blue-700 rounded-full p-0.5"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </div>
                                          ))}
                                        </div>
                                    )}

                                    {/* Comment Textarea - Only visible when there's content */}
                                    {formData.issueDescription && (
                                        <Textarea
                                            value={formData.issueDescription}
                                            onChange={(e) => handleInputChange("issueDescription", e.target.value)}
                                            placeholder={tr(language, "Maszyna wydaje dziwne dźwięki.")}
                                            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[80px] resize-none rounded-lg focus:border-gray-400 focus:ring-0 w-full"
                                            readOnly // Make it read-only when collapsed
                                        />
                                    )}
                                  </div>
                              )}

                          <CollapsibleContent>
                            <div className="bg-white p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-gray-900 text-sm font-semibold">{tr(language, "Wybierz z listy błędów")}</h4>
                              </div>

                              <div className="flex flex-wrap items-start content-start p-0 gap-3 mb-4">
                                {/* Numbered error buttons */}
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => {
                                  const code = `Błąd nr ${num}`
                                  const isSelected = formData.selectedErrorCodes.includes(code)
                                  return (
                                      <button
                                          key={num}
                                          type="button"
                                          onClick={() => toggleErrorCode(code)}
                                          className={`w-[59px] h-10 text-sm font-medium transition-colors rounded-full border min-h-[44px] ${
                                              isSelected
                                                  ? "bg-blue-600 text-white border-blue-600"
                                                  : "bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900 border-gray-300"
                                          }`}
                                      >
                                        {num}
                                      </button>
                                  )
                                })}

                                {/* Named error buttons */}
                                {NAMED_ERRORS.map((errorName) => {
                                  const isSelected = formData.selectedErrorCodes.includes(errorName)
                                  return (
                                      <button
                                          key={errorName}
                                          type="button"
                                          onClick={() => toggleErrorCode(errorName)}
                                          className={`px-3 h-10 text-sm transition-colors text-left border rounded-full min-h-[44px] ${
                                              isSelected
                                                  ? "bg-blue-600 text-white border-blue-600"
                                                  : "bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900 border-gray-300"
                                          }`}
                                      >
                                        {tr(language, errorName)}
                                      </button>
                                  )
                                })}
                              </div>

                              <div className="border-t border-gray-300 pt-4">
                                <h4 className="text-gray-700 text-sm font-normal mb-3">
                                  {tr(language, "Komentarz")}
                                </h4>
                                <Textarea
                                    placeholder={tr(language, "Maszyna wydaje dziwne dźwięki...")}
                                    value={formData.issueDescription}
                                    onChange={(e) => handleInputChange("issueDescription", e.target.value)}
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[80px] resize-none rounded-lg focus:border-gray-400 focus:ring-0 w-full text-base"
                                />
                              </div>

                              <div className="flex justify-end pt-4 mt-4 border-t border-gray-300">
                                <button
                                    type="button"
                                    onClick={() => setIsErrorSelectionOpen(false)} // Close on confirm
                                    className="bg-transparent border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-300 px-6 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px]"
                                >
                                  {tr(language, "Potwierdź")}
                                </button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    </div>
                    )}

                    {/* Autoclave Folder Upload (hidden for now – can be re-enabled) */}
                    {false &&
                      renderFolderUploadSection(
                        formData.uploadedFolder,
                        handleFolderUpload,
                        handleDeleteFolder,
                        "Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).",
                        isFolderUploading,
                        folderUploadProgress,
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Data */}
            <div>
        <h2 className="text-gray-900 text-lg sm:text-xl font-semibold mb-4 sm:mb-6 tracking-tight">
          {tr(language, "2. Dane kontaktowe")}
        </h2>

              <div className="bg-white rounded-md p-4 sm:p-5 space-y-4">
                {/* Serial number for autoclave services */}
                {selectedCategory === "autoclave" && (
                  <div>
                    <Label htmlFor="serialNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Numer seryjny")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="serialNumber"
                        name="serialNumber"
                        value={formData.serialNumber || ""}
                        onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                        placeholder={tr(language, "Wpisz numer")}
                        className={getInputStyles(formData.serialNumber || "", fieldErrors.serialNumber)}
                        required
                    />
                  </div>
                )}

                {/* Company fields for post-warranty service with autoclave products */}
                {serviceType === "post-warranty" && 
                 selectedCategory === "autoclave" && (
                  <>
                    <div>
                      <Label htmlFor="companyName" className="text-gray-900 text-[14px] font-normal mb-2 block">
                        {tr(language, "Nazwa firmy")}
                      </Label>
                      <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName || ""}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          placeholder={tr(language, "Wpisz nazwę firmy")}
                          className={getInputStyles(formData.companyName || "")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="vatNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                        {tr(language, "Numer VAT")}
                      </Label>
                      <Input
                          id="vatNumber"
                          name="vatNumber"
                          value={formData.vatNumber || ""}
                          onChange={(e) => handleInputChange("vatNumber", e.target.value)}
                          placeholder={tr(language, "Wpisz numer VAT")}
                          className={getInputStyles(formData.vatNumber || "")}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="name" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Imię i nazwisko")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={tr(language, "Wpisz pełne imię i nazwisko")}
                      className={getInputStyles(formData.name, fieldErrors.name)}
                      required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Adres e-mail")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder={tr(language, "Podaj adres e-mail")}
                      className={getInputStyles(formData.email, fieldErrors.email)}
                      required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Telefon")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 items-stretch">
                    <div className="w-20 shrink-0">
                      <Input
                        id="phonePrefix"
                        name="phonePrefix"
                        value={formData.phonePrefix}
                        onChange={(e) => handleInputChange("phonePrefix", e.target.value)}
                        placeholder="+48"
                        className={`${getInputStyles(formData.phonePrefix, fieldErrors.phonePrefix)} h-full w-full text-center box-border`}
                        required
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        placeholder="123 456 789"
                        className={`${getInputStyles(formData.phoneNumber, fieldErrors.phoneNumber)} h-full w-full box-border`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="street" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Nazwa ulicy")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      placeholder={tr(language, "Wpisz pełną nazwę ulicy")}
                      className={getInputStyles(formData.street, fieldErrors.street)}
                      required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buildingNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Numer budynku")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="buildingNumber"
                        name="buildingNumber"
                        value={formData.buildingNumber}
                        onChange={(e) => handleInputChange("buildingNumber", e.target.value)}
                        placeholder={tr(language, "Podaj numer")}
                        className={getInputStyles(formData.buildingNumber, fieldErrors.buildingNumber)}
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="apartmentNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Numer lokalu")}
                    </Label>
                    <Input
                        id="apartmentNumber"
                        name="apartmentNumber"
                        value={formData.apartmentNumber}
                        onChange={(e) => handleInputChange("apartmentNumber", e.target.value)}
                        placeholder={tr(language, "Wpisz jeżeli występuje")}
                        className={getInputStyles(formData.apartmentNumber)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Kod pocztowy")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        placeholder={tr(language, "Wpisz kod")}
                        className={getInputStyles(formData.postalCode)}
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Miasto")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder={tr(language, "Miasto odbioru")}
                        className={getInputStyles(formData.city)}
                        required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Kraj")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                      value={formData.country}
                      onValueChange={(value) => handleInputChange("country", value)}
                  >
                    <SelectTrigger className={getInputStyles(formData.country)}>
                      <SelectValue placeholder={tr(language, "Wybierz z listy")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300">
                      {Object.entries(COUNTRY_NAMES_PL)
                          .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                          .map(([value]) => (
                              <SelectItem
                                  key={value}
                                  value={value}
                                  className="select-dark-item text-gray-600"
                              >
                                {formatCountryLabel(value)}
                              </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Other delivery address toggle and fields - only for post-warranty */}
                {serviceType === "post-warranty" && (
                  <div className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Switch
                        id="otherDeliveryAddress"
                        checked={formData.otherDeliveryAddress}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, otherDeliveryAddress: checked }))}
                      />
                      <Label htmlFor="otherDeliveryAddress" className="text-gray-900 text-[14px] font-normal cursor-pointer">
                        {tr(language, "Inny adres dostawy")}
                      </Label>
                    </div>

                    {formData.otherDeliveryAddress && (
                    <div className="space-y-4 mt-4 animate-in slide-in-from-top-2 duration-200">
                      <div>
                        <Label htmlFor="deliveryCompanyName" className="text-gray-900 text-[14px] font-normal mb-2 block">
                          {tr(language, "Nazwa firmy / nazwa")}
                        </Label>
                        <Input
                            id="deliveryCompanyName"
                            name="deliveryCompanyName"
                            value={formData.deliveryCompanyName || ""}
                            onChange={(e) => handleInputChange("deliveryCompanyName", e.target.value)}
                            placeholder={tr(language, "Nazwa firmy / nazwa")}
                            className={getInputStyles(formData.deliveryCompanyName || "")}
                        />
                      </div>

                      <div>
                        <Label htmlFor="deliveryAddress" className="text-gray-900 text-[14px] font-normal mb-2 block">
                          {tr(language, "Adres")}
                        </Label>
                        <Input
                            id="deliveryAddress"
                            name="deliveryAddress"
                            value={formData.deliveryAddress || ""}
                            onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                            placeholder={tr(language, "Wpisz adres firmy")}
                            className={getInputStyles(formData.deliveryAddress || "")}
                        />
                      </div>

                      <div>
                        <Label htmlFor="deliveryAddress2" className="text-gray-900 text-[14px] font-normal mb-2 block">
                          {tr(language, "Adres c.d.")}
                        </Label>
                        <Input
                            id="deliveryAddress2"
                            name="deliveryAddress2"
                            value={formData.deliveryAddress2 || ""}
                            onChange={(e) => handleInputChange("deliveryAddress2", e.target.value)}
                            placeholder={tr(language, "Adres c.d.")}
                            className={getInputStyles(formData.deliveryAddress2 || "")}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="deliveryPostalCode" className="text-gray-900 text-[14px] font-normal mb-2 block">
                            {tr(language, "Kod pocztowy")}
                          </Label>
                          <Input
                              id="deliveryPostalCode"
                              name="deliveryPostalCode"
                              value={formData.deliveryPostalCode || ""}
                              onChange={(e) => handleInputChange("deliveryPostalCode", e.target.value)}
                              placeholder={tr(language, "Kod pocztowy")}
                              className={getInputStyles(formData.deliveryPostalCode || "")}
                          />
                        </div>

                        <div>
                          <Label htmlFor="deliveryCity" className="text-gray-900 text-[14px] font-normal mb-2 block">
                            {tr(language, "Miasto")}
                          </Label>
                          <Input
                              id="deliveryCity"
                              name="deliveryCity"
                              value={formData.deliveryCity || ""}
                              onChange={(e) => handleInputChange("deliveryCity", e.target.value)}
                              placeholder={tr(language, "Wpisz pełną nazwę miasta")}
                              className={getInputStyles(formData.deliveryCity || "")}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="deliveryCountry" className="text-gray-900 text-[14px] font-normal mb-2 block">
                          {tr(language, "Kraj")}
                        </Label>
                        <Select
                          value={formData.deliveryCountry || ""}
                          onValueChange={(value) => handleInputChange("deliveryCountry", value)}
                        >
                          <SelectTrigger className={getInputStyles(formData.deliveryCountry || "")}>
                            <SelectValue placeholder={tr(language, "Wybierz z listy")} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-300">
                            {Object.entries(COUNTRY_NAMES_PL)
                              .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                              .map(([value]) => (
                                <SelectItem
                                  key={value}
                                  value={value}
                                  className="text-gray-600"
                                >
                                  {formatCountryLabel(value)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-6 gap-4">
          <button
              type="button"
              onClick={handleBackToServiceSelection}
              className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity min-h-[48px] px-2 -mx-2"
              style={{
                fontFamily: "Inter, sans-serif",
                fontStyle: "normal",
                fontWeight: 500,
                fontSize: "14px",
                letterSpacing: "-0.5px",
                color: "#9098A2",
              }}
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span>{tr(language, "Wstecz")}</span>
          </button>

          <Button
              type="submit"
              size="wide"
              className="bg-transparent hover:bg-transparent border border-gray-300 text-gray-900 hover:border-gray-400 rounded-md py-3 text-sm font-medium h-[48px] sm:h-[64px] w-full sm:w-[240px] min-h-[48px]"
          >
            {tr(language, "Wyślij zgłoszenie serwisowe")}
          </Button>
        </div>
      </form>
    )
  }

  const renderComplaintForm = () => (
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl p-4 sm:p-6 md:p-12 border border-gray-200 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-16">
            {/* Left Column - Product Data */}
            <div>
              <h2 className="text-gray-900 text-lg sm:text-xl font-semibold mb-4 sm:mb-6 tracking-tight">
                1. Dane produktu
              </h2>

              <div className="bg-white rounded-md p-4 sm:p-5">
                {/* Selected Product Display */}
                <button
                    type="button"
                    onClick={handleBackToSelection}
                    className="flex items-start gap-3 mb-6 sm:mb-8 w-full text-left bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded-md p-2 -m-2 transition-all duration-300 ease-in-out min-h-[48px]"
                >
                  <div className="mt-1 relative flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-gray-900 font-medium text-base cursor-pointer block">
                      {tr(language, "Akcesoria")}
                    </Label>
                    <p className="text-gray-600 text-sm mt-1 break-words">{tr(language, getSelectedProductLabel())}</p>
                  </div>
                </button>
                <p className="text-gray-600 text-xs mt-2 ml-8">
                  {tr(language, "Kliknij ponownie, aby zmienić wybór")}
                </p>
                {/* Other Accessory Input - Show when "other" is selected */}
                {selectedProduct === "other" && (
                    <div className="mt-4">
                      <Textarea
                          placeholder={tr(language, "Zacznij pisać tutaj (nazwa akcesorium)...")}
                          value={formData.accessoryOtherProductName}
                          onChange={(e) => handleInputChange("accessoryOtherProductName", e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[80px] resize-none rounded-lg focus:border-gray-400 focus:ring-0 w-full text-base"
                      />
                    </div>
                )}
                <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-4 sm:mt-6">
                  <div className="space-y-8 sm:space-y-11">
                    {/* Proof of Purchase */}
                    {renderFileUploadSection(
                        formData.uploadedFile,
                        handleFileUpload,
                        handleFileDelete,
                        handleFileDownload, 
                        "Dane z faktury zostały rozpoznane i będą użyte w formularzu.",
                        "Jeśli dodałeś(-aś) fakturę do my.enbio, możesz ją pobrać z karty urządzenia.",
                        isUploading,
                        uploadProgress,
                        true, // This field is now required
                    )}

                    {/* Complaint Reason */}
                    <div>
                      <Label className="text-gray-900 text-sm font-normal text-[14px] mb-4 block">
                        {tr(language, "Powód reklamacji")}
                      </Label>

                      <RadioGroup
                          value={formData.complaintReason}
                          onValueChange={(value) => handleInputChange("complaintReason", value)}
                          className="space-y-4"
                      >
                        <div className="flex items-center space-x-3 min-h-[48px]">
                          <RadioGroupItem value="damaged" id="damaged" className="border-gray-300 text-gray-900" />
                          <Label htmlFor="damaged" className="text-gray-900 cursor-pointer">
                            {tr(language, "Produkt uszkodzony")}
                          </Label>
                        </div>
                                {formData.complaintReason === "damaged" && (
                          <div className="mt-4 border border-gray-300 rounded-lg p-4 px-0 py-0 border-transparent">
                     <div className="border border-dashed border-gray-300 rounded-md p-4 py-8 min-h-[100px] flex items-center bg-white relative">
                <input
                    type="file"
                    id="fileImageUpload"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleImageFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isImageFileUploading}
                />
                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm w-full">
                  {isImageFileUploading ? (
                       <div className="w-full px-4">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-900">{fileImageUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${fileImageUploadProgress}%` }}
                        ></div>
                        </div>
                    </div>
                  ) : selectedImageFile ? (
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-gray-900" />
                        <span className="text-gray-900">{selectedImageFile.name}</span>
                  
                      </div>
                  ) : (
                      <>
                        <span>Przeciągnij lub wybierz plik</span>
                        <Paperclip className="h-4 w-4" />
                        <span>zrób zdjęcie</span>
                        <Camera className="h-4 w-4" />
                      </>
                  )}
      
          
              </div>                  
                    </div>
            <div className="flex justify-between mt-2">
                <span className="text-gray-600 text-xs">
                  {tr(language, "Dozwolone formaty: JPG, PDF")}
                </span>
                <span className="text-gray-600 text-xs">
                  {tr(language, "Maksymalny rozmiar: 10 MB")}
                </span>
              </div>
                          <div className="mt-4">
       <div className="flex items-center gap-4 my-4">
  <div className="flex-grow h-px bg-gray-300"></div>
  <span className="text-gray-600 text-sm tracking-wider">
    {tr(language, "Dodaj komentarz")}
  </span>
  <div className="flex-grow h-px bg-gray-300"></div>
</div>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={tr(language, "Twój komentarz...")}
          value={tempComment}                // ← wiążemy z tempComment
          onChange={handleCommentChange}
          readOnly={isConfirmed}             // ← zamiast disabled
          onFocus={() => setIsConfirmed(false)} // ← klik/focus odblokowuje edycję
        />
              </div>
    <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleConfirmClick}
          disabled={isConfirmed || (!selectedImageFile && tempComment.trim() === '')}
          className={`py-2 px-8 border rounded-full text-sm font-medium transition-colors
            ${isConfirmed 
              ? 'bg-green-600 border-green-600 text-white cursor-not-allowed flex items-center gap-2'
              : `border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-400
                 disabled:bg-transparent disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed`
            }`}
        >
          {isConfirmed ? (
            <>
              <CheckCircle className="h-5 w-5" /> {tr(language, "Zapisano")}
            </>
          ) : (
            tr(language, "Zatwierdź")
          )}
        </button>
      </div>
      </div>
                      )}
                        <div className="flex items-center space-x-3 min-h-[48px]">
                          <RadioGroupItem
                              value="not-this-item"
                              id="not-this-item"
                              className="border-gray-300 text-gray-900"
                          />
                          <Label htmlFor="not-this-item" className="text-gray-900 cursor-pointer">
                            {tr(language, "Nie ten przedmiot")}
                          </Label>
                        </div>
                        {formData.complaintReason === "not-this-item" && (
                          <div className="mt-4 border border-gray-300 rounded-lg p-4 px-0 py-0 border-transparent">
                            <div className="border border-dashed border-gray-300 rounded-md p-4 py-8 min-h-[100px] flex items-center bg-white relative">
                              <input
                                type="file"
                                id="fileImageUpload-notthis"
                                multiple
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleImageFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={isImageFileUploading}
                              />
                              <div className="flex items-center justify-center gap-2 text-gray-600 text-sm w-full">
                                {isImageFileUploading ? (
                                  <div className="w-full px-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-gray-900">{fileImageUploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                                        style={{ width: `${fileImageUploadProgress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : selectedImageFile ? (
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-gray-900" />
                                    <span className="text-gray-900">{selectedImageFile.name}</span>
                                  </div>
                                ) : (
                                  <>
                                    <span>Przeciągnij lub wybierz plik</span>
                                    <Paperclip className="h-4 w-4" />
                                    <span>zrób zdjęcie</span>
                                    <Camera className="h-4 w-4" />
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between mt-2">
                              <span className="text-gray-600 text-xs">Dozwolone formaty: JPG, PDF</span>
                              <span className="text-gray-600 text-xs">Maksymalny rozmiar: 10 MB</span>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center gap-4 my-4">
                                <div className="flex-grow h-px bg-gray-600"></div>
                                <span className="text-gray-600 text-sm tracking-wider">Dodaj komentarz</span>
                                <div className="flex-grow h-px bg-gray-600"></div>
                              </div>

                              <textarea
                                id="comment-notthis"
                                name="comment-notthis"
                                rows={4}
                                className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder={tr(language, "Krótki opis (np. otrzymałem inny produkt niż zamawiałem)...")}
                                value={tempComment}
                                onChange={handleCommentChange}
                                readOnly={isConfirmed}
                                onFocus={() => setIsConfirmed(false)}
                              />
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={handleConfirmClick}
                                disabled={isConfirmed || (!selectedImageFile && tempComment.trim() === '')}
                                className={`py-2 px-8 border rounded-full text-sm font-medium transition-colors
                                  ${isConfirmed 
                                    ? 'bg-green-600 border-green-600 text-gray-900 cursor-not-allowed flex items-center gap-2'
                                    : `border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 
                                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#252D37] focus:ring-gray-500
                                      disabled:bg-transparent disabled:border-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed`
                                  }`}
                              >
                                {isConfirmed ? (
                                  <>
                                    <CheckCircle className="h-5 w-5" /> Zapisano
                                  </>
                                ) : (
                                  'Zatwierdź'
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3 min-h-[48px]">
                          <RadioGroupItem value="other" id="other" className="border-gray-300 text-gray-900" />
                          <Label htmlFor="other" className="text-gray-900 cursor-pointer">
                            Inny powód
                          </Label>
                        </div>
                      </RadioGroup>

                      {formData.complaintReason === "other" && (
                        <div className="mt-4 border border-gray-300 rounded-lg p-4 px-0 py-0 border-transparent">
                          <div className="border border-dashed border-gray-300 rounded-md p-4 py-8 min-h-[100px] flex items-center bg-white relative">
                            <input
                              type="file"
                              id="fileImageUpload-other"
                              multiple
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={handleImageFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              disabled={isImageFileUploading}
                            />
                            <div className="flex items-center justify-center gap-2 text-gray-600 text-sm w-full">
                              {isImageFileUploading ? (
                                <div className="w-full px-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-900">{fileImageUploadProgress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                                      style={{ width: `${fileImageUploadProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ) : selectedImageFile ? (
                                <div className="flex items-center gap-2">
                                  <Paperclip className="h-4 w-4 text-gray-900" />
                                  <span className="text-gray-900">{selectedImageFile.name}</span>
                                </div>
                              ) : (
                                <>
                                  <span>Przeciągnij lub wybierz plik</span>
                                  <Paperclip className="h-4 w-4" />
                                  <span>zrób zdjęcie</span>
                                  <Camera className="h-4 w-4" />
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between mt-2">
                            <span className="text-gray-600 text-xs">Dozwolone formaty: JPG, PDF</span>
                            <span className="text-gray-600 text-xs">Maksymalny rozmiar: 10 MB</span>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center gap-4 my-4">
                              <div className="flex-grow h-px bg-gray-600"></div>
                              <span className="text-gray-600 text-sm tracking-wider">Dodaj komentarz</span>
                              <div className="flex-grow h-px bg-gray-600"></div>
                            </div>

                            <textarea
                              id="comment-other"
                              name="comment-other"
                              rows={4}
                              className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder={tr(language, "Opisz problem...")}
                              value={tempComment}
                              onChange={handleCommentChange}
                              readOnly={isConfirmed}
                              onFocus={() => setIsConfirmed(false)}
                            />
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={handleConfirmClick}
                              disabled={isConfirmed || (!selectedImageFile && tempComment.trim() === '')}
                              className={`py-2 px-8 border rounded-full text-sm font-medium transition-colors
                                ${isConfirmed 
                                  ? 'bg-green-600 border-green-600 text-gray-900 cursor-not-allowed flex items-center gap-2'
                                  : `border-gray-400 text-gray-300 hover:bg-gray-700 hover:text-gray-900 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#252D37] focus:ring-gray-500
                                    disabled:bg-transparent disabled:border-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed`
                                }`}
                            >
                              {isConfirmed ? (
                                <>
                                  <CheckCircle className="h-5 w-5" /> {tr(language, "Zapisano")}
                                </>
                              ) : (
                                tr(language, "Zatwierdź")
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Data */}
            <div>
              <h2 className="text-gray-900 text-lg sm:text-xl font-semibold mb-4 sm:mb-6 tracking-tight">
                {tr(language, "2. Dane kontaktowe")} <span className="text-gray-600 font-normal">({tr(language, "do przesyłki")})</span>
              </h2>

              <div className="bg-white rounded-md p-4 sm:p-5 space-y-4">
                {/* Serial number for accessory complaints */}
                {selectedCategory === "accessory" && (
                  <div>
                    <Label htmlFor="serialNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Numer seryjny")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="serialNumber"
                        name="serialNumber"
                        value={formData.serialNumber || ""}
                        onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                        placeholder={tr(language, "Wpisz numer")}
                        className={getInputStyles(formData.serialNumber || "", fieldErrors.serialNumber)}
                        required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="name" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Imię i nazwisko")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={tr(language, "Wpisz pełne imię i nazwisko")}
                      className={getInputStyles(formData.name)}
                      required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Adres e-mail")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder={tr(language, "Podaj adres e-mail")}
                      className={getInputStyles(formData.email)}
                      required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Telefon")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 items-stretch">
                    <div className="w-20 shrink-0">
                      <Input
                        id="phonePrefix"
                        name="phonePrefix"
                        value={formData.phonePrefix}
                        onChange={(e) => handleInputChange("phonePrefix", e.target.value)}
                        placeholder="+48"
                        className={`${getInputStyles(formData.phonePrefix, fieldErrors.phonePrefix)} h-full w-full text-center box-border`}
                        required
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        placeholder="123 456 789"
                        className={`${getInputStyles(formData.phoneNumber, fieldErrors.phoneNumber)} h-full w-full box-border`}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="street" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Nazwa ulicy")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      placeholder={tr(language, "Wpisz pełną nazwę ulicy")}
                      className={getInputStyles(formData.street)}
                      required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buildingNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Numer budynku")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="buildingNumber"
                        name="buildingNumber"
                        value={formData.buildingNumber}
                        onChange={(e) => handleInputChange("buildingNumber", e.target.value)}
                        placeholder={tr(language, "Podaj numer")}
                        className={getInputStyles(formData.buildingNumber)}
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="apartmentNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Numer lokalu")}
                    </Label>
                    <Input
                        id="apartmentNumber"
                        name="apartmentNumber"
                        value={formData.apartmentNumber}
                        onChange={(e) => handleInputChange("apartmentNumber", e.target.value)}
                        placeholder={tr(language, "Wpisz jeżeli występuje")}
                        className={getInputStyles(formData.apartmentNumber)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Kod pocztowy")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        placeholder={tr(language, "Wpisz kod")}
                        className={getInputStyles(formData.postalCode, fieldErrors.postalCode)}
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-gray-900 text-[14px] font-normal mb-2 block">
                      {tr(language, "Miasto")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder={tr(language, "Miasto odbioru")}
                        className={getInputStyles(formData.city, fieldErrors.city)}
                        required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    {tr(language, "Kraj")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                      value={formData.country}
                      onValueChange={(value) => handleInputChange("country", value)}
                      required
                  >
                    <SelectTrigger className={getInputStyles(formData.country)}>
                      <SelectValue placeholder={tr(language, "Wybierz z listy")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300">
                      {Object.entries(COUNTRY_NAMES_PL)
                          .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                          .map(([value, label]) => (
                              <SelectItem
                                  key={value}
                                  value={value}
                                  className="select-dark-item text-gray-600"
                              >
                                {tr(language, label)}
                              </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-6 gap-4">
          <button
              type="button"
              onClick={handleBackToSelection}
              className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity min-h-[48px] px-2 -mx-2"
              style={{
                fontFamily: "Inter, sans-serif",
                fontStyle: "normal",
                fontWeight: 500,
                fontSize: "14px",
                letterSpacing: "-0.5px",
                color: "#9098A2",
              }}
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span>{tr(language, "Wstecz")}</span>
          </button>

          <Button
              type="submit"
              size="wide"
              className="bg-transparent hover:bg-transparent border border-gray-300 text-gray-900 hover:border-gray-400 rounded-md py-3 text-sm font-medium h-[48px] sm:h-[64px] w-full sm:w-[240px] min-h-[48px]"
          >
            {tr(language, "Wyślij zgłoszenie")}
          </Button>
        </div>
      </form>
  )

  return (
      <div className="min-h-screen bg-gray-100 text-gray-900 py-4 sm:py-6 md:py-8">
        <div className="w-full max-w-[1035px] mx-auto px-4 sm:px-6">
          <div className="flex justify-end mb-4">
            <Select value={language} onValueChange={(value) => handleLanguageChange(value as SupportedLanguage)}>
              <SelectTrigger className="w-[150px] h-10 bg-gray-100 border-gray-200 text-gray-900 rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                {SUPPORTED_LANGUAGES.map((langCode) => (
                  <SelectItem
                    key={langCode}
                    value={langCode}
                    className="text-gray-700 data-[state=checked]:text-gray-900 data-[highlighted]:text-gray-900 data-[highlighted]:bg-gray-100"
                  >
                    {LANGUAGE_LABELS[langCode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <h1 className="text-gray-900 text-center text-xl sm:text-2xl font-medium mb-6 sm:mb-8">
            {currentStep === "summary"
              ? tr(language, "Dane rozpoznane z faktury, sprawdź poprawność")
              : HEADING_TRANSLATIONS[language]}
          </h1>

          <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                height: isTransitioning ? 0 : contentHeight || "auto",
                opacity: isTransitioning ? 0 : 1,
              }}
          >
            <div ref={contentRef}>
              {currentStep === "product-selection" && renderProductSelection()}
              {currentStep === "service-selection" && renderServiceSelection()}
              {currentStep === "service-form" && renderServiceForm()}
              {currentStep === "complaint-form" && renderComplaintForm()}
              {currentStep === "summary" && (
                  <div className="bg-white rounded-xl p-4 sm:p-6 md:p-12 border border-gray-200 w-full">
                    <SummaryForm
                      language={language}
                      formData={formData}
                      summaryData={summaryData}
                      onDataChange={(data) => setSummaryData((prev:any) => ({...prev, ...data}))}
                      onConsentsValidChange={setConsentsValid}
                      onBack={handleBackFromSummary}
                      onSubmit={handleFinalSubmit}
                      selectedCategory={selectedCategory}
                    />
                  </div>
              )}
              {currentStep === "summary" && (
                  <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-6 gap-4">
                    <button
                        type="button"
                        onClick={handleBackFromSummary}
                        className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity min-h-[48px] px-2 -mx-2"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontStyle: "normal",
                          fontWeight: 500,
                          fontSize: "14px",
                          letterSpacing: "-0.5px",
                          color: "#6b7280",
                        }}
                    >
                      <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                      <span>{tr(language, "Wstecz")}</span>
                    </button>

                    <Button
                      onClick={handleFinalSubmit}
                      size="wide"
                      disabled={!consentsValid || isSubmitting}
                      title={
                        !consentsValid
                          ? tr(language, "Zaznaczenie wszystkich zgód jest wymagane")
                          : undefined
                      }
                      className={`rounded-md py-3 text-sm font-medium h-[48px] sm:h-[64px] w-full sm:w-[240px] min-h-[48px] border ${
                        !consentsValid || isSubmitting
                          ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                          : "bg-transparent hover:bg-transparent border-gray-300 text-gray-900 hover:border-gray-400"
                      }`}
                    >
                      {isSubmitting ? "Sending..." : tr(language, "Wyślij formularz")}
                    </Button>
                  </div>
              )}
            </div>
          </div>

          {isTransitioning && (
              <div className="flex justify-center mt-6">
                <div className="text-gray-900 text-sm flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  {tr(language, "Ładowanie formularza...")}
                </div>
              </div>
          )}
        </div>
      </div>
  )
}
