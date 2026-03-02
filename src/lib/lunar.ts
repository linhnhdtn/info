// eslint-disable-next-line @typescript-eslint/no-require-imports
const { convertSolar2Lunar, convertLunar2Solar } = require("amlich")

const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]
const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]
const CON_GIAP = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"]

export interface LunarDateInfo {
  lunarDay: number
  lunarMonth: number
  lunarYear: number
  isLeapMonth: boolean
  canChiYear: string
  conGiap: string
  canChiDay: string
}

function getCanChiYear(lunarYear: number): string {
  const canIndex = (lunarYear + 6) % 10
  const chiIndex = (lunarYear + 8) % 12
  return `${THIEN_CAN[canIndex]} ${DIA_CHI[chiIndex]}`
}

function getConGiap(lunarYear: number): string {
  const chiIndex = (lunarYear + 8) % 12
  return CON_GIAP[chiIndex]
}

function getCanChiDay(dd: number, mm: number, yy: number): string {
  // Tính Julian Day Number rồi tính Can Chi ngày
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  const jdn = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  const canIndex = (jdn + 9) % 10
  const chiIndex = (jdn + 1) % 12
  return `${THIEN_CAN[canIndex]} ${DIA_CHI[chiIndex]}`
}

export function getSolarFromLunar(lunarDay: number, lunarMonth: number, lunarYear: number, isLeapMonth: boolean): { day: number; month: number; year: number } {
  const timeZone = 7
  const [day, month, year] = convertLunar2Solar(lunarDay, lunarMonth, lunarYear, isLeapMonth ? 1 : 0, timeZone) as [number, number, number]
  return { day, month, year }
}

export { getCanChiYear, getConGiap, getCanChiDay }

export function getLunarDateInfo(date: Date): LunarDateInfo {
  const dd = date.getDate()
  const mm = date.getMonth() + 1
  const yy = date.getFullYear()
  const timeZone = 7 // Vietnam UTC+7

  const [lunarDay, lunarMonth, lunarYear, lunarLeap] = convertSolar2Lunar(dd, mm, yy, timeZone) as [number, number, number, number]

  return {
    lunarDay,
    lunarMonth,
    lunarYear,
    isLeapMonth: lunarLeap === 1,
    canChiYear: getCanChiYear(lunarYear),
    conGiap: getConGiap(lunarYear),
    canChiDay: getCanChiDay(dd, mm, yy),
  }
}
