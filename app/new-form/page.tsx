import { Suspense } from "react"
import NewComplaintForm from "@/components/new-complaint-form"

export default function NewFormPage() {
  return (
    <Suspense fallback={null}>
      <NewComplaintForm />
    </Suspense>
  )
}
