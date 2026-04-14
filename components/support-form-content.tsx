"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SupportFormProps {
  onNext: (serviceType: string) => void
}

export default function SupportForm({ onNext }: SupportFormProps) {
  const [serviceType, setServiceType] = useState<string | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false)

  const handleServiceTypeChange = (type: string) => {
    setServiceType(type)
    onNext(type)
  }

  return (
    <>
      {/* Main h1 title is now in FormContainer */}
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

        <div className="mt-8 border-t border-gray-200 pt-4 text-left pl-0">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center text-gray-900 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 rounded-sm">
              <span className="text-sm">Sprawdź czy Twoje urządzenie jest na gwarancji</span>
              <div
                className={`ml-2 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
              >
                <ChevronDown className="h-3 w-3 text-white" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              <div className="mt-4 text-gray-700 text-sm space-y-4">
                <div>
                  <h4 className="text-gray-900 font-semibold mb-3">
                    Twoje urządzenie może być objęte gwarancją, jeśli:
                  </h4>
                  <ol className="list-decimal list-inside space-y-3 ml-2">
                    <li>
                      Od daty zakupu nie minęły <strong className="text-gray-900 font-semibold">2 lata</strong>.
                    </li>
                    <li>
                      W Twoim kraju wymagany <strong className="text-gray-900 font-semibold">przegląd</strong> został
                      wykonany zgodnie z instrukcją.
                    </li>
                  </ol>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">!</span>
                    </div>
                    <div>
                      <p className="text-red-700 font-semibold mb-1">UWAGA!</p>
                      <p className="text-red-600 font-normal">Warunki przeglądu różnią się w zależności od kraju.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-gray-600">🔗</span>
                    <p className="text-gray-700 font-normal">
                      Aby sprawdzić szczegóły dotyczące przeglądu, skorzystaj z dokumentacji:
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 ml-6 text-gray-700 font-normal">
                    <li>
                      Pendrive dołączony do urządzenia → plik{" "}
                      <strong className="text-gray-900 font-semibold">"Warunki gwarancji"</strong> lub
                    </li>
                    <li>
                      Pendrive dołączony do urządzenia → plik{" "}
                      <strong className="text-gray-900 font-semibold">"Instrukcja użytkownika"</strong> lub
                    </li>
                    <li>
                      Zakładka <strong className="text-gray-900 font-semibold">"Info"</strong> w menu autoklawu.
                    </li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {serviceType && (
        <div className="flex justify-center mt-6">
          <div className="text-gray-900 text-sm flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            Przechodzimy dalej...
          </div>
        </div>
      )}
    </>
  )
}
