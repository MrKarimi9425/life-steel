import type { ProductCatalogQuery } from "./catalog-query";
import { queryValue, queryValues } from "./catalog-query";

export type AttributeFilterSelection = {
  optionIds: string[];
  minimum: string;
  maximum: string;
  booleanValue: "" | "true" | "false";
  present: boolean;
};

export type AttributeFilterSelections = Record<string, AttributeFilterSelection>;

const emptySelection = (): AttributeFilterSelection => ({
  optionIds: [],
  minimum: "",
  maximum: "",
  booleanValue: "",
  present: false,
});

export function parseAttributeSelections(filters: ProductCatalogQuery): AttributeFilterSelections {
  const selections: AttributeFilterSelections = {};
  for (const token of queryValues(filters, "attributeFilters")) {
    const [attributeId, operator, value] = token.split(":");
    if (!attributeId || !operator || value === undefined) continue;
    const selection = selections[attributeId] ?? emptySelection();
    let recognized = true;
    if (operator === "option" && !selection.optionIds.includes(value)) {
      selection.optionIds.push(value);
    } else if (operator === "min") selection.minimum = value;
    else if (operator === "max") selection.maximum = value;
    else if (operator === "boolean" && (value === "true" || value === "false")) {
      selection.booleanValue = value;
    } else if (operator === "present" && value === "true") selection.present = true;
    else recognized = false;
    if (recognized) selections[attributeId] = selection;
  }

  const legacyAttributeId = queryValue(filters, "attributeId");
  if (legacyAttributeId && !selections[legacyAttributeId]) {
    selections[legacyAttributeId] = {
      optionIds: queryValue(filters, "optionId") ? [queryValue(filters, "optionId")] : [],
      minimum: queryValue(filters, "minNumber"),
      maximum: queryValue(filters, "maxNumber"),
      booleanValue: ["true", "false"].includes(queryValue(filters, "booleanValue"))
        ? (queryValue(filters, "booleanValue") as "true" | "false")
        : "",
      present:
        !queryValue(filters, "optionId") &&
        !queryValue(filters, "minNumber") &&
        !queryValue(filters, "maxNumber") &&
        !queryValue(filters, "booleanValue"),
    };
  }
  return selections;
}

export function encodeAttributeSelections(selections: AttributeFilterSelections): string[] {
  return Object.entries(selections).flatMap(([attributeId, selection]) => {
    if (selection.optionIds.length) {
      return selection.optionIds.map((optionId) => `${attributeId}:option:${optionId}`);
    }
    const values: string[] = [];
    if (selection.minimum) values.push(`${attributeId}:min:${selection.minimum}`);
    if (selection.maximum) values.push(`${attributeId}:max:${selection.maximum}`);
    if (selection.booleanValue) {
      values.push(`${attributeId}:boolean:${selection.booleanValue}`);
    }
    if (!values.length && selection.present) values.push(`${attributeId}:present:true`);
    return values;
  });
}

export function selectedAttributeCount(filters: ProductCatalogQuery): number {
  return Object.keys(parseAttributeSelections(filters)).length;
}
