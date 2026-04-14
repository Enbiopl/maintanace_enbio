"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paperclip, Camera, Info, Folder, ArrowLeft, ChevronDown, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"

// Mapowanie krajów do prefiksów telefonicznych
const COUNTRY_PHONE_PREFIXES: Record<string, string> = {
  poland: "+48",
  germany: "+49",
  czechia: "+420",
  slovakia: "+421",
  afghanistan: "+93",
  albania: "+355",
  algeria: "+213",
  andorra: "+376",
  angola: "+244",
  argentina: "+54",
  armenia: "+374",
  australia: "+61",
  austria: "+43",
  azerbaijan: "+994",
  bahrain: "+973",
  bangladesh: "+880",
  belarus: "+375",
  belgium: "+32",
  bolivia: "+591",
  "bosnia-herzegovina": "+387",
  brazil: "+55",
  bulgaria: "+359",
  cambodia: "+855",
  cameroon: "+237",
  canada: "+1",
  chile: "+56",
  china: "+86",
  colombia: "+57",
  "costa-rica": "+506",
  croatia: "+385",
  cyprus: "+357",
  denmark: "+45",
  ecuador: "+593",
  egypt: "+20",
  estonia: "+372",
  ethiopia: "+251",
  finland: "+358",
  france: "+33",
  georgia: "+995",
  ghana: "+233",
  greece: "+30",
  guatemala: "+502",
  honduras: "+504",
  "hong-kong": "+852",
  hungary: "+36",
  iceland: "+354",
  india: "+91",
  indonesia: "+62",
  iran: "+98",
  iraq: "+964",
  ireland: "+353",
  israel: "+972",
  italy: "+39",
  japan: "+81",
  jordan: "+962",
  kazakhstan: "+7",
  kenya: "+254",
  "south-korea": "+82",
  kuwait: "+965",
  latvia: "+371",
  lebanon: "+961",
  libya: "+218",
  lithuania: "+370",
  luxembourg: "+352",
  malaysia: "+60",
  malta: "+356",
  mexico: "+52",
  moldova: "+373",
  monaco: "+377",
  mongolia: "+976",
  montenegro: "+382",
  morocco: "+212",
  netherlands: "+31",
  "new-zealand": "+64",
  nigeria: "+234",
  norway: "+47",
  pakistan: "+92",
  peru: "+51",
  philippines: "+63",
  portugal: "+351",
  qatar: "+974",
  romania: "+40",
  russia: "+7",
  "saudi-arabia": "+966",
  serbia: "+381",
  singapore: "+65",
  slovenia: "+386",
  "south-africa": "+27",
  spain: "+34",
  "sri-lanka": "+94",
  sweden: "+46",
  switzerland: "+41",
  taiwan: "+886",
  thailand: "+66",
  turkey: "+90",
  ukraine: "+380",
  uae: "+971",
  "united-kingdom": "+44",
  "united-states": "+1",
  uruguay: "+598",
  venezuela: "+58",
  vietnam: "+84",
}

// Mapowanie prefiksów do krajów
const PHONE_PREFIX_COUNTRIES: Record<string, string> = {
  "+48": "poland",
  "+49": "germany",
  "+420": "czechia",
  "+421": "slovakia",
}

// Descriptive errors mapping
const DESCRIPTIVE_ERRORS = [
  { id: "display_error", label: "Błąd wyświetlacza" },
  { id: "main_operation", label: "Główne działanie" },
  { id: "mechanical_damage", label: "Uszkodzenie mechaniczne" },
  { id: "vacuum_error", label: "Błąd próżni" },
  { id: "deformed_plastic", label: "Zdeformowany plastik" },
  { id: "wet_load", label: "Wilgotny wsad" },
  { id: "door_housing_mismatch", label: "Niedopasowana obudowa drzwi" },
  { id: "door_opening_problem", label: "Problem z otwieraniem drzwi" },
  { id: "water_leak", label: "Wyciek / przeciek wody" },
]

export default function WarrantyFormStep2() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonePrefix: "+48", // Domyślnie Polska
    phoneNumber: "",
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
    postalCode: "",
    city: "",
    country: "poland", // Domyślnie Polska
  })

  const [fileUploadStatus, setFileUploadStatus] = useState<{
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
  const [showImageUpload, setShowImageUpload] = useState<boolean>(false)
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false)
  const [errorComment, setErrorComment] = useState<string>("")
  const [selectedFolder, setSelectedFolder] = useState<{ name: string; files: File[] } | null>(null)
  const [serviceType, setServiceType] = useState<string>("warranty")
  const [isErrorSectionExpanded, setIsErrorSectionExpanded] = useState<boolean>(false)

  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean
    message?: string
    originalFolder?: string
    zipFileName?: string
  } | null>(null)

  const [isFileUploading, setIsFileUploading] = useState(false)
  const [fileUploadProgress, setFileUploadProgress] = useState(0)

  // Pobierz rodzaj serwisu z localStorage przy montowaniu komponentu
  useEffect(() => {
    const storedServiceType = localStorage.getItem("serviceType")
    if (storedServiceType) {
      setServiceType(storedServiceType)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (value: string) => {
    const prefix = COUNTRY_PHONE_PREFIXES[value] || "+48"
    setFormData((prev) => ({
      ...prev,
      country: value,
      phonePrefix: prefix,
    }))
  }

  const handleErrorSelect = (errorId: string) => {
    if (!selectedErrors.includes(errorId)) {
      setSelectedErrors([...selectedErrors, errorId])
    }
  }

  const handleRemoveError = (errorToRemove: string) => {
    setSelectedErrors(selectedErrors.filter((error) => error !== errorToRemove))
  }

  const handlePhonePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prefix = e.target.value
    setFormData((prev) => ({ ...prev, phonePrefix: prefix }))

    // Automatycznie ustaw kraj na podstawie prefiksu
    const matchingCountry = PHONE_PREFIX_COUNTRIES[prefix]
    if (matchingCountry && matchingCountry !== formData.country) {
      setFormData((prev) => ({ ...prev, country: matchingCountry }))
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Rozpocznij upload
      setIsFileUploading(true)
      setFileUploadProgress(0)
      setFileUploadStatus(null)

      try {
        const formData = new FormData()
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
              error: result.error || "Wystąpił błąd podczas przetwarzania faktury",
            })
          } else {
            // Zapisz dane faktury
            console.log("Otrzymane dane faktury:", result) // Dodaj logowanie
            setInvoiceData(result)
            setFileUploadStatus({
              success: true,
            })

            // Jeśli mamy dane nabywcy, uzupełnij formularz
            if (result.nabywca) {
              setFormData((prev) => ({
                ...prev,
                name: prev.name, // Zachowaj istniejące dane
                email: prev.email,
                phonePrefix: prev.phonePrefix,
                phoneNumber: prev.phoneNumber,
                street: result.nabywca.ulica || prev.street,
                buildingNumber: result.nabywca.numer_budynku || prev.buildingNumber,
                apartmentNumber:
                  result.nabywca.numer_lokalu !== "brak danych" ? result.nabywca.numer_lokalu : prev.apartmentNumber,
                postalCode: result.nabywca.kod_pocztowy || prev.postalCode,
                city: result.nabywca.miasto || prev.city,
                country: result.nabywca.kraj === "Polska" ? "poland" : prev.country,
              }))
            }
          }
        } else {
          const errorText = await response.text()
          console.error("Server error:", errorText)
          throw new Error(`Server responded with status: ${response.status}`)
        }
      } catch (error) {
        console.error("Upload error:", error)
        setFileUploadStatus({
          success: false,
          error: "Wystąpił błąd podczas przesyłania pliku. Spróbuj ponownie.",
        })
      } finally {
        setTimeout(() => {
          setIsFileUploading(false)
        }, 500)
      }

      // Symulacja dla środowiska deweloperskiego
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock response for development")
        setTimeout(() => {
          setFileUploadProgress(100)
          const mockData = {
            nabywca: {
              nazwa_firmy: "Enbio Technology Sp. z o.o.",
              ulica: "Działkowc����w",
              numer_budynku: "15",
              numer_lokalu: "brak danych",
              miasto: "Rumia",
              kod_pocztowy: "84-230",
              kraj: "Polska",
              data_faktury: "6 września 2024",
            },
            wystawca: {
              nazwa_firmy: "Atlist Inc.",
              numer_faktury: "A5C1265E-0001",
            },
          }
          setInvoiceData(mockData)
          setFileUploadStatus({
            success: true,
          })

          // Uzupełnij formularz danymi z faktury
          setFormData((prev) => ({
            ...prev,
            street: mockData.nabywca.ulica,
            buildingNumber: mockData.nabywca.numer_budynku,
            apartmentNumber:
              mockData.nabywca.numer_lokalu !== "brak danych" ? mockData.nabywca.numer_lokalu : prev.apartmentNumber,
            postalCode: mockData.nabywca.kod_pocztowy,
            city: mockData.nabywca.miasto,
            country: mockData.nabywca.kraj === "Polska" ? "poland" : prev.country,
          }))

          setTimeout(() => {
            setIsFileUploading(false)
          }, 500)
        }, 2000)
      }
    }
  }

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) {
      return
    }

    const folderName = files[0].webkitRelativePath.split("/")[0]

    setSelectedFolder({ name: folderName, files: files })
    setUploadStatus(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("files[]", file, file.webkitRelativePath)
      })

      formData.append("folderName", folderName)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch("/api/upload-folder", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const result = await response.json()
        console.log("Folder upload response:", result)
        setUploadProgress(100)

        if (result.success) {
          setUploadStatus({
            success: true,
            message: `Folder ${folderName} został przesłany.`,
            originalFolder: result.originalFolder,
            zipFileName: result.zipFileName,
          })
        } else {
          setUploadStatus({ success: false, message: result.message || "Wystąpił błąd podczas przesyłania folderu." })
        }
      } else {
        const errorText = await response.text()
        console.error("Server error:", errorText)
        throw new Error(`Server responded with status: ${response.status}`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus({ success: false, message: "Wystąpił błąd podczas przesyłania folderu. Spróbuj ponownie." })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Zapisz dane formularza wraz z wybranymi błędami, komentarzem i folderem
    const dataToSave = {
      ...formData,
      phone: `${formData.phonePrefix} ${formData.phoneNumber}`, // Połącz prefix z numerem
      serviceType,
      selectedErrors,
      errorComment,
      attachedFile: selectedFile ? selectedFile.name : null,
      selectedFolder: selectedFolder
        ? {
            name: selectedFolder.name,
            fileCount: selectedFolder.files.length,
          }
        : null,
      // Upewnij się, że dane faktury są poprawnie zapisywane
      invoiceData: invoiceData,
    }

    console.log("Zapisywane dane:", dataToSave) // Dodaj logowanie
    localStorage.setItem("contactData", JSON.stringify(dataToSave))

    // Zmień opóźnienie z 800ms na 300ms
    setTimeout(() => {
      router.push("/summary")
    }, 300)
  }

  const handleBack = () => {
    router.push("/")
  }

  const handleServiceTypeClick = () => {
    // Wyczyść serviceType z localStorage i przekieruj do wyboru
    localStorage.removeItem("serviceType")
    router.push("/")
  }

  // Funkcja do wyciągnięcia numeru z ID błędu
  const getErrorDisplayText = (errorId: string) => {
    // Check if it's a numbered error
    const numberMatch = errorId.match(/error(\d+)/)
    if (numberMatch) {
      return `Błąd nr ${numberMatch[1]}`
    }

    // Check if it's a descriptive error
    const descriptiveError = DESCRIPTIVE_ERRORS.find((error) => error.id === errorId)
    if (descriptiveError) {
      return descriptiveError.label
    }

    return errorId
  }

  // Funkcja do wyciągnięcia stylów inputów w zależności od tego, czy pole jest wypełnione
  const getConditionalInputStyles = (value: string) => {
    const baseStyles = "h-[52px] rounded-lg pt-2 pr-5 pb-2 pl-4 focus:border-[#495563] transition-colors duration-200"
    const filledStyles = "bg-[#252D37] border-solid border-[#495563] text-white"
    const emptyStyles = "bg-[#181e25] border-gray-700 text-[#9098A2] placeholder:text-gray-500"

    return `${baseStyles} ${value ? filledStyles : emptyStyles}`
  }

  return (
    <div className="w-[1035px] mx-auto">
      <h1 className="text-white text-center text-2xl font-medium mb-8">
        Wybierz, jakiego wsparcia potrzebujesz dla swojego urządzenia
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="bg-[#0c1117] rounded-xl p-12 border border-[#181E25] w-[1035px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Left Column - Device Data */}
            <div>
              <h2 className="text-[#f8f9fa] text-xl font-semibold mb-6 tracking-tight">1. Dane urządzenia</h2>

              <div className="bg-[#181e25] rounded-md p-5">
                <button
                  onClick={handleServiceTypeClick}
                  className="flex items-start gap-3 mb-8 w-full text-left bg-transparent border-none cursor-pointer hover:bg-[#1f2530] rounded-md p-2 -m-2 transition-all duration-300 ease-in-out"
                >
                  <div className="mt-1 relative flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    {serviceType === "post-warranty" ? (
                      <>
                        <Label className="text-white font-medium text-base cursor-pointer">Serwis pogwarancyjny</Label>
                        <p className="text-gray-400 text-sm mt-1">Jeśli gwarancja już wygasła lub nie masz pewności</p>
                      </>
                    ) : (
                      <>
                        <Label className="text-white font-medium text-base cursor-pointer">Serwis gwarancyjny</Label>
                        <p className="text-gray-400 text-sm mt-1">
                          Dla urządzeń objętych aktywną gwarancją producenta.
                        </p>
                      </>
                    )}
                  </div>
                </button>
                <p className="text-gray-400 text-xs mt-2 ml-8">Kliknij ponownie, aby zmienić wybór</p>

                <div className="border-t border-[#252d3b] pt-8 mt-6">
                  <div className="space-y-11">
                    {serviceType === "warranty" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white text-sm font-normal text-[14px]">
                            Dodaj zdjęcie faktury lub świadectwa gwarancji
                          </Label>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="end"
                                className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 rounded-md z-50"
                                sideOffset={5}
                              >
                                <p className="text-sm">
                                  Jeśli dodałeś(-aś) fakturę do my.enbio, możesz ją pobrać z karty urządzenia.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <div
                          className={`border border-dashed border-gray-600 rounded-md p-4 py-8 min-h-[100px] flex items-center relative transition-all duration-200 ${
                            !selectedFile && !isFileUploading
                              ? "bg-[#181e25] hover:bg-[#4a5568] hover:text-white cursor-pointer group"
                              : selectedFile && !isFileUploading
                                ? "bg-[#252D37] border-solid border-[#495563]"
                                : "bg-[#181e25]"
                          }`}
                        >
                          {!selectedFile && !isFileUploading && (
                            <input
                              type="file"
                              id="fileUpload"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                          )}

                          <div className="flex items-center justify-center gap-2 text-[#9098A2] group-hover:text-white text-sm w-full transition-colors duration-200 px-2">
                            {isFileUploading ? (
                              <div className="w-full">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-[#9098A2]">dodany plik {fileUploadProgress}%</span>
                                  {fileUploadProgress === 100 && (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="w-full bg-[#0C1217] rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                                    style={{ width: `${fileUploadProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : selectedFile ? (
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#FAFBFB] text-base">{selectedFile.name}</span>
                                  {fileUploadStatus && fileUploadStatus.success && (
                                    <span className="text-green-500 text-xs">✓</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {fileUploadStatus && fileUploadStatus.success && (
                                    <button
                                      onClick={() => {
                                        // Create download link
                                        const url = URL.createObjectURL(selectedFile)
                                        const a = document.createElement("a")
                                        a.href = url
                                        a.download = selectedFile.name
                                        document.body.appendChild(a)
                                        a.click()
                                        document.body.removeChild(a)
                                        URL.revokeObjectURL(url)
                                      }}
                                      className="w-5 h-5 rounded bg-transparent hover:bg-gray-600 flex items-center justify-center transition-colors"
                                      title="Pobierz plik"
                                    >
                                      <svg className="w-3 h-3 text-[#FAFBFB]" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedFile(null)
                                      setFileUploadStatus(null)
                                      setInvoiceData(null)
                                      // Reset form data that came from invoice
                                      setFormData((prev) => ({
                                        ...prev,
                                        street: "",
                                        buildingNumber: "",
                                        apartmentNumber: "",
                                        postalCode: "",
                                        city: "",
                                        country: "",
                                      }))
                                    }}
                                    className="w-5 h-5 rounded bg-transparent hover:bg-gray-600 flex items-center justify-center transition-colors"
                                    title="Usuń plik"
                                  >
                                    <X className="h-3 w-3 text-[#FAFBFB]" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span>Przeciągnij, wybierz plik</span>
                                <Paperclip className="h-4 w-4" />
                                <span>zrób zdjęcie</span>
                                <Camera className="h-4 w-4" />
                              </>
                            )}
                          </div>
                        </div>

                        {fileUploadStatus && !fileUploadStatus.success && (
                          <div className="mt-2 text-sm text-red-500">{fileUploadStatus.error}</div>
                        )}

                        {invoiceData && fileUploadStatus && fileUploadStatus.success && (
                          <div className="mt-2 text-sm text-green-500">
                            Dane z faktury zostały rozpoznane i będą użyte w formularzu.
                          </div>
                        )}

                        <div className="flex justify-between mt-2">
                          <span className="text-gray-400 text-xs">Dozwolone formaty: JPG, PDF</span>
                          <span className="text-gray-400 text-xs">Maksymalny rozmiar: 10 MB</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-white text-sm font-normal text-[14px]">
                          Numery błędów lub/i komentarz
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">Gdzie szukać</span>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="end"
                                className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 rounded-md z-50"
                                sideOffset={5}
                              >
                                <p className="text-sm">
                                  Numer błędu wyświetla się na ekranie autoklawu. Dotknij go, by przejść do kolejnego.
                                  Powtarzaj, aż wszystkie numery zostaną wyświetlone.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {/* Collapsed/Expanded Error Selection */}
                      <div className="bg-[#181e25] border border-gray-700 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setIsErrorSectionExpanded(!isErrorSectionExpanded)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1f2530] transition-colors rounded-t-lg border-b border-gray-700"
                        >
                          <span className="text-[#9098A2] text-sm">
                            {selectedErrors.length > 0 || errorComment
                              ? `${selectedErrors.length > 0 ? `Wybrano ${selectedErrors.length} błędów` : ""}${selectedErrors.length > 0 && errorComment ? " + " : ""}${errorComment ? "komentarz" : ""}`
                              : "Wybierz numery błędów, zdjęcia lub komentarze"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {/* Always show selected errors and comment when collapsed */}
                        {!isErrorSectionExpanded && (selectedErrors.length > 0 || errorComment) && (
                          <div className="p-4 bg-[#282D36]">
                            {/* Selected Errors */}
                            {selectedErrors.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {selectedErrors.map((errorId) => {
                                  const errorNumber = getErrorDisplayText(errorId)
                                  return (
                                    <div
                                      key={errorId}
                                      className="bg-[#0052B2] text-white px-3 py-1 rounded-full h-10 text-sm flex items-center gap-2"
                                    >
                                      <span>{errorNumber}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveError(errorId)}
                                        className="hover:bg-[#0052B2]/80 rounded-full p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Comment Textarea - Only visible when there's content */}
                            {errorComment && (
                              <Textarea
                                value={errorComment}
                                onChange={(e) => setErrorComment(e.target.value)}
                                placeholder="Maszyna wydaje dziwne dźwięki."
                                className="bg-[#2a3441] border-gray-600 text-white placeholder:text-[#6b7280] min-h-[80px] resize-none rounded-lg focus:border-gray-500 focus:ring-0 w-full"
                              />
                            )}
                          </div>
                        )}

                        {/* Error Selection Section - Only visible when expanded */}
                        {isErrorSectionExpanded && (
                          <div className="bg-[#252D37] p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-[#FAFBFB] text-sm font-semibold">wybierz z listy błędów</h4>
                              {/* ChevronUp icon removed as requested */}
                            </div>

                            <div className="flex flex-wrap items-start content-start p-0 gap-3 mb-4">
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => {
                                const errorId = `error${num}`
                                const isSelected = selectedErrors.includes(errorId)
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleErrorSelect(errorId)}
                                    disabled={isSelected}
                                    className={`w-[59px] h-10 text-sm font-medium transition-colors rounded-full ${
                                      isSelected
                                        ? "bg-[#0052B2] text-white"
                                        : "bg-[#252D37] text-[#FAFBFB] hover:bg-[#5F6A77] hover:text-white border border-[#495563]"
                                    }`}
                                  >
                                    {num}
                                  </button>
                                )
                              })}
                              {DESCRIPTIVE_ERRORS.map((error) => {
                                const isSelected = selectedErrors.includes(error.id)
                                return (
                                  <button
                                    key={error.id}
                                    type="button"
                                    onClick={() => handleErrorSelect(error.id)}
                                    disabled={isSelected}
                                    className={`px-3 h-10 text-sm transition-colors text-left border rounded-full ${
                                      isSelected
                                        ? "bg-[#0052B2] text-white border-[#0052B2]"
                                        : "bg-[#252D37] text-[#FAFBFB] hover:bg-[#5F6A77] hover:text-white border-[#495563]"
                                    }`}
                                  >
                                    {error.label}
                                  </button>
                                )
                              })}
                            </div>

                            {/* Selected Errors Display */}
                            {selectedErrors.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {selectedErrors.map((errorId) => {
                                  const errorNumber = getErrorDisplayText(errorId)
                                  return (
                                    <div
                                      key={errorId}
                                      className="bg-[#0052B2] text-white px-3 py-1 rounded-full h-10 text-sm flex items-center gap-2"
                                    >
                                      <span>{errorNumber}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveError(errorId)}
                                        className="hover:bg-[#0052B2]/80 rounded-full p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Comment Section - At the bottom */}
                            <div className="border-t border-[#495563] pt-4">
                              <h4 className="text-[#E1E5EA] text-sm font-normal mb-3">Komentarz</h4>
                              <Textarea
                                value={errorComment}
                                onChange={(e) => setErrorComment(e.target.value)}
                                placeholder="Zacząć pisać tutaj..."
                                className="bg-[#252D37] border-[#495563] text-white placeholder:text-[#6b7280] min-h-[80px] resize-none rounded-lg focus:border-gray-500 focus:ring-0 w-full"
                              />
                            </div>

                            {/* Confirm Button - Aligned to the right */}
                            <div className="flex justify-end pt-4 mt-4 border-t border-[#495563]">
                              <button
                                type="button"
                                onClick={() => setIsErrorSectionExpanded(false)}
                                className="bg-transparent border border-[#495563] text-white hover:border-gray-500 hover:bg-[#5F6A77] px-6 py-2 rounded-full text-sm font-medium transition-colors"
                              >
                                Potwierdź
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-white text-sm font-normal text-[14px]">Dodaj folder autokławu</Label>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="end"
                              className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 rounded-md z-50"
                              sideOffset={5}
                            >
                              <p className="text-sm">
                                Dołącz folder z pendrive'a z logami autoklawu (pendrive znajduje się z tyłu urządzenia).
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div
                        className={`border border-dashed border-gray-600 rounded-md p-4 bg-[#181e25] relative transition-all duration-200 ${
                          selectedFolder
                            ? "bg-[#252D37] border-solid border-[#495563]"
                            : "bg-[#181e25] hover:bg-[#4a5568] hover:text-white cursor-pointer group"
                        }`}
                      >
                        <input
                          type="file"
                          id="folderUpload"
                          // @ts-ignore - webkitdirectory nie jest standardową właściwością, ale działa w większości przeglądarek
                          webkitdirectory=""
                          directory=""
                          onChange={handleFolderSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={isUploading}
                        />
                        <div
                          className={`flex items-center justify-center gap-2 text-[#9098A2] text-sm ${
                            selectedFolder ? "" : "group-hover:text-white transition-colors duration-200 px-2"
                          }`}
                        >
                          {isUploading ? (
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[#9098A2]">Przesyłanie folderu...</span>
                                <span className="text-[#9098A2]">{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-[#0C1217] rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : selectedFolder ? (
                            <div className="flex items-center gap-2 text-[#9098A2]">
                              <Folder className="h-4 w-4 text-[#9098A2]" />
                              <span>{selectedFolder.name}</span>
                              <span className="text-gray-400 text-xs">({selectedFolder.files.length} plików)</span>

                              {uploadStatus && (
                                <span
                                  className={`ml-2 text-xs ${uploadStatus.success ? "text-green-500" : "text-red-500"}`}
                                >
                                  {uploadStatus.success ? "✓ Przesłano" : "✗ Błąd"}
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              <span>Przeciągnij lub</span>
                              <span className="text-[#9098A2] underline">wybierz folder</span>
                              <Folder className="h-4 w-4 text-[#9098A2]" />
                            </>
                          )}
                        </div>
                      </div>

                      {uploadStatus && (
                        <div className={`mt-2 text-sm ${uploadStatus.success ? "text-green-500" : "text-red-500"}`}>
                          {uploadStatus.message}
                        </div>
                      )}

                      <p className="text-gray-400 text-xs mt-4">
                        Wybierz folder o numerze autoklawu,
                        <br />
                        np. ST01-PL-24-00001
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Data */}
            <div>
              <h2 className="text-[#f8f9fa] text-xl font-semibold mb-6 tracking-tight">
                2. Dane kontaktowe <span className="text-[#9ca3af] font-normal">(do przesyłki autokławu)</span>
              </h2>

              <div className="bg-[#181e25] rounded-md p-5 space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white text-[14px] font-normal mb-2 block">
                    Imię i nazwisko
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Wpisz pełne imię i nazwisko"
                    className={getConditionalInputStyles(formData.name)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white text-[14px] font-normal mb-2 block">
                    Adres e-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Podaj adres e-mail"
                    className={getConditionalInputStyles(formData.email)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white text-[14px] font-normal mb-2 block">
                    Telefon
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="phonePrefix"
                      name="phonePrefix"
                      value={formData.phonePrefix}
                      onChange={handlePhonePrefixChange}
                      placeholder="+48"
                      className={`${getConditionalInputStyles(formData.phonePrefix)} w-20 text-center`}
                      required
                    />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="123 456 789"
                      className={`${getConditionalInputStyles(formData.phoneNumber)} flex-1`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="street" className="text-white text-[14px] font-normal mb-2 block">
                    Nazwa ulicy
                  </Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Wpisz pełną nazwę ulicy"
                    className={getConditionalInputStyles(formData.street)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buildingNumber" className="text-white text-[14px] font-normal mb-2 block">
                      Numer budynku
                    </Label>
                    <Input
                      id="buildingNumber"
                      name="buildingNumber"
                      value={formData.buildingNumber}
                      onChange={handleChange}
                      placeholder="Podaj numer"
                      className={getConditionalInputStyles(formData.buildingNumber)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="apartmentNumber" className="text-white text-[14px] font-normal mb-2 block">
                      Numer lokalu
                    </Label>
                    <Input
                      id="apartmentNumber"
                      name="apartmentNumber"
                      value={formData.apartmentNumber}
                      onChange={handleChange}
                      placeholder="Wpisz jeżeli występuje"
                      className={getConditionalInputStyles(formData.apartmentNumber)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode" className="text-white text-[14px] font-normal mb-2 block">
                      Kod pocztowy
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Wpisz kod"
                      className={getConditionalInputStyles(formData.postalCode)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-white text-[14px] font-normal mb-2 block">
                      Miasto
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Miasto odbioru"
                      className={getConditionalInputStyles(formData.city)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-white text-[14px] font-normal mb-2 block">
                    Kraj
                  </Label>
                  <Select onValueChange={handleCountryChange} required value={formData.country}>
                    <SelectTrigger className={getConditionalInputStyles(formData.country)}>
                      <SelectValue placeholder="Wybierz z listy" />
                    </SelectTrigger>
                    <SelectContent className="select-dark-content bg-[#181e25] border-gray-700">
                      <SelectItem value="afghanistan" className="select-dark-item text-[#9098A2]">
                        Afganistan
                      </SelectItem>
                      <SelectItem value="albania" className="select-dark-item text-[#9098A2]">
                        Albania
                      </SelectItem>
                      <SelectItem value="algeria" className="select-dark-item text-[#9098A2]">
                        Algieria
                      </SelectItem>
                      <SelectItem value="american-samoa" className="select-dark-item text-[#9098A2]">
                        Samoa Amerykańskie
                      </SelectItem>
                      <SelectItem value="andorra" className="select-dark-item text-[#9098A2]">
                        Andora
                      </SelectItem>
                      <SelectItem value="angola" className="select-dark-item text-[#9098A2]">
                        Angola
                      </SelectItem>
                      <SelectItem value="anguilla" className="select-dark-item text-[#9098A2]">
                        Anguilla
                      </SelectItem>
                      <SelectItem value="antigua-barbuda" className="select-dark-item text-[#9098A2]">
                        Antigua i Barbuda
                      </SelectItem>
                      <SelectItem value="saudi-arabia" className="select-dark-item text-[#9098A2]">
                        Arabia Saudyjska
                      </SelectItem>
                      <SelectItem value="argentina" className="select-dark-item text-[#9098A2]">
                        Argentyna
                      </SelectItem>
                      <SelectItem value="armenia" className="select-dark-item text-[#9098A2]">
                        Armenia
                      </SelectItem>
                      <SelectItem value="aruba" className="select-dark-item text-[#9098A2]">
                        Aruba
                      </SelectItem>
                      <SelectItem value="australia" className="select-dark-item text-[#9098A2]">
                        Australia
                      </SelectItem>
                      <SelectItem value="austria" className="select-dark-item text-[#9098A2]">
                        Austria
                      </SelectItem>
                      <SelectItem value="azerbaijan" className="select-dark-item text-[#9098A2]">
                        Azerbejdżan
                      </SelectItem>
                      <SelectItem value="bahamas" className="select-dark-item text-[#9098A2]">
                        Bahamy
                      </SelectItem>
                      <SelectItem value="bahrain" className="select-dark-item text-[#9098A2]">
                        Bahrajn
                      </SelectItem>
                      <SelectItem value="bangladesh" className="select-dark-item text-[#9098A2]">
                        Bangladesz
                      </SelectItem>
                      <SelectItem value="barbados" className="select-dark-item text-[#9098A2]">
                        Barbados
                      </SelectItem>
                      <SelectItem value="belarus" className="select-dark-item text-[#9098A2]">
                        Białoruś
                      </SelectItem>
                      <SelectItem value="belgium" className="select-dark-item text-[#9098A2]">
                        Belgia
                      </SelectItem>
                      <SelectItem value="belize" className="select-dark-item text-[#9098A2]">
                        Belize
                      </SelectItem>
                      <SelectItem value="benin" className="select-dark-item text-[#9098A2]">
                        Benin
                      </SelectItem>
                      <SelectItem value="bermuda" className="select-dark-item text-[#9098A2]">
                        Bermudy
                      </SelectItem>
                      <SelectItem value="bhutan" className="select-dark-item text-[#9098A2]">
                        Bhutan
                      </SelectItem>
                      <SelectItem value="bolivia" className="select-dark-item text-[#9098A2]">
                        Boliwia
                      </SelectItem>
                      <SelectItem value="bonaire" className="select-dark-item text-[#9098A2]">
                        Bonaire, Sint Eustatius i Saba
                      </SelectItem>
                      <SelectItem value="bosnia-herzegovina" className="select-dark-item text-[#9098A2]">
                        Bośnia i Hercegowina
                      </SelectItem>
                      <SelectItem value="botswana" className="select-dark-item text-[#9098A2]">
                        Botswana
                      </SelectItem>
                      <SelectItem value="brazil" className="select-dark-item text-[#9098A2]">
                        Brazylia
                      </SelectItem>
                      <SelectItem value="british-indian-ocean" className="select-dark-item text-[#9098A2]">
                        Brytyjskie Terytorium Oceanu Indyjskiego
                      </SelectItem>
                      <SelectItem value="brunei" className="select-dark-item text-[#9098A2]">
                        Brunei
                      </SelectItem>
                      <SelectItem value="bulgaria" className="select-dark-item text-[#9098A2]">
                        Bułgaria
                      </SelectItem>
                      <SelectItem value="burkina-faso" className="select-dark-item text-[#9098A2]">
                        Burkina Faso
                      </SelectItem>
                      <SelectItem value="burundi" className="select-dark-item text-[#9098A2]">
                        Burundi
                      </SelectItem>
                      <SelectItem value="ivory-coast" className="select-dark-item text-[#9098A2]">
                        Wybrzeże Kości Słoniowej
                      </SelectItem>
                      <SelectItem value="cambodia" className="select-dark-item text-[#9098A2]">
                        Kambodża
                      </SelectItem>
                      <SelectItem value="cameroon" className="select-dark-item text-[#9098A2]">
                        Kamerun
                      </SelectItem>
                      <SelectItem value="canada" className="select-dark-item text-[#9098A2]">
                        Kanada
                      </SelectItem>
                      <SelectItem value="cape-verde" className="select-dark-item text-[#9098A2]">
                        Wyspy Zielonego Przylądka
                      </SelectItem>
                      <SelectItem value="cayman-islands" className="select-dark-item text-[#9098A2]">
                        Kajmany
                      </SelectItem>
                      <SelectItem value="central-african-republic" className="select-dark-item text-[#9098A2]">
                        Republika Środkowoafrykańska
                      </SelectItem>
                      <SelectItem value="chad" className="select-dark-item text-[#9098A2]">
                        Czad
                      </SelectItem>
                      <SelectItem value="chile" className="select-dark-item text-[#9098A2]">
                        Chile
                      </SelectItem>
                      <SelectItem value="china" className="select-dark-item text-[#9098A2]">
                        Chiny
                      </SelectItem>
                      <SelectItem value="christmas-island" className="select-dark-item text-[#9098A2]">
                        Wyspa Bożego Narodzenia
                      </SelectItem>
                      <SelectItem value="cocos-islands" className="select-dark-item text-[#9098A2]">
                        Wyspy Kokosowe (Keelinga)
                      </SelectItem>
                      <SelectItem value="colombia" className="select-dark-item text-[#9098A2]">
                        Kolumbia
                      </SelectItem>
                      <SelectItem value="comoros" className="select-dark-item text-[#9098A2]">
                        Komory
                      </SelectItem>
                      <SelectItem value="congo" className="select-dark-item text-[#9098A2]">
                        Kongo
                      </SelectItem>
                      <SelectItem value="cook-islands" className="select-dark-item text-[#9098A2]">
                        Wyspy Cooka
                      </SelectItem>
                      <SelectItem value="costa-rica" className="select-dark-item text-[#9098A2]">
                        Kostaryka
                      </SelectItem>
                      <SelectItem value="croatia" className="select-dark-item text-[#9098A2]">
                        Chorwacja
                      </SelectItem>
                      <SelectItem value="cuba" className="select-dark-item text-[#9098A2]">
                        Kuba
                      </SelectItem>
                      <SelectItem value="curacao" className="select-dark-item text-[#9098A2]">
                        Curacao
                      </SelectItem>
                      <SelectItem value="cyprus" className="select-dark-item text-[#9098A2]">
                        Cypr
                      </SelectItem>
                      <SelectItem value="czechia" className="select-dark-item text-[#9098A2]">
                        Republika Czeska
                      </SelectItem>
                      <SelectItem value="denmark" className="select-dark-item text-[#9098A2]">
                        Dania
                      </SelectItem>
                      <SelectItem value="djibouti" className="select-dark-item text-[#9098A2]">
                        Dżibuti
                      </SelectItem>
                      <SelectItem value="dominica" className="select-dark-item text-[#9098A2]">
                        Dominika
                      </SelectItem>
                      <SelectItem value="dominican-republic" className="select-dark-item text-[#9098A2]">
                        Republika Dominikany
                      </SelectItem>
                      <SelectItem value="east-timor" className="select-dark-item text-[#9098A2]">
                        Wschodni Timor
                      </SelectItem>
                      <SelectItem value="ecuador" className="select-dark-item text-[#9098A2]">
                        Ekwador
                      </SelectItem>
                      <SelectItem value="egypt" className="select-dark-item text-[#9098A2]">
                        Egipt
                      </SelectItem>
                      <SelectItem value="el-salvador" className="select-dark-item text-[#9098A2]">
                        Salwador
                      </SelectItem>
                      <SelectItem value="equatorial-guinea" className="select-dark-item text-[#9098A2]">
                        Gwinea Równikowa
                      </SelectItem>
                      <SelectItem value="eritrea" className="select-dark-item text-[#9098A2]">
                        Erytrea
                      </SelectItem>
                      <SelectItem value="estonia" className="select-dark-item text-[#9098A2]">
                        Estonia
                      </SelectItem>
                      <SelectItem value="ethiopia" className="select-dark-item text-[#9098A2]">
                        Etiopia
                      </SelectItem>
                      <SelectItem value="falkland-islands" className="select-dark-item text-[#9098A2]">
                        Falklandy (Malwiny)
                      </SelectItem>
                      <SelectItem value="faroe-islands" className="select-dark-item text-[#9098A2]">
                        Wyspy Owcze
                      </SelectItem>
                      <SelectItem value="fiji" className="select-dark-item text-[#9098A2]">
                        Fidżi
                      </SelectItem>
                      <SelectItem value="finland" className="select-dark-item text-[#9098A2]">
                        Finlandia
                      </SelectItem>
                      <SelectItem value="france" className="select-dark-item text-[#9098A2]">
                        Francja
                      </SelectItem>
                      <SelectItem value="french-guiana" className="select-dark-item text-[#9098A2]">
                        Gujana Francuska
                      </SelectItem>
                      <SelectItem value="french-polynesia" className="select-dark-item text-[#9098A2]">
                        Polinezja Francuska
                      </SelectItem>
                      <SelectItem value="french-southern-territories" className="select-dark-item text-[#9098A2]">
                        Francuskie Terytoria Południowe
                      </SelectItem>
                      <SelectItem value="gabon" className="select-dark-item text-[#9098A2]">
                        Gabon
                      </SelectItem>
                      <SelectItem value="gambia" className="select-dark-item text-[#9098A2]">
                        Gambia
                      </SelectItem>
                      <SelectItem value="georgia" className="select-dark-item text-[#9098A2]">
                        Gruzja
                      </SelectItem>
                      <SelectItem value="germany" className="select-dark-item text-[#9098A2]">
                        Niemcy
                      </SelectItem>
                      <SelectItem value="ghana" className="select-dark-item text-[#9098A2]">
                        Ghana
                      </SelectItem>
                      <SelectItem value="gibraltar" className="select-dark-item text-[#9098A2]">
                        Gibraltar
                      </SelectItem>
                      <SelectItem value="greece" className="select-dark-item text-[#9098A2]">
                        Grecja
                      </SelectItem>
                      <SelectItem value="greenland" className="select-dark-item text-[#9098A2]">
                        Grenlandia
                      </SelectItem>
                      <SelectItem value="grenada" className="select-dark-item text-[#9098A2]">
                        Grenada
                      </SelectItem>
                      <SelectItem value="guadeloupe" className="select-dark-item text-[#9098A2]">
                        Gwadelupa
                      </SelectItem>
                      <SelectItem value="guam" className="select-dark-item text-[#9098A2]">
                        Guam
                      </SelectItem>
                      <SelectItem value="guatemala" className="select-dark-item text-[#9098A2]">
                        Gwatemala
                      </SelectItem>
                      <SelectItem value="guernsey" className="select-dark-item text-[#9098A2]">
                        Guernsey
                      </SelectItem>
                      <SelectItem value="guinea" className="select-dark-item text-[#9098A2]">
                        Republika Gwinea
                      </SelectItem>
                      <SelectItem value="guinea-bissau" className="select-dark-item text-[#9098A2]">
                        Gwinea Bissau
                      </SelectItem>
                      <SelectItem value="guyana" className="select-dark-item text-[#9098A2]">
                        Gujana
                      </SelectItem>
                      <SelectItem value="haiti" className="select-dark-item text-[#9098A2]">
                        Haiti
                      </SelectItem>
                      <SelectItem value="heard-mcdonald-islands" className="select-dark-item text-[#9098A2]">
                        Wyspy Heard i McDonalda
                      </SelectItem>
                      <SelectItem value="vatican" className="select-dark-item text-[#9098A2]">
                        Stolica Apostolska
                      </SelectItem>
                      <SelectItem value="honduras" className="select-dark-item text-[#9098A2]">
                        Honduras
                      </SelectItem>
                      <SelectItem value="hong-kong" className="select-dark-item text-[#9098A2]">
                        Hongkong
                      </SelectItem>
                      <SelectItem value="hungary" className="select-dark-item text-[#9098A2]">
                        Węgry
                      </SelectItem>
                      <SelectItem value="iceland" className="select-dark-item text-[#9098A2]">
                        Islandia
                      </SelectItem>
                      <SelectItem value="india" className="select-dark-item text-[#9098A2]">
                        Indie
                      </SelectItem>
                      <SelectItem value="indonesia" className="select-dark-item text-[#9098A2]">
                        Indonezja
                      </SelectItem>
                      <SelectItem value="iran" className="select-dark-item text-[#9098A2]">
                        Iran
                      </SelectItem>
                      <SelectItem value="iraq" className="select-dark-item text-[#9098A2]">
                        Irak
                      </SelectItem>
                      <SelectItem value="ireland" className="select-dark-item text-[#9098A2]">
                        Irlandia
                      </SelectItem>
                      <SelectItem value="isle-of-man" className="select-dark-item text-[#9098A2]">
                        Wyspa Man
                      </SelectItem>
                      <SelectItem value="israel" className="select-dark-item text-[#9098A2]">
                        Izrael
                      </SelectItem>
                      <SelectItem value="italy" className="select-dark-item text-[#9098A2]">
                        Włochy
                      </SelectItem>
                      <SelectItem value="jamaica" className="select-dark-item text-[#9098A2]">
                        Jamajka
                      </SelectItem>
                      <SelectItem value="japan" className="select-dark-item text-[#9098A2]">
                        Japonia
                      </SelectItem>
                      <SelectItem value="yemen" className="select-dark-item text-[#9098A2]">
                        Jemen
                      </SelectItem>
                      <SelectItem value="jordan" className="select-dark-item text-[#9098A2]">
                        Jordania
                      </SelectItem>
                      <SelectItem value="kazakhstan" className="select-dark-item text-[#9098A2]">
                        Kazachstan
                      </SelectItem>
                      <SelectItem value="kenya" className="select-dark-item text-[#9098A2]">
                        Kenia
                      </SelectItem>
                      <SelectItem value="kiribati" className="select-dark-item text-[#9098A2]">
                        Kiribati
                      </SelectItem>
                      <SelectItem value="kosovo" className="select-dark-item text-[#9098A2]">
                        Kosowo
                      </SelectItem>
                      <SelectItem value="kuwait" className="select-dark-item text-[#9098A2]">
                        Kuwejt
                      </SelectItem>
                      <SelectItem value="kyrgyzstan" className="select-dark-item text-[#9098A2]">
                        Kirgistan
                      </SelectItem>
                      <SelectItem value="laos" className="select-dark-item text-[#9098A2]">
                        Laos
                      </SelectItem>
                      <SelectItem value="latvia" className="select-dark-item text-[#9098A2]">
                        Łotwa
                      </SelectItem>
                      <SelectItem value="lebanon" className="select-dark-item text-[#9098A2]">
                        Liban
                      </SelectItem>
                      <SelectItem value="lesotho" className="select-dark-item text-[#9098A2]">
                        Lesotho
                      </SelectItem>
                      <SelectItem value="liberia" className="select-dark-item text-[#9098A2]">
                        Liberia
                      </SelectItem>
                      <SelectItem value="libya" className="select-dark-item text-[#9098A2]">
                        Libia
                      </SelectItem>
                      <SelectItem value="liechtenstein" className="select-dark-item text-[#9098A2]">
                        Liechtenstein
                      </SelectItem>
                      <SelectItem value="lithuania" className="select-dark-item text-[#9098A2]">
                        Litwa
                      </SelectItem>
                      <SelectItem value="luxembourg" className="select-dark-item text-[#9098A2]">
                        Luksemburg
                      </SelectItem>
                      <SelectItem value="macao" className="select-dark-item text-[#9098A2]">
                        Makao
                      </SelectItem>
                      <SelectItem value="macedonia" className="select-dark-item text-[#9098A2]">
                        Macedonia
                      </SelectItem>
                      <SelectItem value="madagascar" className="select-dark-item text-[#9098A2]">
                        Madagaskar
                      </SelectItem>
                      <SelectItem value="malawi" className="select-dark-item text-[#9098A2]">
                        Malawi
                      </SelectItem>
                      <SelectItem value="malaysia" className="select-dark-item text-[#9098A2]">
                        Malezja
                      </SelectItem>
                      <SelectItem value="maldives" className="select-dark-item text-[#9098A2]">
                        Malediwy
                      </SelectItem>
                      <SelectItem value="mali" className="select-dark-item text-[#9098A2]">
                        Mali
                      </SelectItem>
                      <SelectItem value="malta" className="select-dark-item text-[#9098A2]">
                        Malta
                      </SelectItem>
                      <SelectItem value="marshall-islands" className="select-dark-item text-[#9098A2]">
                        Wyspy Marshalla
                      </SelectItem>
                      <SelectItem value="martinique" className="select-dark-item text-[#9098A2]">
                        Martynika
                      </SelectItem>
                      <SelectItem value="mauritania" className="select-dark-item text-[#9098A2]">
                        Mauretania
                      </SelectItem>
                      <SelectItem value="mauritius" className="select-dark-item text-[#9098A2]">
                        Mauritius
                      </SelectItem>
                      <SelectItem value="mayotte" className="select-dark-item text-[#9098A2]">
                        Majotta
                      </SelectItem>
                      <SelectItem value="mexico" className="select-dark-item text-[#9098A2]">
                        Meksyk
                      </SelectItem>
                      <SelectItem value="micronesia" className="select-dark-item text-[#9098A2]">
                        Mikronezja
                      </SelectItem>
                      <SelectItem value="moldova" className="select-dark-item text-[#9098A2]">
                        Mołdawia
                      </SelectItem>
                      <SelectItem value="monaco" className="select-dark-item text-[#9098A2]">
                        Monako
                      </SelectItem>
                      <SelectItem value="mongolia" className="select-dark-item text-[#9098A2]">
                        Mongolia
                      </SelectItem>
                      <SelectItem value="montenegro" className="select-dark-item text-[#9098A2]">
                        Czarnogóra
                      </SelectItem>
                      <SelectItem value="myanmar" className="select-dark-item text-[#9098A2]">
                        Mjanma
                      </SelectItem>
                      <SelectItem value="morocco" className="select-dark-item text-[#9098A2]">
                        Maroko
                      </SelectItem>
                      <SelectItem value="mozambique" className="select-dark-item text-[#9098A2]">
                        Mozambik
                      </SelectItem>
                      <SelectItem value="myanmar2" className="select-dark-item text-[#9098A2]">
                        Myanmar
                      </SelectItem>
                      <SelectItem value="namibia" className="select-dark-item text-[#9098A2]">
                        Namibia
                      </SelectItem>
                      <SelectItem value="nauru" className="select-dark-item text-[#9098A2]">
                        Nauru
                      </SelectItem>
                      <SelectItem value="nepal" className="select-dark-item text-[#9098A2]">
                        Nepal
                      </SelectItem>
                      <SelectItem value="netherlands" className="select-dark-item text-[#9098A2]">
                        Holandia
                      </SelectItem>
                      <SelectItem value="new-caledonia" className="select-dark-item text-[#9098A2]">
                        Nowa Kaledonia
                      </SelectItem>
                      <SelectItem value="new-zealand" className="select-dark-item text-[#9098A2]">
                        Nowa Zelandia
                      </SelectItem>
                      <SelectItem value="nicaragua" className="select-dark-item text-[#9098A2]">
                        Nikaragua
                      </SelectItem>
                      <SelectItem value="niger" className="select-dark-item text-[#9098A2]">
                        Niger
                      </SelectItem>
                      <SelectItem value="nigeria" className="select-dark-item text-[#9098A2]">
                        Nigeria
                      </SelectItem>
                      <SelectItem value="norfolk-island" className="select-dark-item text-[#9098A2]">
                        Wyspa Norfolk
                      </SelectItem>
                      <SelectItem value="north-korea" className="select-dark-item text-[#9098A2]">
                        Korea Północna
                      </SelectItem>
                      <SelectItem value="northern-mariana" className="select-dark-item text-[#9098A2]">
                        Mariany Północne
                      </SelectItem>
                      <SelectItem value="norway" className="select-dark-item text-[#9098A2]">
                        Norwegia
                      </SelectItem>
                      <SelectItem value="oman" className="select-dark-item text-[#9098A2]">
                        Oman
                      </SelectItem>
                      <SelectItem value="pakistan" className="select-dark-item text-[#9098A2]">
                        Pakistan
                      </SelectItem>
                      <SelectItem value="palau" className="select-dark-item text-[#9098A2]">
                        Palau
                      </SelectItem>
                      <SelectItem value="palestine" className="select-dark-item text-[#9098A2]">
                        Palestyna
                      </SelectItem>
                      <SelectItem value="panama" className="select-dark-item text-[#9098A2]">
                        Panama
                      </SelectItem>
                      <SelectItem value="papua-new-guinea" className="select-dark-item text-[#9098A2]">
                        Papua Nowa Gwinea
                      </SelectItem>
                      <SelectItem value="paraguay" className="select-dark-item text-[#9098A2]">
                        Paragwaj
                      </SelectItem>
                      <SelectItem value="peru" className="select-dark-item text-[#9098A2]">
                        Peru
                      </SelectItem>
                      <SelectItem value="philippines" className="select-dark-item text-[#9098A2]">
                        Filipiny
                      </SelectItem>
                      <SelectItem value="pitcairn" className="select-dark-item text-[#9098A2]">
                        Pitcairn
                      </SelectItem>
                      <SelectItem value="poland" className="select-dark-item text-[#9098A2]">
                        Polska
                      </SelectItem>
                      <SelectItem value="portugal" className="select-dark-item text-[#9098A2]">
                        Portugalia
                      </SelectItem>
                      <SelectItem value="puerto-rico" className="select-dark-item text-[#9098A2]">
                        Portoryko
                      </SelectItem>
                      <SelectItem value="qatar" className="select-dark-item text-[#9098A2]">
                        Katar
                      </SelectItem>
                      <SelectItem value="romania" className="select-dark-item text-[#9098A2]">
                        Rumunia
                      </SelectItem>
                      <SelectItem value="russia" className="select-dark-item text-[#9098A2]">
                        Rosja
                      </SelectItem>
                      <SelectItem value="rwanda" className="select-dark-item text-[#9098A2]">
                        Rwanda
                      </SelectItem>
                      <SelectItem value="saint-kitts-nevis" className="select-dark-item text-[#9098A2]">
                        Saint Kitts i Nevis
                      </SelectItem>
                      <SelectItem value="saint-lucia" className="select-dark-item text-[#9098A2]">
                        Saint Lucia
                      </SelectItem>
                      <SelectItem value="saint-vincent" className="select-dark-item text-[#9098A2]">
                        Saint Vincent i Grenadyny
                      </SelectItem>
                      <SelectItem value="salvador" className="select-dark-item text-[#9098A2]">
                        Salwador
                      </SelectItem>
                      <SelectItem value="samoa" className="select-dark-item text-[#9098A2]">
                        Samoa
                      </SelectItem>
                      <SelectItem value="san-marino" className="select-dark-item text-[#9098A2]">
                        San Marino
                      </SelectItem>
                      <SelectItem value="senegal" className="select-dark-item text-[#9098A2]">
                        Senegal
                      </SelectItem>
                      <SelectItem value="serbia" className="select-dark-item text-[#9098A2]">
                        Serbia
                      </SelectItem>
                      <SelectItem value="seychelles" className="select-dark-item text-[#9098A2]">
                        Seszele
                      </SelectItem>
                      <SelectItem value="sierra-leone" className="select-dark-item text-[#9098A2]">
                        Sierra Leone
                      </SelectItem>
                      <SelectItem value="singapore" className="select-dark-item text-[#9098A2]">
                        Singapur
                      </SelectItem>
                      <SelectItem value="slovakia" className="select-dark-item text-[#9098A2]">
                        Słowacja
                      </SelectItem>
                      <SelectItem value="slovenia" className="select-dark-item text-[#9098A2]">
                        Słowenia
                      </SelectItem>
                      <SelectItem value="solomon-islands" className="select-dark-item text-[#9098A2]">
                        Wyspy Salomona
                      </SelectItem>
                      <SelectItem value="somalia" className="select-dark-item text-[#9098A2]">
                        Somalia
                      </SelectItem>
                      <SelectItem value="united-states" className="select-dark-item text-[#9098A2]">
                        Stany Zjednoczone
                      </SelectItem>
                      <SelectItem value="south-korea" className="select-dark-item text-[#9098A2]">
                        Korea Południowa
                      </SelectItem>
                      <SelectItem value="south-sudan" className="select-dark-item text-[#9098A2]">
                        Południowy Sudan
                      </SelectItem>
                      <SelectItem value="spain" className="select-dark-item text-[#9098A2]">
                        Hiszpania
                      </SelectItem>
                      <SelectItem value="sri-lanka" className="select-dark-item text-[#9098A2]">
                        Sri Lanka
                      </SelectItem>
                      <SelectItem value="sudan" className="select-dark-item text-[#9098A2]">
                        Sudan
                      </SelectItem>
                      <SelectItem value="suriname" className="select-dark-item text-[#9098A2]">
                        Surinam
                      </SelectItem>
                      <SelectItem value="swaziland" className="select-dark-item text-[#9098A2]">
                        Suazi
                      </SelectItem>
                      <SelectItem value="sweden" className="select-dark-item text-[#9098A2]">
                        Szwecja
                      </SelectItem>
                      <SelectItem value="switzerland" className="select-dark-item text-[#9098A2]">
                        Szwajcaria
                      </SelectItem>
                      <SelectItem value="syria" className="select-dark-item text-[#9098A2]">
                        Syria
                      </SelectItem>
                      <SelectItem value="taiwan" className="select-dark-item text-[#9098A2]">
                        Tajwan
                      </SelectItem>
                      <SelectItem value="tajikistan" className="select-dark-item text-[#9098A2]">
                        Tadżykistan
                      </SelectItem>
                      <SelectItem value="tanzania" className="select-dark-item text-[#9098A2]">
                        Tanzania
                      </SelectItem>
                      <SelectItem value="thailand" className="select-dark-item text-[#9098A2]">
                        Tajlandia
                      </SelectItem>
                      <SelectItem value="east-timor2" className="select-dark-item text-[#9098A2]">
                        Timor Wschodni
                      </SelectItem>
                      <SelectItem value="togo" className="select-dark-item text-[#9098A2]">
                        Togo
                      </SelectItem>
                      <SelectItem value="tokelau" className="select-dark-item text-[#9098A2]">
                        Tokelau
                      </SelectItem>
                      <SelectItem value="tonga" className="select-dark-item text-[#9098A2]">
                        Tonga
                      </SelectItem>
                      <SelectItem value="trinidad-tobago" className="select-dark-item text-[#9098A2]">
                        Trynidad i Tobago
                      </SelectItem>
                      <SelectItem value="tunisia" className="select-dark-item text-[#9098A2]">
                        Tunezja
                      </SelectItem>
                      <SelectItem value="turkey" className="select-dark-item text-[#9098A2]">
                        Turcja
                      </SelectItem>
                      <SelectItem value="turkmenistan" className="select-dark-item text-[#9098A2]">
                        Turkmenistan
                      </SelectItem>
                      <SelectItem value="tuvalu" className="select-dark-item text-[#9098A2]">
                        Tuvalu
                      </SelectItem>
                      <SelectItem value="uganda" className="select-dark-item text-[#9098A2]">
                        Uganda
                      </SelectItem>
                      <SelectItem value="ukraine" className="select-dark-item text-[#9098A2]">
                        Ukraina
                      </SelectItem>
                      <SelectItem value="uae" className="select-dark-item text-[#9098A2]">
                        Zjednoczone Emiraty Arabskie
                      </SelectItem>
                      <SelectItem value="united-kingdom" className="select-dark-item text-[#9098A2]">
                        Wielka Brytania
                      </SelectItem>
                      <SelectItem value="uruguay" className="select-dark-item text-[#9098A2]">
                        Urugwaj
                      </SelectItem>
                      <SelectItem value="uzbekistan" className="select-dark-item text-[#9098A2]">
                        Uzbekistan
                      </SelectItem>
                      <SelectItem value="vanuatu" className="select-dark-item text-[#9098A2]">
                        Vanuatu
                      </SelectItem>
                      <SelectItem value="vatican2" className="select-dark-item text-[#9098A2]">
                        Watykan
                      </SelectItem>
                      <SelectItem value="venezuela" className="select-dark-item text-[#9098A2]">
                        Wenezuela
                      </SelectItem>
                      <SelectItem value="vietnam" className="select-dark-item text-[#9098A2]">
                        Wietnam
                      </SelectItem>
                      <SelectItem value="western-sahara" className="select-dark-item text-[#9098A2]">
                        Sahara Zachodnia
                      </SelectItem>
                      <SelectItem value="yemen2" className="select-dark-item text-[#9098A2]">
                        Jemen
                      </SelectItem>
                      <SelectItem value="zambia" className="select-dark-item text-[#9098A2]">
                        Zambia
                      </SelectItem>
                      <SelectItem value="zimbabwe" className="select-dark-item text-[#9098A2]">
                        Zimbabwe
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "Inter, sans-serif",
              fontStyle: "normal",
              fontWeight: 500,
              fontSize: "14px",
              letterSpacing: "-0.5px",
              color: "#9098A2",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Wstecz
          </button>

          <Button
            type="submit"
            size="wide"
            className="bg-transparent hover:bg-transparent border border-gray-700 text-white hover:border-gray-500 rounded-md py-3 text-sm font-medium h-[64px] w-[240px]"
          >
            Dalej
          </Button>
        </div>
      </form>
    </div>
  )
}
