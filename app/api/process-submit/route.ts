import { NextResponse } from "next/server"

const EXTERNAL_URL =
  "https://file.sellasist.com/new_aireaderapp/api/forms/process_submit.php"

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwTk90P4_zmsLk4VpPzWloQYGgPRX-xqryXKq8oRjhCYs6_cXmmsnXKUx6e4ePml56g3Q/exec"

/**
 * Proxy dla wysyłki formularza – omija CORS
 * i równolegle zapisuje pełne dane zgłoszenia jako `data-form.json`
 * w katalogu zgłoszenia na Google Drive (Apps Script).
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()

    // Spróbuj wyciągnąć formId z JSON-a (jeśli jest)
    let formId: string | undefined
    try {
      const parsed = JSON.parse(body)
      if (parsed && typeof parsed.formId === "string") {
        formId = parsed.formId
      }
    } catch {
      // Ignorujemy błąd parsowania – formularz i tak poleci do PHP,
      // a zapis do Google Drive użyje folderu zapasowego.
    }

    // 1) Wyślij dane zgłoszenia do PHP (jak dotychczas)
    const phpPromise = fetch(EXTERNAL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })

    // 2) Równolegle wyślij pełne dane jako data-form.json do Google Apps Script
    const base64Data = Buffer.from(body, "utf8").toString("base64")
    const fallbackFolder = "maintanance-forms"
    const subfolder = formId && formId.trim().length > 0 ? formId : fallbackFolder

    const googlePayload = {
      fileName: "data-form.json",
      mimeType: "application/json",
      base64Data,
      subfolder,
    }

    const googlePromise = fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googlePayload),
    }).catch((err) => {
      console.error("Google Script data-form upload error:", err)
      return null
    })

    const [response] = await Promise.all([phpPromise, googlePromise])

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Proxy process_submit error:", error)
    return NextResponse.json(
      { success: false, message: "Błąd połączenia z serwerem." },
      { status: 502 },
    )
  }
}
