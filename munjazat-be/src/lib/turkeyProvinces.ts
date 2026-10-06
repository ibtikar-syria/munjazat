import type { ContactPointCode } from '../db/schema'

export type TurkeyProvince = {
  nameAr: string
  nameEn: string
  aliases?: string[]
  contactPoint: ContactPointCode
}

const ISTANBUL: ContactPointCode = 'istanbul'
const GAZIANTEP: ContactPointCode = 'gaziantep'
const ANKARA: ContactPointCode = 'ankara'

export const TURKEY_PROVINCES: TurkeyProvince[] = [
  { nameAr: 'أضنة', nameEn: 'Adana', contactPoint: GAZIANTEP },
  { nameAr: 'أديامان', nameEn: 'Adiyaman', aliases: ['Adıyaman'], contactPoint: GAZIANTEP },
  { nameAr: 'أفيون قره حصار', nameEn: 'Afyonkarahisar', contactPoint: ANKARA },
  { nameAr: 'أغري', nameEn: 'Agri', aliases: ['Ağrı'], contactPoint: ANKARA },
  { nameAr: 'أكساراي', nameEn: 'Aksaray', contactPoint: ANKARA },
  { nameAr: 'أماسيا', nameEn: 'Amasya', contactPoint: ANKARA },
  { nameAr: 'أنقرة', nameEn: 'Ankara', contactPoint: ANKARA },
  { nameAr: 'أنطاليا', nameEn: 'Antalya', contactPoint: ISTANBUL },
  { nameAr: 'أردهان', nameEn: 'Ardahan', contactPoint: ANKARA },
  { nameAr: 'أرتوين', nameEn: 'Artvin', contactPoint: ANKARA },
  { nameAr: 'أيدين', nameEn: 'Aydin', aliases: ['Aydın'], contactPoint: ISTANBUL },
  { nameAr: 'بالي كسير', nameEn: 'Balikesir', aliases: ['Balıkesir'], contactPoint: ISTANBUL },
  { nameAr: 'بارتن', nameEn: 'Bartin', aliases: ['Bartın'], contactPoint: ANKARA },
  { nameAr: 'باتمان', nameEn: 'Batman', contactPoint: GAZIANTEP },
  { nameAr: 'بايبورت', nameEn: 'Bayburt', contactPoint: ANKARA },
  { nameAr: 'بيله جك', nameEn: 'Bilecik', contactPoint: ISTANBUL },
  { nameAr: 'بينغول', nameEn: 'Bingol', aliases: ['Bingöl'], contactPoint: ANKARA },
  { nameAr: 'بتليس', nameEn: 'Bitlis', contactPoint: ANKARA },
  { nameAr: 'بولو', nameEn: 'Bolu', contactPoint: ANKARA },
  { nameAr: 'بوردور', nameEn: 'Burdur', contactPoint: ISTANBUL },
  { nameAr: 'بورصة', nameEn: 'Bursa', contactPoint: ISTANBUL },
  { nameAr: 'جنق قلعة', nameEn: 'Canakkale', aliases: ['Çanakkale'], contactPoint: ISTANBUL },
  { nameAr: 'جانقري', nameEn: 'Cankiri', aliases: ['Çankırı'], contactPoint: ANKARA },
  { nameAr: 'جوروم', nameEn: 'Corum', aliases: ['Çorum'], contactPoint: ANKARA },
  { nameAr: 'دنيزلي', nameEn: 'Denizli', contactPoint: ISTANBUL },
  { nameAr: 'ديار بكر', nameEn: 'Diyarbakir', aliases: ['Diyarbakır'], contactPoint: GAZIANTEP },
  { nameAr: 'دوزجة', nameEn: 'Duzce', aliases: ['Düzce'], contactPoint: ANKARA },
  { nameAr: 'أدرنة', nameEn: 'Edirne', contactPoint: ISTANBUL },
  { nameAr: 'إلازيغ', nameEn: 'Elazig', aliases: ['Elazığ'], contactPoint: ANKARA },
  { nameAr: 'أرزينجان', nameEn: 'Erzincan', contactPoint: ANKARA },
  { nameAr: 'أرضروم', nameEn: 'Erzurum', contactPoint: ANKARA },
  { nameAr: 'إسكي شهر', nameEn: 'Eskisehir', aliases: ['Eskişehir'], contactPoint: ANKARA },
  { nameAr: 'غازي عنتاب', nameEn: 'Gaziantep', contactPoint: GAZIANTEP },
  { nameAr: 'غيرسون', nameEn: 'Giresun', contactPoint: ANKARA },
  { nameAr: 'غوموش خانة', nameEn: 'Gumushane', aliases: ['Gümüşhane'], contactPoint: ANKARA },
  { nameAr: 'هكاري', nameEn: 'Hakkari', aliases: ['Hakkâri', 'Hakkari'], contactPoint: ANKARA },
  { nameAr: 'هطاي', nameEn: 'Hatay', contactPoint: GAZIANTEP },
  { nameAr: 'إغدير', nameEn: 'Igdir', aliases: ['Iğdır'], contactPoint: ANKARA },
  { nameAr: 'إسبرطة', nameEn: 'Isparta', contactPoint: ISTANBUL },
  { nameAr: 'إسطنبول', nameEn: 'Istanbul', aliases: ['İstanbul'], contactPoint: ISTANBUL },
  { nameAr: 'إزمير', nameEn: 'Izmir', aliases: ['İzmir'], contactPoint: ISTANBUL },
  { nameAr: 'قهرمان مرعش', nameEn: 'Kahramanmaras', aliases: ['Kahramanmaraş'], contactPoint: GAZIANTEP },
  { nameAr: 'قره بوك', nameEn: 'Karabuk', aliases: ['Karabük'], contactPoint: ANKARA },
  { nameAr: 'كارامان', nameEn: 'Karaman', contactPoint: ANKARA },
  { nameAr: 'قارص', nameEn: 'Kars', contactPoint: ANKARA },
  { nameAr: 'قسطموني', nameEn: 'Kastamonu', contactPoint: ANKARA },
  { nameAr: 'قيصري', nameEn: 'Kayseri', contactPoint: ANKARA },
  { nameAr: 'كلس', nameEn: 'Kilis', contactPoint: GAZIANTEP },
  { nameAr: 'قيريق قلعة', nameEn: 'Kirikkale', aliases: ['Kırıkkale'], contactPoint: ANKARA },
  { nameAr: 'قرقلر إيلي', nameEn: 'Kirklareli', aliases: ['Kırklareli'], contactPoint: ISTANBUL },
  { nameAr: 'قيرشهر', nameEn: 'Kirsehir', aliases: ['Kırşehir'], contactPoint: ANKARA },
  { nameAr: 'قوجا إيلي', nameEn: 'Kocaeli', contactPoint: ISTANBUL },
  { nameAr: 'قونية', nameEn: 'Konya', contactPoint: ANKARA },
  { nameAr: 'كوتاهيا', nameEn: 'Kutahya', aliases: ['Kütahya'], contactPoint: ANKARA },
  { nameAr: 'ملاطية', nameEn: 'Malatya', contactPoint: ANKARA },
  { nameAr: 'مانيسا', nameEn: 'Manisa', contactPoint: ISTANBUL },
  { nameAr: 'ماردين', nameEn: 'Mardin', contactPoint: GAZIANTEP },
  { nameAr: 'مرسين', nameEn: 'Mersin', contactPoint: GAZIANTEP },
  { nameAr: 'موغلا', nameEn: 'Mugla', aliases: ['Muğla'], contactPoint: ISTANBUL },
  { nameAr: 'موش', nameEn: 'Mus', aliases: ['Muş'], contactPoint: ANKARA },
  { nameAr: 'نوشهر', nameEn: 'Nevsehir', aliases: ['Nevşehir'], contactPoint: ANKARA },
  { nameAr: 'نيدة', nameEn: 'Nigde', aliases: ['Niğde'], contactPoint: ANKARA },
  { nameAr: 'أوردو', nameEn: 'Ordu', contactPoint: ANKARA },
  { nameAr: 'عثمانية', nameEn: 'Osmaniye', contactPoint: GAZIANTEP },
  { nameAr: 'ريزة', nameEn: 'Rize', contactPoint: ANKARA },
  { nameAr: 'صقاريا', nameEn: 'Sakarya', contactPoint: ISTANBUL },
  { nameAr: 'سامسون', nameEn: 'Samsun', contactPoint: ANKARA },
  { nameAr: 'شانلي أورفا', nameEn: 'Sanliurfa', aliases: ['Şanlıurfa', 'Urfa'], contactPoint: GAZIANTEP },
  { nameAr: 'سعرد', nameEn: 'Siirt', contactPoint: GAZIANTEP },
  { nameAr: 'سينوب', nameEn: 'Sinop', contactPoint: ANKARA },
  { nameAr: 'شرناخ', nameEn: 'Sirnak', aliases: ['Şırnak'], contactPoint: GAZIANTEP },
  { nameAr: 'سيواس', nameEn: 'Sivas', contactPoint: ANKARA },
  { nameAr: 'تكيرداغ', nameEn: 'Tekirdag', aliases: ['Tekirdağ'], contactPoint: ISTANBUL },
  { nameAr: 'توقات', nameEn: 'Tokat', contactPoint: ANKARA },
  { nameAr: 'طرابزون', nameEn: 'Trabzon', contactPoint: ANKARA },
  { nameAr: 'تونجلي', nameEn: 'Tunceli', contactPoint: ANKARA },
  { nameAr: 'أوشاك', nameEn: 'Usak', aliases: ['Uşak'], contactPoint: ISTANBUL },
  { nameAr: 'وان', nameEn: 'Van', contactPoint: ANKARA },
  { nameAr: 'يالوفا', nameEn: 'Yalova', contactPoint: ISTANBUL },
  { nameAr: 'يوزغات', nameEn: 'Yozgat', contactPoint: ANKARA },
  { nameAr: 'زنغولداق', nameEn: 'Zonguldak', contactPoint: ANKARA },
]

export function normalizePlaceKey(input?: string | null): string {
  if (!input) return ''
  const charMap: Record<string, string> = {
    İ: 'I',
    ı: 'i',
    Ş: 'S',
    ş: 's',
    Ç: 'C',
    ç: 'c',
    Ğ: 'G',
    ğ: 'g',
    Ö: 'O',
    ö: 'o',
    Ü: 'U',
    ü: 'u',
  }
  return input
    .replace(/[İıŞşÇçĞğÖöÜü]/g, (c) => charMap[c] ?? c)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '')
}

export function findTurkeyProvince(name?: string | null): TurkeyProvince | undefined {
  const key = normalizePlaceKey(name)
  if (!key) return undefined
  return TURKEY_PROVINCES.find((province) => {
    const names = [province.nameEn, province.nameAr, ...(province.aliases ?? [])]
    return names.some((item) => normalizePlaceKey(item) === key)
  })
}

export function contactPointFromTurkeyRegion(name?: string | null): ContactPointCode | null {
  return findTurkeyProvince(name)?.contactPoint ?? null
}
