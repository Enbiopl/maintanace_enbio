// Lista błędów autokławu
export const AUTOCLAVE_ERRORS = [
  { id: "error1", label: "Error no. 1 - Chamber over temperature" },
  { id: "error2", label: "Error no. 2 - Steam generator over temperature" },
  { id: "error3", label: "Error no. 3 - Process over temperature" },
  { id: "error4", label: "Error no. 4 - Overpressure error" },
  { id: "error5", label: "Error no. 5 - Sterilization pressure too low" },
  { id: "error6", label: "Error no. 6 - Sterilization temp. too low" },
  { id: "error8", label: "Error no. 8 - Too many steam pulses / no water" },
  { id: "error9", label: "Error no. 9 - Drainage error" },
  { id: "error10", label: "Error no. 10 - Chamber heating error" },
  { id: "error11", label: "Error no. 11 - Steam generator heating error" },
  { id: "error12", label: "Error no. 12 - Prevaccuum fail / check outlet" },
  { id: "error13", label: "Error no. 13 - Power failure" },
  { id: "error14", label: "Error no. 14 - Pressure durning standby" },
  { id: "error15", label: "Error no. 15 - Locking door error" },
  { id: "error16", label: "Error no. 16 - Unlocking door error" },
  { id: "error17", label: "Error no. 17 - Valve V3 / HEPA filter error" },
  { id: "error18", label: "Error no. 18 - Pressure sensor error" },
  { id: "error19", label: "Error no. 19 - USB disc error / Change disc" },
  { id: "error20", label: "Error no. 20 - Min. chamber temperature" },
  { id: "error21", label: "Error no. 21 - Chamber temperature sensor failure" },
  { id: "error22", label: "Error no. 22 - Steam gen. temp. sensor failure" },
  { id: "error23", label: "Error no. 23 - Process temp. sensor failure" },
  { id: "error24", label: "Error no. 24 - Autoclave has to low temperature" },
  { id: "error31", label: "Error no. 31 - Internal flash error" },
]

// Lista błędów autokławu
export const ACCESSORIES_ERRORS = [
  { id: "damaged", label: "Produkt uszkodzony" },
  { id: "not-this-item", label: "Nie ten przedmiot" },
  { id: "other", label: "Inny przedmiot" },
]

// Funkcja pomocnicza do konwersji ID błędu na pełną etykietę
export function getErrorLabel(errorId: string): string {
  const error = AUTOCLAVE_ERRORS.find((err) => err.id === errorId)
  return error ? error.label : errorId
}

// Funkcja pomocnicza do konwersji ID błędu na pełną etykietę
export function getAccessoriesErrorLabel(errorId: string): string {
  const error = ACCESSORIES_ERRORS.find((err) => err.id === errorId)
  return error ? error.label : errorId
}

