"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SupportForm from "@/components/support-form-content"
import WarrantyForm from "@/components/warranty-form-content"
import SummaryForm from "@/components/summary-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type FormStep = "support" | "warranty" | "summary" | "success"

export default function FormContainer() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<FormStep>("support")
  const [formData, setFormData] = useState<any>({})
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false) // Local state for submitting

  // Render the appropriate content based on the step
  const renderContent = (step: FormStep) => {
    switch (step) {
      case "support":
        return (
          <SupportForm
            onNext={(serviceType) => {
              handleNext("warranty", { serviceType })
            }}
          />
        )
      case "warranty":
        return (
          <WarrantyForm
            formData={formData}
            onBack={() => handleBack("support")}
            onNext={(warrantyData) => {
              handleNext("summary", warrantyData)
            }}
          />
        )
      case "summary":
        return <SummaryForm formData={formData} onBack={() => handleBack("warranty")} onSubmit={handleSubmit} />
      default:
        return null
    }
  }

  // Handler for moving to the next step
  const handleNext = (step: FormStep, data: any = {}) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setIsTransitioning(true)
    setShowContent(false)

    setTimeout(() => {
      setCurrentStep(step)
      setTimeout(() => {
        setShowContent(true)
        setIsTransitioning(false)
      }, 200) // Faster fade-in
    }, 200) // Faster fade-out
  }

  // Handler for going back to the previous step
  const handleBack = (step: FormStep) => {
    setIsTransitioning(true)
    setShowContent(false)

    setTimeout(() => {
      setCurrentStep(step)
      setTimeout(() => {
        setShowContent(true)
        setIsTransitioning(false)
      }, 200) // Faster fade-in
    }, 200) // Faster fade-out
  }

  // Handle final submission
  const handleSubmit = () => {
    setIsSubmitting(true) // Set submitting state
    // Simulate submission delay
    setTimeout(() => {
      router.push("/success")
    }, 1000)
  }

  const getNextStep = (current: FormStep): FormStep => {
    switch (current) {
      case "support":
        return "warranty"
      case "warranty":
        return "summary"
      default:
        return "success" // Should not be reached for "summary" step as it uses handleSubmit
    }
  }

  const renderMainTitle = () => {
    switch (currentStep) {
      case "support":
        return <h1 className="text-gray-900 text-center text-2xl font-medium mb-8">Jak możemy Ci pomóc?</h1>
      case "warranty":
        return <h1 className="text-gray-900 text-center text-2xl font-medium mb-8">Jak możemy Ci pomóc?</h1>
      case "summary":
        return (
          <h1 className="text-gray-900 text-center text-2xl font-medium mb-8">
            Dane rozpoznane z faktury, sprawdź poprawność
          </h1>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-4 pt-20">
      {/* Render main title dynamically based on current step */}
      {renderMainTitle()}

      <div className="w-[1080px] mx-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Main content area */}
        <div className="p-12 h-full">
          {/* Content with transition */}
          <div
            className={`transition-opacity duration-200 ${showContent ? "ease-in" : "ease-out"}`}
            style={{
              opacity: showContent ? 1 : 0,
            }}
          >
            {renderContent(currentStep)}
          </div>
        </div>
      </div>
      {/* Navigation Buttons */}
      {currentStep !== "support" && ( // Conditionally render buttons
        <div className="flex justify-between items-center mt-6 w-[1080px]">
          <button
            type="button"
            onClick={() => handleBack(currentStep === "warranty" ? "support" : "warranty")}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "Inter, sans-serif",
              fontStyle: "normal",
              fontWeight: 500,
              fontSize: "14px",
              letterSpacing: "-0.5px",
              color: "#9098A2",
            }}
            disabled={isSubmitting || currentStep === "support"} // Disable during submission and on first step
          >
            <ArrowLeft className="h-4 w-4" />
            Wstecz
          </button>

          <Button
            onClick={currentStep === "summary" ? handleSubmit : () => handleNext(getNextStep(currentStep))}
            size="wide"
            className="bg-transparent hover:bg-transparent border border-gray-300 text-gray-900 hover:border-gray-500 rounded-md py-3 text-sm font-medium h-[64px] w-[240px]"
            disabled={isSubmitting} // Disable during submission
          >
            {currentStep === "summary" ? (isSubmitting ? "Wysyłanie..." : "Wyślij formularz") : "Dalej"}
          </Button>
        </div>
      )}
    </div>
  )
}
