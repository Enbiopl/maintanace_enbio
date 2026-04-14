"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Info, Paperclip, Camera, ChevronDown, X, Folder } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DESCRIPTIVE_ERRORS, COUNTRY_PHONE_PREFIXES, COUNTRY_NAMES_PL } from "@/lib/form-data"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible" // Import Collapsible and CollapsibleContent

interface WarrantyFormProps {
  formData: any
  onBack: () => void
  onNext: (data: any) => void
}

export default function WarrantyForm({ formData, onBack, onNext }: WarrantyFormProps) {
  // Initialize state from passed formData
  const [serviceType, setServiceType] = useState(formData.serviceType || "warranty")
  const [contactData, setContactData] = useState({
    name: formData.name || "",
    email: formData.email || "",
    phonePrefix: formData.phonePrefix || "+48",
    phoneNumber: formData.phoneNumber || "",
    street: formData.street || "",
    buildingNumber: formData.buildingNumber || "",
    apartmentNumber: formData.apartmentNumber || "",
    postalCode: formData.postalCode || "",
    city: formData.city || "",
    country: formData.country || "poland",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedErrors, setSelectedErrors] = useState<string[]>(formData.selectedErrors || [])
  const [errorComment, setErrorComment] = useState<string>(formData.errorComment || "")
  const [selectedFolder, setSelectedFolder] = useState<{ name: string; files: File[] } | null>(null)
  const [isErrorSectionExpanded, setIsErrorSectionExpanded] = useState<boolean>(false)

  // Mock states for UI functionality
  const [fileUploadStatus, setFileUploadStatus] = useState<{ success?: boolean; error?: string } | null>(null)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [fileUploadProgress, setFileUploadProgress] = useState(0)
  const [invoiceData, setInvoiceData] = useState<any>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setContactData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (value: string) => {
    const prefix = COUNTRY_PHONE_PREFIXES[value] || "+48"
    setContactData((prev) => ({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Compile all form data
    const warrantyData = {
      ...contactData,
      selectedErrors,
      errorComment,
      attachedFile: selectedFile ? selectedFile.name : null,
      selectedFolder: selectedFolder
        ? {
            name: selectedFolder.name,
            fileCount: selectedFolder.files.length,
          }
        : null,
      invoiceData,
    }

    // Call the onNext callback with form data
    onNext(warrantyData)
  }

  // Implement the file upload simulations as in the original component
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Simulate upload
      setIsFileUploading(true)
      setFileUploadProgress(0)

      const progressInterval = setInterval(() => {
        setFileUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Simulate completion after 2 seconds
      setTimeout(() => {
        clearInterval(progressInterval)
        setFileUploadProgress(100)
        setFileUploadStatus({ success: true })

        // Mock invoice data
        const mockData = {
          nabywca: {
            nazwa_firmy: "Enbio Technology Sp. z o.o.",
            ulica: "Działkowców",
            numer_budynku: "15",
            numer_lokalu: "brak danych",
            miasto: "Rumia",
            kod_pocztowy: "84-230",
            kraj: "Polska",
          },
        }

        setInvoiceData(mockData)

        // Prefill form with mock data
        setContactData((prev) => ({
          ...prev,
          street: mockData.nabywca.ulica,
          buildingNumber: mockData.nabywca.numer_budynku,
          city: mockData.nabywca.miasto,
          postalCode: mockData.nabywca.kod_pocztowy,
          country: "poland",
        }))

        setTimeout(() => {
          setIsFileUploading(false)
        }, 500)
      }, 2000)
    }
  }

  // Function to get input styles based on whether field is filled
  const getInputStyles = (value: string) => {
    const baseStyles = "h-[52px] rounded-lg pt-2 pr-5 pb-2 pl-4 focus:border-gray-300 transition-colors duration-200"
    const filledStyles = "bg-white border-solid border-gray-300 text-gray-900"
    const emptyStyles = "bg-gray-50 border-gray-300 text-gray-600 placeholder:text-gray-500"

    return `${baseStyles} ${value ? filledStyles : emptyStyles}`
  }

  return (
    <>
      {/* Main h1 title is now in FormContainer */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left Column - Device Data */}
          <div>
            <h2 className="text-gray-900 text-xl font-semibold mb-6 tracking-tight">1. Dane urządzenia</h2>

            <div className="bg-gray-50 rounded-md p-5">
              <button
                type="button"
                onClick={onBack}
                className="flex items-start gap-3 mb-8 w-full text-left bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded-md p-2 -m-2 transition-all duration-300 ease-in-out"
              >
                <div className="mt-1 relative flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
                  </div>
                </div>
                <div>
                  {serviceType === "post-warranty" ? (
                    <>
                      <Label className="text-gray-900 font-medium text-base cursor-pointer">Serwis pogwarancyjny</Label>
                      <p className="text-gray-600 text-sm mt-1">Jeśli gwarancja już wygasła lub nie masz pewności</p>
                    </>
                  ) : (
                    <>
                      <Label className="text-gray-900 font-medium text-base cursor-pointer">Serwis gwarancyjny</Label>
                      <p className="text-gray-600 text-sm mt-1">Dla urządzeń objętych aktywną gwarancją producenta.</p>
                    </>
                  )}
                </div>
              </button>
              <p className="text-gray-600 text-xs mt-2 ml-8">Kliknij ponownie, aby zmienić wybór</p>

              <div className="border-t border-gray-200 pt-8 mt-6">
                <div className="space-y-11">
                  {serviceType === "warranty" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-900 text-sm font-normal text-[14px]">
                          Dodaj zdjęcie faktury lub świadectwa gwarancji
                        </Label>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="end"
                              className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 rounded-md z-50 rounded-br-none mr-2"
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
                        className={`border border-solid border-gray-300 rounded-md p-4 py-8 min-h-[100px] flex items-center relative transition-all duration-200 ${
                          !selectedFile && !isFileUploading
                            ? "bg-gray-50 hover:bg-gray-200 hover:text-gray-900 cursor-pointer group"
                            : selectedFile && !isFileUploading
                              ? "bg-white border-solid border-gray-300"
                              : "bg-gray-50"
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

                        <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-gray-900 text-sm w-full transition-colors duration-200 px-2">
                          {isFileUploading ? (
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-600">dodany plik {fileUploadProgress}%</span>
                                {fileUploadProgress === 100 && (
                                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                                  style={{ width: `${fileUploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : selectedFile ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-gray-900 text-base flex-1 truncate">{selectedFile.name}</span>
                                {fileUploadStatus && fileUploadStatus.success && (
                                  <span className="text-green-500 text-xs">✓</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {fileUploadStatus && fileUploadStatus.success && (
                                  <button
                                    type="button"
                                    className="w-5 h-5 rounded bg-transparent hover:bg-gray-600 flex items-center justify-center transition-colors"
                                    title="Pobierz plik"
                                  >
                                    <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFile(null)
                                    setFileUploadStatus(null)
                                    setInvoiceData(null)
                                    setContactData((prev) => ({
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
                                  <X className="h-3 w-3" />
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
                        <span className="text-gray-600 text-xs">Dozwolone formaty: JPG, PDF</span>
                        <span className="text-gray-600 text-xs">Maksymalny rozmiar: 10 MB</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-gray-900 text-sm font-normal text-[14px]">
                        Numery błędów lub/i komentarz
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">Gdzie szukać</span>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="end"
                              className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 rounded-md z-50 rounded-br-none mr-2"
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

                    <Collapsible open={isErrorSectionExpanded} onOpenChange={setIsErrorSectionExpanded}>
                      <div className="bg-gray-50 border border-gray-300 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setIsErrorSectionExpanded(!isErrorSectionExpanded)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white transition-colors rounded-t-lg border-b border-gray-300"
                        >
                          <span className="text-gray-600 text-sm">
                            {selectedErrors.length > 0 || errorComment
                              ? `${selectedErrors.length > 0 ? `Wybrano ${selectedErrors.length} błędów` : ""}${selectedErrors.length > 0 && errorComment ? " + " : ""}${errorComment ? "komentarz" : ""}`
                              : "Wybierz numery błędów, zdjęcia lub komentarze"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        </button>

                        {/* Show selected errors/comments when collapsed */}
                        {!isErrorSectionExpanded && (selectedErrors.length > 0 || errorComment) && (
                          <div className="p-4 bg-gray-100">
                            {selectedErrors.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {selectedErrors.map((errorId) => {
                                  const errorNumber = errorId.match(/error(\d+)/)
                                    ? `Błąd nr ${errorId.match(/error(\d+)/)![1]}`
                                    : DESCRIPTIVE_ERRORS.find((error) => error.id === errorId)?.label || errorId

                                  return (
                                    <div
                                      key={errorId}
                                      className="bg-blue-600 text-gray-900 px-3 py-1 rounded-full h-10 text-sm flex items-center gap-2"
                                    >
                                      <span>{errorNumber}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveError(errorId)}
                                        className="hover:bg-blue-600/80 rounded-full p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {errorComment && (
                              <Textarea
                                value={errorComment}
                                onChange={(e) => setErrorComment(e.target.value)}
                                placeholder="Maszyna wydaje dziwne dźwięki."
                                className="bg-gray-200 border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[80px] resize-none rounded-lg focus:border-gray-400 focus:ring-0 w-full"
                              />
                            )}
                          </div>
                        )}

                        <CollapsibleContent>
                          {/* Error Selection Section */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-gray-900 text-sm font-semibold">wybierz z listy błędów</h4>
                            </div>

                            <div className="flex flex-wrap items-start content-start p-0 gap-3 mb-4">
                              {/* Numbered errors */}
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
                                        ? "bg-blue-600 text-gray-900"
                                        : "bg-white text-gray-900 hover:bg-gray-300 hover:text-gray-900 border border-gray-300"
                                    }`}
                                  >
                                    {num}
                                  </button>
                                )
                              })}
                              {/* Descriptive errors */}
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
                                        ? "bg-blue-600 text-gray-900 border-[#0052B2]"
                                        : "bg-white text-gray-900 hover:bg-gray-300 hover:text-gray-900 border-gray-300"
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
                                  const errorNumber = errorId.match(/error(\d+)/)
                                    ? `Błąd nr ${errorId.match(/error(\d+)/)![1]}`
                                    : DESCRIPTIVE_ERRORS.find((error) => error.id === errorId)?.label || errorId

                                  return (
                                    <div
                                      key={errorId}
                                      className="bg-blue-600 text-gray-900 px-3 py-1 rounded-full h-10 text-sm flex items-center gap-2"
                                    >
                                      <span>{errorNumber}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveError(errorId)}
                                        className="hover:bg-blue-600/80 rounded-full p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Comment Section */}
                            <div className="border-t border-gray-300 pt-4">
                              <h4 className="text-gray-700 text-sm font-normal mb-3">Komentarz</h4>
                              <Textarea
                                value={errorComment}
                                onChange={(e) => setErrorComment(e.target.value)}
                                placeholder="Maszyna wydaje dziwne dźwięki."
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[80px] resize-none rounded-lg focus:border-gray-400 focus:ring-0 w-full"
                              />
                            </div>

                            {/* Confirm Button */}
                            <div className="flex justify-end pt-4 mt-4 border-t border-gray-300">
                              <button
                                type="button"
                                onClick={() => setIsErrorSectionExpanded(false)}
                                className="bg-transparent border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-[#5F6A77] px-6 py-2 rounded-full text-sm font-medium transition-colors"
                              >
                                Potwierdź
                              </button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-gray-900 text-sm font-normal text-[14px]">Dodaj folder autokławu</Label>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="end"
                            className="bg-blue-100 border border-blue-200 text-blue-900 max-w-[280px] p-3 rounded-md z-50 rounded-br-none mr-2"
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
                      className={`border border-solid border-gray-300 rounded-md p-4 py-8 min-h-[100px] flex items-center relative transition-all duration-200 ${
                        selectedFolder
                          ? "bg-white border-solid border-gray-300"
                          : "bg-gray-50 hover:bg-gray-200 hover:text-gray-900 cursor-pointer group"
                      }`}
                    >
                      <input
                        type="file"
                        id="folderUpload"
                        // @ts-ignore - webkitdirectory nie jest standardową właściwością, ale działa w większości przeglądarek
                        webkitdirectory=""
                        directory=""
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const files = Array.from(e.target.files)
                            const folderName = files[0].webkitRelativePath.split("/")[0]
                            setSelectedFolder({ name: folderName, files: files })
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className={`flex items-center justify-center gap-2 text-gray-600 text-sm w-full ${
                          selectedFolder ? "" : "group-hover:text-gray-900 transition-colors duration-200 px-2"
                        }`}
                      >
                        {selectedFolder ? (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Folder className="h-4 w-4 text-gray-600" />
                            <span>{selectedFolder.name}</span>
                            <span className="text-gray-600 text-xs">({selectedFolder.files.length} plików)</span>
                          </div>
                        ) : (
                          <>
                            <span>Przeciągnij lub</span>
                            <span className="text-gray-600 underline">wybierz folder</span>
                            <Folder className="h-4 w-4 text-gray-600" />
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs mt-4">
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
            <h2 className="text-gray-900 text-xl font-semibold mb-6 tracking-tight">
              2. Dane kontaktowe <span className="text-gray-600 font-normal">(do przesyłki autoklawu)</span>
            </h2>

            <div className="bg-gray-50 rounded-md p-5 space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-900 text-[14px] font-normal mb-2 block">
                  Imię i nazwisko
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={contactData.name}
                  onChange={handleChange}
                  placeholder="Wpisz pełne imię i nazwisko"
                  className={getInputStyles(contactData.name)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-900 text-[14px] font-normal mb-2 block">
                  Adres e-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={contactData.email}
                  onChange={handleChange}
                  placeholder="Podaj adres e-mail"
                  className={getInputStyles(contactData.email)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-900 text-[14px] font-normal mb-2 block">
                  Telefon
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="phonePrefix"
                    name="phonePrefix"
                    value={contactData.phonePrefix}
                    onChange={(e) => {
                      const prefix = e.target.value
                      setContactData((prev) => ({ ...prev, phonePrefix: prefix }))
                    }}
                    placeholder="+48"
                    className={`${getInputStyles(contactData.phonePrefix)} w-20 text-center`}
                    required
                  />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={contactData.phoneNumber}
                    onChange={handleChange}
                    placeholder="123 456 789"
                    className={`${getInputStyles(contactData.phoneNumber)} flex-1`}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="street" className="text-gray-900 text-[14px] font-normal mb-2 block">
                  Nazwa ulicy
                </Label>
                <Input
                  id="street"
                  name="street"
                  value={contactData.street}
                  onChange={handleChange}
                  placeholder="Wpisz pełną nazwę ulicy"
                  className={getInputStyles(contactData.street)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buildingNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    Numer budynku
                  </Label>
                  <Input
                    id="buildingNumber"
                    name="buildingNumber"
                    value={contactData.buildingNumber}
                    onChange={handleChange}
                    placeholder="Podaj numer"
                    className={getInputStyles(contactData.buildingNumber)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="apartmentNumber" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    Numer lokalu
                  </Label>
                  <Input
                    id="apartmentNumber"
                    name="apartmentNumber"
                    value={contactData.apartmentNumber}
                    onChange={handleChange}
                    placeholder="Wpisz jeżeli występuje"
                    className={getInputStyles(contactData.apartmentNumber)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    Kod pocztowy
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={contactData.postalCode}
                    onChange={handleChange}
                    placeholder="Wpisz kod"
                    className={getInputStyles(contactData.postalCode)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-gray-900 text-[14px] font-normal mb-2 block">
                    Miasto
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={contactData.city}
                    onChange={handleChange}
                    placeholder="Miasto odbioru"
                    className={getInputStyles(contactData.city)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="text-gray-900 text-[14px] font-normal mb-2 block">
                  Kraj
                </Label>
                <Select onValueChange={handleCountryChange} required value={contactData.country}>
                  <SelectTrigger className={getInputStyles(contactData.country)}>
                    <SelectValue placeholder="Wybierz z listy" />
                  </SelectTrigger>
                  <SelectContent className="select-dark-content bg-gray-50 border-gray-300">
                    {Object.entries(COUNTRY_NAMES_PL)
                      .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
                      .map(([value, label]) => (
                        <SelectItem key={value} value={value} className="select-dark-item text-gray-600">
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
