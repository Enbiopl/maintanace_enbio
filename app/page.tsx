import { Suspense } from "react"
import NewComplaintForm from "@/components/new-complaint-form"

export default function Home() {
  return (
    <Suspense fallback={null}>
      <NewComplaintForm />
    </Suspense>
  )
}
