"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { FiSend } from "react-icons/fi";
import { siteCopy } from "@/lib/site-content-copy";

const names = ["name", "phone", "email", "subject", "message"] as const;
type Values = Record<(typeof names)[number], string>;
const subscribeToHydration = () => () => undefined;
const clientReady = () => true;
const serverReady = () => false;

export function ContactForm({ locale }: { locale: string }) {
  const copy = siteCopy(locale);
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const pending = useRef(false);
  const ready = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  const fieldClass =
    "block w-full rounded-xl border border-line bg-surface p-3.5 text-sm leading-7 text-content-strong transition-[border-color,box-shadow] focus:border-brand focus:outline-none focus:shadow-focus aria-invalid:border-red-700";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const phone = values.phone
      .replace(/[۰-۹٠-٩]/g, (digit) =>
        String(digit.charCodeAt(0) - (digit.charCodeAt(0) >= 0x6f0 ? 0x6f0 : 0x660)),
      )
      .replace(/[ ()-]/g, "");
    const found: Partial<Values> = {};
    for (const key of ["name", "subject", "message"] as const)
      if (!values[key].trim()) found[key] = copy.required;
    if (values.name.trim().length < 2) found.name = copy.required;
    if (values.subject.trim().length < 2) found.subject = copy.required;
    if (!/^\+?[0-9]{7,15}$/.test(phone)) found.phone = copy.invalidPhone;
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      found.email = copy.invalidEmail;
    if (values.message.trim().length < 5) found.message = copy.invalidMessage;
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    pending.current = true;
    setState("sending");
    try {
      const response = await fetch("/api/contact-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          phone,
          email: values.email.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error("send");
      setState("success");
      setValues({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch {
      setState("error");
    } finally {
      pending.current = false;
    }
  }

  return (
    <section
      className="rounded-[28px] bg-surface-muted p-[clamp(22px,3.5vw,44px)]"
      aria-labelledby="contact-form-title"
    >
      <div className="max-w-2xl">
        <h2
          className="mt-0 mb-3 text-[clamp(24px,2.6vw,36px)] leading-[1.55] font-black text-content-strong"
          id="contact-form-title"
        >
          {copy.formTitle}
        </h2>
        <p className="mb-7 text-sm leading-7 text-content-muted">{copy.formIntro}</p>
      </div>
      <form noValidate method="post" action="/api/contact-message" onSubmit={submit}>
        <fieldset
          className="m-0 min-w-0 border-0 p-0 disabled:opacity-65"
          disabled={state === "sending"}
        >
          <div className="grid grid-cols-2 gap-5 max-[560px]:grid-cols-1">
            {names.map((name) => (
              <div
                className={
                  name === "email" || ["subject", "message"].includes(name) ? "col-span-full" : ""
                }
                key={name}
              >
                <label className="mb-2 block text-xs font-bold" htmlFor={`contact-${name}`}>
                  {copy[name]}
                  {name !== "email" && (
                    <span className="text-brand" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  )}
                </label>
                {name === "message" ? (
                  <textarea
                    className={`${fieldClass} min-h-36 resize-y`}
                    id={`contact-${name}`}
                    name={name}
                    required
                    maxLength={10000}
                    rows={5}
                    value={values[name]}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [name]: event.target.value }))
                    }
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `${name}-error` : undefined}
                  />
                ) : (
                  <input
                    className={fieldClass}
                    id={`contact-${name}`}
                    name={name}
                    type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
                    dir={name === "email" || name === "phone" ? "ltr" : undefined}
                    autoComplete={
                      name === "name"
                        ? "name"
                        : name === "phone"
                          ? "tel"
                          : name === "email"
                            ? "email"
                            : undefined
                    }
                    required={name !== "email"}
                    maxLength={
                      name === "name" ? 150 : name === "phone" ? 30 : name === "subject" ? 200 : 255
                    }
                    value={values[name]}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [name]: event.target.value }))
                    }
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={errors[name] ? `${name}-error` : undefined}
                  />
                )}
                {errors[name] && (
                  <p id={`${name}-error`} className="mt-2 mb-0 text-xs text-red-700">
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={!ready}
            className="mt-6 inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-0 bg-brand px-6 text-sm font-extrabold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-65"
          >
            {state === "sending" ? copy.sending : copy.submit}
            <FiSend className={locale === "en" ? "" : "-scale-x-100"} aria-hidden="true" />
          </button>
        </fieldset>
        <p
          role="status"
          aria-live="polite"
          className={`m-0 min-h-0 text-sm leading-7 ${state === "success" ? "mt-4 text-brand-strong" : state === "error" ? "mt-4 text-red-700" : ""}`}
        >
          {state === "success" ? copy.success : state === "error" ? copy.error : ""}
        </p>
      </form>
    </section>
  );
}
