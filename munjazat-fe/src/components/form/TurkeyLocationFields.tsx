import { useEffect, useMemo, useState } from 'react'
import type { City, State } from 'react-country-state-city/dist/esm/types'
import { turkeyProvinceLabelAr } from '../../data/turkeyProvinces'
import { SearchableSelectField } from './SearchableSelectField'

const countryStateCityModulePromise = import('react-country-state-city')

export type TurkeyLocationValue = {
  region: string
  city: string
}

type TurkeyLocationFieldsProps = {
  value: TurkeyLocationValue
  onChange: (next: TurkeyLocationValue) => void
}

export function TurkeyLocationFields({ value, onChange }: TurkeyLocationFieldsProps) {
  const [selectedStateId, setSelectedStateId] = useState(0)
  const [turkeyCountryId, setTurkeyCountryId] = useState(0)
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])

  useEffect(() => {
    let isActive = true

    countryStateCityModulePromise
      .then(async ({ GetCountries, GetState }) => {
        const countries = await GetCountries()
        const turkey = countries.find(
          (country) => country.iso2?.toUpperCase() === 'TR' || country.name === 'Turkey',
        )
        if (!turkey) return { countryId: 0, nextStates: [] as State[] }
        const nextStates = await GetState(turkey.id)
        return { countryId: turkey.id, nextStates }
      })
      .then(({ countryId, nextStates }) => {
        if (!isActive) return
        setTurkeyCountryId(countryId)
        setStates(nextStates)
      })
      .catch(() => {
        if (!isActive) return
        setStates([])
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (selectedStateId > 0 || !value.region || states.length === 0) return
    const matched = states.find((state) => state.name.trim().toLowerCase() === value.region.trim().toLowerCase())
    if (matched) setSelectedStateId(matched.id)
  }, [selectedStateId, states, value.region])

  useEffect(() => {
    let isActive = true

    if (!turkeyCountryId || !selectedStateId) {
      setCities([])
      return
    }

    countryStateCityModulePromise
      .then(({ GetCity }) => GetCity(turkeyCountryId, selectedStateId))
      .then((nextCities) => {
        if (!isActive) return
        setCities(nextCities)
      })
      .catch(() => {
        if (!isActive) return
        setCities([])
      })

    return () => {
      isActive = false
    }
  }, [selectedStateId, turkeyCountryId])

  const stateOptions = useMemo(
    () =>
      states.map((state) => {
        const labelAr = turkeyProvinceLabelAr(state.name)
        return {
          value: String(state.id),
          label: labelAr,
          secondaryLabel: state.name !== labelAr ? state.name : undefined,
          searchText: `${labelAr} ${state.name} ${state.state_code ?? ''}`,
        }
      }),
    [states],
  )

  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        value: city.name,
        label: city.name,
        searchText: `${city.name} ${value.region}`,
      })),
    [cities, value.region],
  )

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SearchableSelectField
        id="turkey-province"
        label="المحافظة"
        required
        placeholder="ابحث عن المحافظة…"
        emptyMessage="لا توجد محافظة مطابقة"
        value={selectedStateId ? String(selectedStateId) : ''}
        options={stateOptions}
        onChange={(nextValue) => {
          if (!nextValue) {
            setSelectedStateId(0)
            onChange({ region: '', city: '' })
            return
          }
          const state = states.find((item) => String(item.id) === nextValue)
          if (!state) return
          setSelectedStateId(state.id)
          onChange({ region: state.name, city: '' })
        }}
      />

      <SearchableSelectField
        id="turkey-city"
        label="المدينة"
        required
        disabled={!selectedStateId}
        placeholder={selectedStateId ? 'ابحث عن المدينة…' : 'اختر المحافظة أولاً'}
        emptyMessage="لا توجد مدينة مطابقة"
        value={value.city}
        options={cityOptions}
        onChange={(nextValue) => onChange({ region: value.region, city: nextValue })}
      />
    </div>
  )
}
