import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwTk90P4_zmsLk4VpPzWloQYGgPRX-xqryXKq8oRjhCYs6_cXmmsnXKUx6e4ePml56g3Q/exec"

const EXTERNAL_URL =
  "https://file.sellasist.com/new_aireaderapp/api/process_invoice.php"

/**
 * Jeden endpoint:
 * - domyślnie: OCR przez `process_invoice.php` + zapis na Google Drive,
 * - z `skipOcr=true`: tylko zapis pliku na Google Drive (bez OCR).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Brak pliku" },
        { status: 400 },
      )
    }

    const formIdValue = formData.get("formId")
    const skipOcr = formData.get("skipOcr") === "true"
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const defaultSubfolder = `maintanance/${year}-${month}`
    const subfolder =
      typeof formIdValue === "string" && formIdValue.trim().length > 0
        ? formIdValue
        : defaultSubfolder

    const googlePayload = {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      base64Data,
      subfolder,
    }

    if (skipOcr) {
      const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(googlePayload),
      }).catch((err) => {
        console.error("Google Script upload error:", err)
        return null
      })

      if (!googleResponse || !googleResponse.ok) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Nie udało się zapisać pliku. Spróbuj ponownie za chwilę.",
          },
          { status: 502 },
        )
      }

      let googleData: unknown = null
      try {
        googleData = await googleResponse.json()
      } catch {
        googleData = await googleResponse.text().catch(() => null)
      }

      return NextResponse.json(
        {
          success: true,
          ocrSkipped: true,
          google: googleData,
        },
        { status: 200 },
      )
    }

    // 1) Wyślij do PHP process_invoice.php
    const proxyFormData = new FormData()
    proxyFormData.append("file", file, file.name)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (compatible; EnbioForms/1.0; +https://forms.enbio.com)",
      Referer: "https://forms.enbio.com/",
      Origin: "https://forms.enbio.com",
    }
    const apiKey = process.env.INVOICE_API_KEY
    if (apiKey) headers["X-API-Key"] = apiKey

    const phpPromise = fetch(EXTERNAL_URL, {
      method: "POST",
      body: proxyFormData,
      signal: controller.signal,
      headers,
    })

    // 2) Równolegle wyślij do Google Apps Script (Drive)
    const googlePromise = fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googlePayload),
    }).catch((err) => {
      console.error("Google Script upload error:", err)
      return null
    })

    const [phpResponse, googleResponse] = await Promise.all([
      phpPromise,
      googlePromise,
    ])

    clearTimeout(timeoutId)

    const phpData = await phpResponse.json().catch(() => ({}))

    if (!phpResponse.ok) {
      console.error(
        "process_invoice external response:",
        phpResponse.status,
        phpData,
      )
      return NextResponse.json(
        {
          success: false,
          error:
            phpData?.error ||
            "Serwis przetwarzania faktur jest tymczasowo niedostępny. Spróbuj ponownie za chwilę lub skontaktuj się z administratorem.",
        },
        { status: 502 },
      )
    }

    let googleData: any = null
    if (googleResponse && googleResponse.ok) {
      try {
        googleData = await googleResponse.json()
      } catch {
        googleData = await googleResponse.text().catch(() => null)
      }
    }

    return NextResponse.json(
      {
        success: true,
        php: phpData,
        google: googleData,
      },
      { status: 200 },
    )
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError"
    console.error("process-invoice error:", error)
    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? "Serwis przetwarzania faktur nie odpowiedział w czasie. Spróbuj ponownie."
          : "Błąd połączenia z serwerem przetwarzania faktur.",
      },
      { status: 502 },
    )
  }
}

