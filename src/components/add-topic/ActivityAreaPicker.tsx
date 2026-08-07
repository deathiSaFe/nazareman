'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPinIcon } from '@/components/icons';
import {
  LOCATION_SCOPE_LABELS,
  type ActivityAreaValue,
  type LocationScope,
} from '@/types/topic';

interface ActivityAreaPickerProps {
  value: ActivityAreaValue;
  onChange: (value: ActivityAreaValue) => void;
  /** When false, the street-address + GPS placeholder inputs are hidden and
   *  the address is managed by the caller (e.g. a separate completion field). */
  showAddress?: boolean;
  className?: string;
}

type ProvinceOption = {
  id: string;
  name: string;
  slug: string;
};

type CityOption = {
  id: string;
  name: string;
  slug: string;
};

const SCOPES: readonly LocationScope[] = ['NATIONAL', 'PROVINCE', 'CITY', 'ADDRESS'];

const selectClass =
  'h-12 w-full rounded-2xl bg-white px-4 text-[14px] font-medium text-ink-900 outline-none ring-1 ring-ink-900/10 transition-all duration-200 focus:ring-2 focus:ring-turquoise-600/70 focus:shadow-[0_10px_28px_-12px_rgba(26,99,93,0.35)] disabled:opacity-50';

const inputClass =
  'w-full rounded-2xl bg-white px-4 py-3 text-[14px] font-medium text-ink-900 outline-none ring-1 ring-ink-900/10 transition-all duration-200 placeholder:font-normal placeholder:text-ink-900/30 focus:shadow-[0_10px_28px_-12px_rgba(26,99,93,0.35)] focus:ring-2 focus:ring-turquoise-600/70';

export function ActivityAreaPicker({
  value,
  onChange,
  showAddress = true,
  className = '',
}: ActivityAreaPickerProps) {
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [citiesByProvince, setCitiesByProvince] = useState<
    Record<string, CityOption[]>
  >({});
  const fetchedProvincesRef = useRef<Set<string>>(new Set());

  const { scope } = value;
  const showProvince = scope === 'PROVINCE' || scope === 'CITY' || scope === 'ADDRESS';
  const showCity = scope === 'CITY' || scope === 'ADDRESS';
  const showAddressInput = showAddress && scope === 'ADDRESS';

  const cities = value.provinceSlug ? citiesByProvince[value.provinceSlug] : undefined;
  const citiesLoading = Boolean(value.provinceSlug) && cities === undefined;

  useEffect(() => {
    let active = true;

    fetch('/api/provinces')
      .then((response) => response.json())
      .then((data: ProvinceOption[]) => {
        if (active) setProvinces(data);
      })
      .catch(() => {
        if (active) setProvinces([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!value.provinceSlug) return;
    if (fetchedProvincesRef.current.has(value.provinceSlug)) return;

    fetchedProvincesRef.current.add(value.provinceSlug);

    let active = true;

    fetch(`/api/cities?province=${encodeURIComponent(value.provinceSlug)}`)
      .then((response) => response.json())
      .then((data: CityOption[]) => {
        if (active) {
          setCitiesByProvince((prev) => ({
            ...prev,
            [value.provinceSlug as string]: data,
          }));
        }
      })
      .catch(() => {
        if (active) {
          setCitiesByProvince((prev) => ({
            ...prev,
            [value.provinceSlug as string]: [],
          }));
        }
      });

    return () => {
      active = false;
    };
  }, [value.provinceSlug]);

  const selectScope = (next: LocationScope) => {
    const nextValue: ActivityAreaValue = {
      scope: next,
      ...(next === 'NATIONAL'
        ? {}
        : { provinceSlug: value.provinceSlug, provinceName: value.provinceName }),
      ...(next === 'CITY' || next === 'ADDRESS'
        ? { citySlug: value.citySlug, cityName: value.cityName }
        : {}),
      ...(next === 'ADDRESS' ? { address: value.address } : {}),
    };

    onChange(nextValue);
  };

  const selectProvince = (slug: string) => {
    const province = provinces.find((item) => item.slug === slug);

    onChange({
      ...value,
      provinceSlug: slug || undefined,
      provinceName: province?.name,
      citySlug: undefined,
      cityName: undefined,
    });
  };

  const selectCity = (slug: string) => {
    const city = (cities ?? []).find((item) => item.slug === slug);

    onChange({
      ...value,
      citySlug: slug || undefined,
      cityName: city?.name,
    });
  };

  return (
    <div className={className}>
      <fieldset>
        <legend className="mb-2 block text-[13px] font-bold text-ink-900">
          این مورد در چه محدوده‌ای فعالیت می‌کند؟
        </legend>

        <div className="space-y-1.5">
          {SCOPES.map((item) => (
            <label
              key={item}
              className={`flex cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-2.5 ring-1 transition-all duration-200 ${
                scope === item
                  ? 'bg-turquoise-50 ring-2 ring-turquoise-600'
                  : 'bg-white ring-ink-900/10 hover:ring-turquoise-600/40'
              }`}
            >
              <input
                type="radio"
                name="activity-scope"
                value={item}
                checked={scope === item}
                onChange={() => selectScope(item)}
                className="size-4 shrink-0 accent-turquoise-600"
              />
              <span className="text-[13px] font-semibold text-ink-900">
                {LOCATION_SCOPE_LABELS[item]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {showProvince && (
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-2 block text-[13px] font-bold text-ink-900">کشور</span>
            <div className="relative">
              <select
                value="IR"
                disabled
                aria-label="کشور"
                className={`${selectClass} opacity-60`}
              >
                <option value="IR">ایران</option>
              </select>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[13px] font-bold text-ink-900">استان</span>
            <div className="relative">
              <select
                value={value.provinceSlug ?? ''}
                onChange={(event) => selectProvince(event.target.value)}
                aria-label="استان"
                className={selectClass}
              >
                <option value="">انتخاب استان</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.slug}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          </label>

          {showCity && (
            <label className="block">
              <span className="mb-2 block text-[13px] font-bold text-ink-900">شهر</span>
              <div className="relative">
                <select
                  value={value.citySlug ?? ''}
                  onChange={(event) => selectCity(event.target.value)}
                  disabled={!value.provinceSlug || citiesLoading}
                  aria-label="شهر"
                  className={selectClass}
                >
                  <option value="">
                    {citiesLoading
                      ? 'در حال بارگذاری...'
                      : value.provinceSlug
                        ? 'انتخاب شهر'
                        : 'ابتدا استان را انتخاب کنید'}
                  </option>
                  {(cities ?? []).map((city) => (
                    <option key={city.id} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          )}

          {showAddressInput && (
            <label className="block">
              <span className="mb-2 block text-[13px] font-bold text-ink-900">نشانی خیابان</span>
              <input
                type="text"
                value={value.address ?? ''}
                onChange={(event) =>
                  onChange({ ...value, address: event.target.value })
                }
                placeholder="مثلاً: خیابان انقلاب، کوچه بهار"
                aria-label="نشانی خیابان"
                className={inputClass}
              />
            </label>
          )}

          {showAddressInput && (
            <div
              aria-hidden="true"
              className="flex items-center gap-3 rounded-2xl bg-ink-900/[0.03] px-4 py-3 ring-1 ring-ink-900/[0.06]"
            >
              <MapPinIcon className="size-5 shrink-0 text-ink-900/30" />
              <p className="text-[13px] leading-6 text-ink-900/45">
                موقعیت مکانی دقیق در این نسخه ثبت نمی‌شود — امکان انتخاب نقطه روی
                نقشه به‌زودی اضافه می‌شود.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
