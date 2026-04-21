"use client";

interface SortSelectProps {
  sort: string;
  ageGroup: string;
  typeFilter?: string;
}

export default function SortSelect({ sort, ageGroup, typeFilter }: SortSelectProps) {
  return (
    <select
      defaultValue={sort}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort", e.target.value);
        window.location.href = url.toString();
      }}
      className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-secondary-400"
    >
      <option value="newest">الأحدث</option>
      <option value="price-asc">السعر: الأقل</option>
      <option value="price-desc">السعر: الأعلى</option>
    </select>
  );
}
