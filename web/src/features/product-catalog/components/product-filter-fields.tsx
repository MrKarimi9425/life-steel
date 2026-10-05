"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductFilters } from "@/lib/api";
import { FilterAccordion } from "./filter-accordion";
import { FilterChoiceInput } from "./filter-choice-input";
import {
  encodeAttributeSelections,
  parseAttributeSelections,
  type AttributeFilterSelections,
} from "../lib/attribute-filter-query";
import { productCatalogCopy } from "../product-catalog.copy";
import { queryValue, type ProductCatalogQuery } from "../lib/catalog-query";

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-content-strong outline-none transition-colors placeholder:text-content-subtle focus:border-brand focus:ring-2 focus:ring-brand/10";
const choiceClass =
  "flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-content transition-colors hover:bg-surface-muted";

export function ProductFilterFields({
  locale,
  filters,
  options,
}: {
  locale: string;
  filters: ProductCatalogQuery;
  options: ProductFilters;
}) {
  const router = useRouter();
  const copy = productCatalogCopy(locale);
  const initialSelections = parseAttributeSelections(filters);
  const [categoryId, setCategoryId] = useState(queryValue(filters, "categoryId"));
  const [selections, setSelections] = useState<AttributeFilterSelections>(initialSelections);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => ({
    category: true,
    ...Object.fromEntries(Object.keys(initialSelections).map((id) => [id, true])),
  }));

  const updateSelection = (
    attributeId: string,
    update: (current: AttributeFilterSelections[string]) => AttributeFilterSelections[string],
  ) => {
    setSelections((current) => {
      const value = current[attributeId] ?? {
        optionIds: [],
        minimum: "",
        maximum: "",
        booleanValue: "",
        present: false,
      };
      const next = { ...current, [attributeId]: update(value) };
      const selected = next[attributeId];
      if (
        selected &&
        !selected.optionIds.length &&
        !selected.minimum &&
        !selected.maximum &&
        !selected.booleanValue &&
        !selected.present
      ) {
        delete next[attributeId];
      }
      return next;
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = new URLSearchParams();
    const values = {
      search: String(data.get("search") ?? "").trim(),
      categoryId,
      minPrice: String(data.get("minPrice") ?? "").trim(),
      maxPrice: String(data.get("maxPrice") ?? "").trim(),
      sort: queryValue(filters, "sort"),
    };
    for (const [key, value] of Object.entries(values)) {
      if (value) query.set(key, value);
    }
    encodeAttributeSelections(selections).forEach((value) =>
      query.append("attributeFilters", value),
    );
    router.push(`/${locale}/products${query.size ? `?${query}` : ""}`);
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={submit}>
      <label className="flex flex-col gap-2 text-sm font-bold text-content-strong">
        {copy.search}
        <input
          className={fieldClass}
          name="search"
          defaultValue={queryValue(filters, "search")}
          placeholder={copy.search}
        />
      </label>
      <div className="flex flex-col gap-3">
        <FilterAccordion
          title={copy.categories}
          open={Boolean(openSections.category)}
          selectedCount={categoryId ? 1 : 0}
          onToggle={() =>
            setOpenSections((current) => ({ ...current, category: !current.category }))
          }
        >
          <label className={choiceClass}>
            <FilterChoiceInput
              type="radio"
              name="catalog-category"
              checked={!categoryId}
              onChange={() => setCategoryId("")}
            />
            {copy.allCategories}
          </label>
          {options.categories.map((category) => (
            <label className={choiceClass} key={category.id}>
              <FilterChoiceInput
                type="radio"
                name="catalog-category"
                checked={categoryId === category.id}
                onChange={() => setCategoryId(category.id)}
              />
              {category.translations[0]?.title}
            </label>
          ))}
        </FilterAccordion>
        {options.attributes.map((attribute) => {
          const selection = selections[attribute.id];
          const selectedCount = selection
            ? selection.optionIds.length ||
              Number(Boolean(selection.minimum || selection.maximum)) ||
              Number(Boolean(selection.booleanValue)) ||
              Number(selection.present)
            : 0;
          return (
            <FilterAccordion
              key={attribute.id}
              title={attribute.translations[0]?.name ?? copy.attributes}
              open={Boolean(openSections[attribute.id])}
              selectedCount={selectedCount}
              onToggle={() =>
                setOpenSections((current) => ({
                  ...current,
                  [attribute.id]: !current[attribute.id],
                }))
              }
            >
              {["SINGLE_SELECT", "MULTI_SELECT", "COLOR"].includes(attribute.type) &&
                attribute.options.map((option) => {
                  const checked = selection?.optionIds.includes(option.id) ?? false;
                  return (
                    <label className={choiceClass} key={option.id}>
                      <FilterChoiceInput
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          updateSelection(attribute.id, (current) => ({
                            ...current,
                            optionIds: checked
                              ? current.optionIds.filter((id) => id !== option.id)
                              : [...current.optionIds, option.id],
                          }))
                        }
                      />
                      {attribute.type === "COLOR" && option.colorHex && (
                        <span
                          className="h-4 w-4 shrink-0 rounded-full border border-line"
                          style={{ backgroundColor: option.colorHex }}
                          aria-hidden="true"
                        />
                      )}
                      {option.translations[0]?.label}
                    </label>
                  );
                })}
              {attribute.type === "NUMBER" && (
                <div className="grid grid-cols-1 gap-2">
                  <input
                    className={fieldClass}
                    type="number"
                    value={selection?.minimum ?? ""}
                    placeholder={copy.min}
                    onChange={(event) =>
                      updateSelection(attribute.id, (current) => ({
                        ...current,
                        minimum: event.target.value,
                      }))
                    }
                  />
                  <input
                    className={fieldClass}
                    type="number"
                    value={selection?.maximum ?? ""}
                    placeholder={copy.max}
                    onChange={(event) =>
                      updateSelection(attribute.id, (current) => ({
                        ...current,
                        maximum: event.target.value,
                      }))
                    }
                  />
                </div>
              )}
              {attribute.type === "BOOLEAN" &&
                [
                  { value: "", label: copy.all },
                  { value: "true", label: copy.yes },
                  { value: "false", label: copy.no },
                ].map((item) => (
                  <label className={choiceClass} key={item.value || "all"}>
                    <FilterChoiceInput
                      type="radio"
                      name={`attribute-${attribute.id}-boolean`}
                      checked={(selection?.booleanValue ?? "") === item.value}
                      onChange={() =>
                        updateSelection(attribute.id, (current) => ({
                          ...current,
                          booleanValue: item.value as "" | "true" | "false",
                        }))
                      }
                    />
                    {item.label}
                  </label>
                ))}
              {["SHORT_TEXT", "LONG_TEXT"].includes(attribute.type) && (
                <label className={choiceClass}>
                  <FilterChoiceInput
                    type="checkbox"
                    checked={selection?.present ?? false}
                    onChange={(event) =>
                      updateSelection(attribute.id, (current) => ({
                        ...current,
                        present: event.target.checked,
                      }))
                    }
                  />
                  {copy.hasValue}
                </label>
              )}
            </FilterAccordion>
          );
        })}
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold text-content-strong">{copy.price}</legend>
        <div className="grid grid-cols-1 gap-2">
          <input
            className={fieldClass}
            name="minPrice"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={queryValue(filters, "minPrice")}
            placeholder={copy.minPrice}
          />
          <input
            className={fieldClass}
            name="maxPrice"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={queryValue(filters, "maxPrice")}
            placeholder={copy.maxPrice}
          />
        </div>
      </fieldset>
      <button
        className="h-11 rounded-xl bg-brand px-4 text-sm font-extrabold text-content-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        type="submit"
      >
        {copy.apply}
      </button>
      <Link
        className="text-center text-sm font-bold text-content-muted transition-colors hover:text-brand"
        href={`/${locale}/products`}
      >
        {copy.clear}
      </Link>
    </form>
  );
}
