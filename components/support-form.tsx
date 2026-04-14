"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function SupportForm() {
  const router = useRouter()
  const [serviceType, setServiceType] = useState<string | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleServiceTypeChange = (type: string) => {
    setServiceType(type)
    setIsTransitioning(true)

    // Save service type to localStorage
    localStorage.setItem("serviceType", type)

    // Zmniejszamy opóźnienie z 800ms do 50ms
    setTimeout(() => {
      router.push("/warranty-form")
    }, 50)
  }

  return (
    <div className="w-[1035px] mx-auto">
      <div
        className={`transition-all duration-100 ease-in-out ${isTransitioning ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"}`}
      >
        <h1 className="text-gray-900 text-center text-2xl font-medium mb-8">Jak możemy Ci pomóc?</h1>

        <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-200 w-[1035px] transition-all duration-300 ease-in-out">
          <h2 className="text-gray-900 text-xl font-medium mb-6">1. Dane urządzenia</h2>

          <div className="bg-gray-50 rounded-md p-5 w-[430px] ml-0 border border-gray-200">
            <div className="space-y-6">
              <div
                className={`flex items-start gap-3 transition-all duration-300 ease-in-out hover:bg-gray-100 rounded-md p-2 -m-2 cursor-pointer ${serviceType === "warranty" ? "bg-gray-100" : ""}`}
                onClick={() => handleServiceTypeChange("warranty")}
              >
                <div className="mt-1 relative flex items-center justify-center">
                  <input
                    type="radio"
                    id="warranty"
                    name="serviceType"
                    value="warranty"
                    checked={serviceType === "warranty"}
                    onChange={() => {}}
                    className="appearance-none w-5 h-5 rounded-full border border-gray-400 checked:border-gray-600 focus:outline-none transition-all duration-200"
                  />
                  {serviceType === "warranty" && (
                    <div className="absolute w-2.5 h-2.5 bg-gray-900 rounded-full pointer-events-none animate-in zoom-in-50 duration-200"></div>
                  )}
                </div>
                <div>
                  <Label htmlFor="warranty" className="text-gray-900 font-medium text-base cursor-pointer">
                    Serwis gwarancyjny
                  </Label>
                  <p className="text-gray-600 text-sm mt-1">Dla urządzeń objętych aktywną gwarancją producenta.</p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 transition-all duration-300 ease-in-out hover:bg-gray-100 rounded-md p-2 -m-2 cursor-pointer ${serviceType === "post-warranty" ? "bg-gray-100" : ""}`}
                onClick={() => handleServiceTypeChange("post-warranty")}
              >
                <div className="mt-1 relative flex items-center justify-center">
                  <input
                    type="radio"
                    id="post-warranty"
                    name="serviceType"
                    value="post-warranty"
                    checked={serviceType === "post-warranty"}
                    onChange={() => {}}
                    className="appearance-none w-5 h-5 rounded-full border border-gray-400 checked:border-gray-600 focus:outline-none transition-all duration-200"
                  />
                  {serviceType === "post-warranty" && (
                    <div className="absolute w-2.5 h-2.5 bg-gray-900 rounded-full pointer-events-none animate-in zoom-in-50 duration-200"></div>
                  )}
                </div>
                <div>
                  <Label htmlFor="post-warranty" className="text-gray-900 font-medium text-base cursor-pointer">
                    Serwis pogwarancyjny
                  </Label>
                  <p className="text-gray-600 text-sm mt-1">Jeśli gwarancja już wygasła lub nie masz pewności</p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#252d3b] pt-4 text-left pl-0">
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger className="flex items-center text-white hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#181e25] rounded-sm">
                  <span className="text-sm">Sprawdź czy Twoje urządzenie jest na gwarancji</span>
                  <div
                    className={`ml-2 w-5 h-5 rounded-full bg-white flex items-center justify-center transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    <ChevronDown className="h-3 w-3 text-gray-800" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                  <div className="mt-4 text-[#E1E5EA] text-sm space-y-4">
                    <div>
                      <h4 className="text-[#FAFBFB] font-semibold mb-3">
                        Twoje urządzenie może być objęte gwarancją, jeśli:
                      </h4>
                      <ol className="list-decimal list-inside space-y-3 ml-2">
                        <li>
                          Od daty zakupu nie minęły <strong className="text-[#FAFBFB] font-semibold">2 lata</strong>.
                        </li>
                        <li>
                          W Twoim kraju wymagany <strong className="text-[#FAFBFB] font-semibold">przegląd</strong>{" "}
                          został wykonany zgodnie z instrukcją.
                        </li>
                      </ol>
                    </div>

                    <div className="bg-red-900/20 border border-red-700/50 rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-[#B20000] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">!</span>
                        </div>
                        <div>
                          <p className="text-red-300 font-semibold mb-1">UWAGA!</p>
                          <p className="text-red-200 font-normal">
                            Warunki przeglądu różnią się w zależności od kraju.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-2 mb-3">
                        <span className="text-gray-400">🔗</span>
                        <p className="text-[#E1E5EA] font-normal">
                          Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:
                        </p>
                      </div>
                      <ul className="list-disc list-inside space-y-2 ml-6 text-[#E1E5EA] font-normal">
                        <li>
                          Pendrive dołączony do urządzenia → plik{" "}
                          <strong className="text-[#FAFBFB] font-semibold">"Warunki gwarancji"</strong> lub
                        </li>
                        <li>
                          Pendrive dołączony do urządzenia → plik{" "}
                          <strong className="text-[#FAFBFB] font-semibold">"Instrukcja użytkownika"</strong> lub
                        </li>
                        <li>
                          Zakładka <strong className="text-[#FAFBFB] font-semibold">"Info"</strong> w menu autoklawu.
                        </li>
                      </ul>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>

        {serviceType && (
          <div className="flex justify-center mt-6 animate-in fade-in-50 duration-100">
            <div className="text-gray-900 text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              Przekierowywanie do formularza...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
